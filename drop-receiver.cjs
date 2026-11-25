const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const QRCode = require('./vendor/qrcode');
const { M } = require('./vendor/qrcode/QRErrorCorrectLevel');

const SESSION_MS = 10 * 60 * 1000;
const MAX_FILE_BYTES = 512 * 1024 * 1024;
const PARTIAL_PREFIX = '.nova-upload-';

function getLanAddress() {
  const adapters = Object.entries(os.networkInterfaces());
  adapters.sort(([a], [b]) => Number(/wi.?fi|wireless/i.test(b)) - Number(/wi.?fi|wireless/i.test(a)));
  return adapters.flatMap(([, addresses]) => addresses ?? []).find((address) =>
    address.family === 'IPv4' && !address.internal && !address.address.startsWith('169.254.')
  )?.address;
}

function makeQr(url) {
  const qr = new QRCode(-1, M);
  qr.addData(url);
  qr.make();
  const count = qr.getModuleCount();
  const modules = [];
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      if (qr.isDark(y, x)) modules.push('M' + (x + 4) + ',' + (y + 4) + 'h1v1h-1z');
    }
  }
  const size = count + 8;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="white"/><path d="' + modules.join('') + '"/></svg>';
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

function safeName(value) {
  const name = path.win32.basename(value || 'file').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/[. ]+$/g, '').slice(0, 180).replace(/[. ]+$/g, '');
  if (!name || name.startsWith(PARTIAL_PREFIX) || /^(con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(name)) return 'received-' + name;
  return name;
}

function sizeLabel(bytes) {
  return bytes >= 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.ceil(bytes / 1024)) + ' KB';
}

const phonePage = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>NOVA Drop</title>' +
  '<style>body{background:#15132a;color:#f7f3ff;font:16px system-ui;padding:24px;margin:auto;max-width:460px}main{border:1px solid #655688;background:#23203e;padding:24px;border-radius:24px;margin-top:12vh}h1{margin:0;color:#c9b8ff}input,button{margin:10px 0;max-width:100%;font:inherit}button{background:#c9b8ff;color:#20193a;border:0;padding:8px 16px;border-radius:12px}</style>' +
  '<main><h1>NOVA Drop</h1><p>Send a file to your PC over this network. Up to 512 MB per file.</p><form><label for="file">Choose a file</label><br><input id="file" type="file" required><br><button>Send to PC</button></form><p role="status"></p></main>' +
  '<script>const form=document.querySelector("form"), status=document.querySelector("[role=status]"); form.onsubmit=async(e)=>{e.preventDefault();const file=document.querySelector("#file").files[0];if(!file)return;if(file.size>536870912){status.textContent="Choose a file under 512 MB.";return;}const button=form.querySelector("button");button.disabled=true;status.textContent="Sending...";try{const response=await fetch(location.pathname+"/upload?filename="+encodeURIComponent(file.name),{method:"POST",headers:{"Content-Type":"application/octet-stream"},body:file});if(!response.ok)throw new Error(await response.text());const result=await response.json();status.textContent="Saved to your PC as "+result.fileName;form.reset();}catch(error){status.textContent="Transfer failed. "+error.message;}finally{button.disabled=false;}};</script></html>';

function createDropReceiver({ directory, onFile = () => {}, onSession = () => {}, getAddress = getLanAddress, createHttpServer = http.createServer }) {
  let session;
  let starting;
  let stopping;
  const info = () => session?.info ?? { active: false };
  const stop = () => {
    if (stopping) return stopping;
    if (starting) return starting.then(() => stop(), () => info());
    if (!session) return Promise.resolve(info());
    const { server, expiry } = session;
    session = undefined;
    clearTimeout(expiry);
    onSession(info());
    stopping = new Promise((resolve) => {
      server.close(() => resolve(info()));
      server.closeAllConnections();
    }).finally(() => { stopping = undefined; });
    return stopping;
  };

  async function receive(request, response, url) {
    const fileName = safeName(url.searchParams.get('filename'));
    const declaredLength = Number(request.headers['content-length']);
    if (!Number.isInteger(declaredLength) || declaredLength < 0 || request.headers['content-type'] !== 'application/octet-stream') {
      response.writeHead(400).end('Send a single file.');
      return;
    }
    if (declaredLength > MAX_FILE_BYTES) {
      response.writeHead(413).end('Choose a file under 512 MB.');
      return;
    }
    const temporary = path.join(directory, PARTIAL_PREFIX + randomBytes(16).toString('hex'));
    let bytes = 0;
    try {
      const counter = new Transform({
        transform(chunk, _encoding, callback) {
          bytes += chunk.length;
          callback(bytes > declaredLength ? new Error('Upload limit exceeded') : null, chunk);
        },
      });
      await pipeline(request, counter, fs.createWriteStream(temporary, { flags: 'wx' }));
      if (bytes !== declaredLength) throw new Error('Incomplete transfer');
      const extension = path.extname(fileName);
      const base = path.basename(fileName, extension);
      for (let attempt = 0; attempt < 1000; attempt++) {
        const name = attempt ? base + ' (' + attempt + ')' + extension : fileName;
        const fullPath = path.join(directory, name);
        try {
          await fs.promises.link(temporary, fullPath);
        } catch (error) {
          if (error.code === 'EEXIST') continue;
          throw error;
        }
        onFile({ fileName: name, fileSize: sizeLabel(bytes), fullPath, timestamp: Date.now() });
        response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ fileName: name }));
        return;
      }
      throw new Error('Too many duplicate names');
    } catch {
      if (!response.destroyed) response.writeHead(500).end('The PC could not save this file.');
    } finally {
      await fs.promises.unlink(temporary).catch(() => {});
    }
  }

  function start() {
    if (session) return Promise.resolve(info());
    if (starting) return starting;
    if (stopping) return stopping.then(start);
    starting = (async () => {
      const ip = getAddress();
      if (!ip) throw new Error('Connect this PC to Wi-Fi or Ethernet to receive files.');
      await fs.promises.mkdir(directory, { recursive: true });
      const route = '/' + randomBytes(16).toString('hex');
      const server = createHttpServer({ requestTimeout: SESSION_MS }, (request, response) => {
        response.setHeader('Cache-Control', 'no-store');
        response.setHeader('Referrer-Policy', 'no-referrer');
        response.setHeader('X-Content-Type-Options', 'nosniff');
          let url;
        try { url = new URL(request.url, 'http://localhost'); } catch {
          response.writeHead(400).end('Invalid request.');
          return;
        }
        if (request.method === 'GET' && url.pathname === route) {
          response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(phonePage);
        } else if (request.method === 'POST' && url.pathname === route + '/upload') {
          void receive(request, response, url);
        } else {
          response.writeHead(404).end('Pairing link unavailable.');
        }
      });
      const listen = (port) => new Promise((resolve, reject) => {
        const fail = (error) => reject(error);
        server.once('error', fail);
        server.listen(port, ip, () => {
          server.off('error', fail);
          resolve();
        });
      });
      try {
        await listen(5980);
      } catch (error) {
        if (error.code !== 'EADDRINUSE') throw error;
        await listen(0);
      }
      const port = server.address().port;
      const url = 'http://' + ip + ':' + port + route;
      let qrImage;
      try {
        qrImage = makeQr(url);
      } catch (error) {
        server.close();
        throw error;
      }
      server.on('error', () => { void stop(); });
      const expiry = setTimeout(() => void stop(), SESSION_MS);
      expiry.unref();
      session = { server, expiry, info: { active: true, ip, port, url, qrImage, expiresAt: Date.now() + SESSION_MS } };
      onSession(info());
      return info();
    })().finally(() => { starting = undefined; });
    return starting;
  }

  async function list() {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true }).catch((error) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    });
    const files = await Promise.all(entries.filter((entry) => entry.isFile() && !entry.name.startsWith(PARTIAL_PREFIX)).map(async (entry) => {
      const stat = await fs.promises.stat(path.join(directory, entry.name)).catch(() => null);
      return stat ? { name: entry.name, size: sizeLabel(stat.size), timestamp: stat.mtimeMs } : null;
    }));
    return files.filter(Boolean).sort((a, b) => b.timestamp - a.timestamp);
  }

  return { info, start, stop, list };
}

module.exports = { createDropReceiver };
