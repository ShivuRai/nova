const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist-app');
const appDirectory = path.join(output, 'resources', 'app');
const installedRuntime = path.join(root, 'node_modules', 'electron', 'dist');
const windowsExecutable = path.join(output, 'NOVA.exe');

async function prepareDesktop() {
  if (process.platform !== 'win32') throw new Error('The NOVA portable build requires Windows.');
  await fs.access(path.join(root, 'dist', 'index.html'));
  const version = (await fs.readFile(path.join(installedRuntime, 'version'), 'utf8')).trim();
  const runtimeVersion = await fs.readFile(path.join(output, 'version'), 'utf8').catch(() => '');
  const executableExists = await fs.access(windowsExecutable).then(() => true, () => false);

  if (runtimeVersion.trim() !== version || !executableExists) {
    const entries = await fs.readdir(installedRuntime, { withFileTypes: true });
    await fs.mkdir(output, { recursive: true });
    for (const entry of entries) {
      if (entry.name === 'version') continue;
      const source = path.join(installedRuntime, entry.name);
      const destination = entry.name === 'electron.exe' ? windowsExecutable : path.join(output, entry.name);
      await fs.cp(source, destination, { recursive: entry.isDirectory(), force: true });
    }
    await fs.writeFile(path.join(output, 'version'), version);
  }

  await fs.mkdir(appDirectory, { recursive: true });
  for (const file of ['electron.cjs', 'preload.cjs', 'drop-receiver.cjs', 'window-bounds.cjs', 'package.json', 'LICENSE']) {
    await fs.copyFile(path.join(root, file), path.join(appDirectory, file));
  }
  for (const folder of ['scripts', 'src-tauri/icons', 'dist/assets', 'vendor/qrcode']) {
    await fs.cp(path.join(root, folder), path.join(appDirectory, folder), { recursive: true, force: true });
  }
  await fs.copyFile(path.join(root, 'dist', 'index.html'), path.join(appDirectory, 'dist', 'index.html'));
  console.log('Updated ' + windowsExecutable);
}

prepareDesktop().catch((error) => {
  console.error('NOVA portable build failed. Quit any running NOVA windows and check the build output.');
  console.error(error.message);
  process.exitCode = 1;
});
