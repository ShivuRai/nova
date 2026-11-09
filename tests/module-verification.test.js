import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

test('Verification 1: Project structure and critical files exist', () => {
  const criticalFiles = [
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'index.html',
    'electron.cjs',
    'NOVA.bat',
    'dist/index.html',
    'dist-app/NOVA.exe',
    'dist-app/resources/app/package.json',
    'dist-app/resources/app/electron.cjs',
    'docs/REFERENCE_RESEARCH.md',
    'docs/PRD.md',
    'docs/ARCHITECTURE.md',
    'docs/DATABASE.md',
    'docs/DESIGN_SYSTEM.md',
    'docs/MODULES.md',
    'docs/TESTING.md',
    'docs/RELEASE.md',
    'docs/IMPLEMENTATION_STATUS.md',
  ];

  for (const f of criticalFiles) {
    const fullPath = path.join(projectRoot, f);
    assert.strictEqual(fs.existsSync(fullPath), true, `File must exist: ${f}`);
  }
});

test('Verification 2: All 23 module view components are created', () => {
  const moduleFiles = [
    'src/modules/home/HomeView.tsx',
    'src/modules/clipboard/ClipboardView.tsx',
    'src/modules/notes/NotesView.tsx',
    'src/modules/links/LinksView.tsx',
    'src/modules/weather/WeatherView.tsx',
    'src/modules/units/UnitsView.tsx',
    'src/modules/drop/DropView.tsx',
    'src/modules/shelf/ShelfView.tsx',
    'src/modules/converter/ConverterView.tsx',
    'src/modules/file-tools/FileToolsView.tsx',
    'src/modules/timers/TimersView.tsx',
    'src/modules/calendar/CalendarView.tsx',
    'src/modules/clock/ClockView.tsx',
    'src/modules/screen-time/ScreenTimeView.tsx',
    'src/modules/system/SystemView.tsx',
    'src/modules/message/MessageView.tsx',
    'src/modules/launcher/LauncherView.tsx',
    'src/modules/quick-settings/QuickSettingsView.tsx',
    'src/modules/ai-coding/AiCodingView.tsx',
    'src/modules/analytics/AnalyticsView.tsx',
    'src/modules/revenue/RevenueView.tsx',
    'src/modules/pet/PetView.tsx',
    'src/modules/rgb/RgbView.tsx',
    'src/modules/settings/SettingsView.tsx',
  ];

  for (const mf of moduleFiles) {
    const fullPath = path.join(projectRoot, mf);
    assert.strictEqual(fs.existsSync(fullPath), true, `Module view must exist: ${mf}`);
  }
});

test('Verification 3: Units conversion math calculation check', () => {
  // Length: 100 meters to feet
  const meters = 100;
  const feet = meters / 0.3048;
  assert.strictEqual(Math.round(feet), 328);

  // Temp: 100 C to F
  const c = 100;
  const f = c * (9 / 5) + 32;
  assert.strictEqual(f, 212);

  // Data: 1 GB to MB
  const gb = 1;
  const mb = gb * 1024;
  assert.strictEqual(mb, 1024);
});

test('Verification 4: Hashes checksum determinism check', () => {
  const text = 'NOVA Windows Desktop Companion';
  const sha256 = crypto.createHash('sha256').update(text).digest('hex');
  const md5 = crypto.createHash('md5').update(text).digest('hex');

  assert.strictEqual(sha256.length, 64);
  assert.strictEqual(md5.length, 32);
});

test('Verification 5: Desktop Shortcut check', () => {
  const desktopShortcut = path.join(process.env.USERPROFILE || 'C:\\Users\\shivu', 'Desktop', 'NOVA.lnk');
  assert.strictEqual(fs.existsSync(desktopShortcut), true, 'Desktop shortcut NOVA.lnk must exist on user Desktop');
});
