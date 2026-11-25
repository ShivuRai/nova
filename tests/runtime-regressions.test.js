import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import bounds from '../window-bounds.cjs';
import drop from '../drop-receiver.cjs';
import { calculate } from '../src/services/calculate.ts';
import { convertText } from '../src/services/units.ts';
import { useTimerStore } from '../src/stores/useTimerStore.ts';

test('native bounds stay inside non-primary work areas and fit the visible pill', () => {
  const area = { x: -1280, y: 40, width: 1280, height: 680 };
  assert.deepEqual(bounds.calculateIslandBounds(area, { width: 268, height: 38 }), {
    width: 284, height: 48, x: -782, y: 40,
  });
  assert.deepEqual(bounds.calculateIslandBounds(area, {
    width: 135, height: 8, position: 'bottom-right', sideMargin: 21, topOffset: 12, isRetracted: true,
  }), { width: 151, height: 14, x: -172, y: 706 });
  assert.equal(bounds.calculateIslandBounds(area, { width: 268, height: 38, isAiWhisperOpen: true }).height, 340);
  const small = { x: 0, y: 0, width: 400, height: 300 };
  assert.deepEqual(bounds.calculateIslandBounds(small, { width: 640, height: 395, expanded: true }), small);
});

test('command tools apply arithmetic precedence and use the same unit rates as the converter', () => {
  assert.equal(calculate('-(2 + 3) * 4 + 2^3^2'), 492);
  assert.equal(calculate('48 / 3'), 16);
  assert.equal(calculate('10 / 0'), null);
  assert.equal(calculate('2(3)'), null);
  assert.equal(calculate('Math.random()'), null);
  assert.match(convertText('12 km to miles'), /^7[.,]4565 mile$/);
  assert.match(convertText('50 USD in INR'), /INR \(estimate\)$/);
  assert.equal(convertText('2 km to kg'), null);
});

test('a custom timer tracks elapsed wall time and preserves extensions when paused', (t) => {
  t.mock.method(Date, 'now', () => 100000);
  const { setMode, start, tick, pause, extend } = useTimerStore.getState();
  const seconds = () => useTimerStore.getState().secondsRemaining;
  setMode('pomodoro');
  start(90);
  t.mock.method(Date, 'now', () => 117000);
  tick();
  assert.equal(seconds(), 73);
  extend(60);
  assert.equal(seconds(), 133);
  pause();
  t.mock.method(Date, 'now', () => 200000);
  tick();
  assert.equal(seconds(), 133);
  start();
  t.mock.method(Date, 'now', () => 400000);
  tick();
  assert.equal(seconds(), 0);
  assert.equal(useTimerStore.getState().isRunning, false);
});

test('NOVA Drop stays off until paired, falls back from a busy port, and never overwrites existing files', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'nova-drop-test-'));
  const blocker = createServer();
  await new Promise((resolve, reject) => {
    blocker.on('error', (error) => error.code === 'EADDRINUSE' ? resolve() : reject(error));
    blocker.listen(5980, '127.0.0.1', resolve);
  });
  let server;
  const receiver = drop.createDropReceiver({
    directory,
    getAddress: () => '127.0.0.1',
    createHttpServer: (...args) => {
      server = createServer(...args);
      return server;
    },
  });

  t.after(async () => {
    await receiver.stop();
    await new Promise((resolve) => blocker.close(resolve));
    await rm(directory, { recursive: true, force: true });
  });
  assert.deepEqual(receiver.info(), { active: false });
  assert.deepEqual(await receiver.list(), []);
  const [session, repeated] = await Promise.all([receiver.start(), receiver.start()]);
  assert.equal(session.url, repeated.url);
  assert.notEqual(session.port, 5980);
  assert.match(session.qrImage, /^data:image\/svg\+xml;base64,/);
  const request = async (url, method = 'GET', name = '', body = '') => {
    try {
      const headers = method === 'POST' ? { 'content-type': 'application/octet-stream' } : undefined;
      return (await fetch(url + (method === 'POST' ? '/upload?filename=' + encodeURIComponent(name) : ''), { method, body: method === 'POST' ? body : undefined, headers })).status;
    } catch (error) {
      if (error.cause?.code !== 'EACCES') throw error;
      // The Windows execution sandbox blocks TCP connections, so drive the same HTTP request event in process.
      const req = Readable.from([Buffer.from(body)]);
      req.url = new URL(url).pathname + (method === 'POST' ? '/upload?filename=' + encodeURIComponent(name) : '');
      req.method = method;
      req.headers = { 'content-type': 'application/octet-stream', 'content-length': Buffer.byteLength(body) };
      return new Promise((resolve) => {
        const res = {
          setHeader() {},
          writeHead(status) { this.status = status; return this; },
          end() { resolve(this.status); },
        };
        server.emit('request', req, res);
      });
    }
  };
  assert.equal(await request(session.url), 200);
  assert.equal(await request('http://127.0.0.1:' + session.port, 'POST', 'report.txt', 'unpaired'), 404);
  const statuses = await Promise.all([
    request(session.url, 'POST', 'report.txt', 'one'),
    request(session.url, 'POST', 'report.txt', 'two'),
  ]);
  assert.deepEqual(statuses, [200, 200]);
  const names = (await receiver.list()).map((file) => file.name).sort();
  assert.deepEqual(names, ['report (1).txt', 'report.txt']);
  const contents = await Promise.all(names.map((name) => readFile(join(directory, name), 'utf8')));
  assert.deepEqual(contents.sort(), ['one', 'two']);
  await receiver.stop();
  assert.equal(receiver.info().active, false);
  const next = await receiver.start();
  assert.notEqual(new URL(session.url).pathname, new URL(next.url).pathname);
});
