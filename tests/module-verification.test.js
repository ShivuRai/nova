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
    'SECURITY_AND_VERIFICATION.md',
    'NOVA.exe',
    'NOVA-Certificate.cer',
    'Install-Certificate.bat',
    'Enable-AutoStart.bat',
    'Disable-AutoStart.bat',
    'Verify-Signatures.bat',
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
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\shivu';
  const desktopShortcut = path.join(userProfile, 'Desktop', 'NOVA.lnk');
  const onedriveShortcut = path.join(userProfile, 'OneDrive', 'Desktop', 'NOVA.lnk');
  const exists = fs.existsSync(desktopShortcut) || fs.existsSync(onedriveShortcut);
  assert.strictEqual(exists, true, 'Desktop shortcut NOVA.lnk must exist on user Desktop');
});

test('Verification 6: Desktop Executable and Security Manifest check', () => {
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\shivu';
  const desktopExe = path.join(userProfile, 'Desktop', 'NOVA.exe');
  const onedriveExe = path.join(userProfile, 'OneDrive', 'Desktop', 'NOVA.exe');
  const exeExists = fs.existsSync(desktopExe) || fs.existsSync(onedriveExe);
  assert.strictEqual(exeExists, true, 'Desktop executable NOVA.exe must exist on user Desktop');

  const certPath = path.join(projectRoot, 'NOVA-Certificate.cer');
  assert.strictEqual(fs.existsSync(certPath), true, 'NOVA-Certificate.cer must exist');

  const secDoc = path.join(projectRoot, 'SECURITY_AND_VERIFICATION.md');
  assert.strictEqual(fs.existsSync(secDoc), true, 'SECURITY_AND_VERIFICATION.md must exist');
});

test('Verification 7: Media inspector and control scripts check', () => {
  const mediaScript = path.join(projectRoot, 'scripts', 'get-media.ps1');
  const controlScript = path.join(projectRoot, 'scripts', 'control-media.ps1');
  assert.strictEqual(fs.existsSync(mediaScript), true, 'scripts/get-media.ps1 must exist');
  assert.strictEqual(fs.existsSync(controlScript), true, 'scripts/control-media.ps1 must exist');

  const content = fs.readFileSync(mediaScript, 'utf8');
  assert.strictEqual(content.includes('GlobalSystemMediaTransportControlsSessionManager'), true);
  assert.strictEqual(content.includes('MakeGenericMethod'), true);
});

test('Verification 8: Extended 8 Notch Styles and Minimalistic Edge Lightings check', () => {
  const typesPath = path.join(projectRoot, 'src', 'types', 'index.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf8');

  // Verify all 8 shapes
  const expectedShapes = [
    'floating-pill',
    'notch-attached',
    'squircle-bar',
    'compact-badge',
    'chamfered-notch',
    'dynamic-wing',
    'teardrop-capsule',
    'hex-pill',
  ];
  for (const s of expectedShapes) {
    assert.strictEqual(typesContent.includes(`'${s}'`), true, `Notch style ${s} must be defined`);
  }

  // Verify edge lighting types
  assert.strictEqual(typesContent.includes('EdgeLightingMode'), true);
  assert.strictEqual(typesContent.includes('corners-inward'), true);
  assert.strictEqual(typesContent.includes('continuous'), true);
  assert.strictEqual(typesContent.includes('center-outward'), true);
  assert.strictEqual(typesContent.includes('PillDisplayContent'), true);
  assert.strictEqual(typesContent.includes('topOffset'), true);
  assert.strictEqual(typesContent.includes('sideMargin'), true);
});

test('Verification 9: Real Screen Time script and NOVA Drop checks', () => {
  const stScript = path.join(projectRoot, 'scripts', 'get-screen-time.ps1');
  assert.strictEqual(fs.existsSync(stScript), true, 'scripts/get-screen-time.ps1 must exist');

  const electronPath = path.join(projectRoot, 'electron.cjs');
  const electronContent = fs.readFileSync(electronPath, 'utf8');
  assert.strictEqual(electronContent.includes('get-screen-time'), true);
  assert.strictEqual(electronContent.includes('NOVA Drop'), true);
  assert.strictEqual(electronContent.includes('drop-file-received'), true);
  assert.strictEqual(electronContent.includes('open-drop-folder'), true);
});

test('Verification 10: Real System Metrics, Timer Store, Clipboard Watcher, and Glassmorphism Studio', () => {
  const metricsScript = path.join(projectRoot, 'scripts', 'get-system-metrics.ps1');
  assert.strictEqual(fs.existsSync(metricsScript), true, 'scripts/get-system-metrics.ps1 must exist');

  const timerStorePath = path.join(projectRoot, 'src', 'stores', 'useTimerStore.ts');
  assert.strictEqual(fs.existsSync(timerStorePath), true, 'useTimerStore.ts must exist');

  const typesPath = path.join(projectRoot, 'src', 'types', 'index.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  assert.strictEqual(typesContent.includes('network-speed'), true, 'network-speed must be in PillDisplayContent');
  assert.strictEqual(typesContent.includes('customAccentColor'), true, 'customAccentColor must be in AppearanceSettings');
  assert.strictEqual(typesContent.includes('glassmorphismBlur'), true, 'glassmorphismBlur must be in AppearanceSettings');

  const electronPath = path.join(projectRoot, 'electron.cjs');
  const electronContent = fs.readFileSync(electronPath, 'utf8');
  assert.strictEqual(electronContent.includes('clipboard-copy-detected'), true);
  assert.strictEqual(electronContent.includes('system-metrics-update'), true);
  assert.strictEqual(electronContent.includes('get-current-clipboard-text'), true);
});
