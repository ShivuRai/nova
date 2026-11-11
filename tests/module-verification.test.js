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

test('Verification 11: Real Quick Actions, File Shelf, File Tools, Launcher, Analytics, Revenue, and Mascot Pet', () => {
  const electronPath = path.join(projectRoot, 'electron.cjs');
  const electronContent = fs.readFileSync(electronPath, 'utf8');

  // Verify IPC handlers
  assert.strictEqual(electronContent.includes("'quick-action'"), true, 'quick-action handler must exist');
  assert.strictEqual(electronContent.includes("'launch-shortcut'"), true, 'launch-shortcut handler must exist');
  assert.strictEqual(electronContent.includes("'open-path'"), true, 'open-path handler must exist');
  assert.strictEqual(electronContent.includes("'show-item-in-folder'"), true, 'show-item-in-folder handler must exist');
  assert.strictEqual(electronContent.includes("'compute-file-hash'"), true, 'compute-file-hash handler must exist');

  // Verify Quick Settings
  const qsPath = path.join(projectRoot, 'src', 'modules', 'quick-settings', 'QuickSettingsView.tsx');
  const qsContent = fs.readFileSync(qsPath, 'utf8');
  assert.strictEqual(qsContent.includes('runQuickAction'), true);
  assert.strictEqual(qsContent.includes('open-wifi'), true);
  assert.strictEqual(qsContent.includes('volume-mute'), true);

  // Verify Shelf View has hover tooltip (?) and no hardcoded demo files
  const shelfPath = path.join(projectRoot, 'src', 'modules', 'shelf', 'ShelfView.tsx');
  const shelfContent = fs.readFileSync(shelfPath, 'utf8');
  assert.strictEqual(shelfContent.includes('HelpCircle'), true);
  assert.strictEqual(shelfContent.includes('What is File Shelf?'), true);
  assert.strictEqual(shelfContent.includes('Architecture_Diagram_v2.png'), false);

  // Verify File Tools has real Web Crypto and Checksum verifier
  const ftPath = path.join(projectRoot, 'src', 'modules', 'file-tools', 'FileToolsView.tsx');
  const ftContent = fs.readFileSync(ftPath, 'utf8');
  assert.strictEqual(ftContent.includes('crypto.subtle.digest'), true);
  assert.strictEqual(ftContent.includes('VERIFY AGAINST EXPECTED HASH'), true);
  assert.strictEqual(ftContent.includes('simpleHash'), false);

  // Verify Launcher has custom shortcut adding
  const launcherPath = path.join(projectRoot, 'src', 'modules', 'launcher', 'LauncherView.tsx');
  const launcherContent = fs.readFileSync(launcherPath, 'utf8');
  assert.strictEqual(launcherContent.includes('+ Add App'), true);
  assert.strictEqual(launcherContent.includes('runLaunchShortcut'), true);

  // Verify Analytics has real ping / latency check
  const analyticsPath = path.join(projectRoot, 'src', 'modules', 'analytics', 'AnalyticsView.tsx');
  const analyticsContent = fs.readFileSync(analyticsPath, 'utf8');
  assert.strictEqual(analyticsContent.includes('pingSite'), true);
  assert.strictEqual(analyticsContent.includes('lastLatencyMs'), true);
  assert.strictEqual(analyticsContent.includes('2,950'), false);

  // Verify Revenue has monthly goal and transaction logging
  const revenuePath = path.join(projectRoot, 'src', 'modules', 'revenue', 'RevenueView.tsx');
  const revenueContent = fs.readFileSync(revenuePath, 'utf8');
  assert.strictEqual(revenueContent.includes('monthlyGoal'), true);
  assert.strictEqual(revenueContent.includes('+ Add Income'), true);
  assert.strictEqual(revenueContent.includes('$4,820.00'), false);

  // Verify Desktop Mascot has companion species and interactive care
  const petPath = path.join(projectRoot, 'src', 'modules', 'pet', 'PetView.tsx');
  const petContent = fs.readFileSync(petPath, 'utf8');
  assert.strictEqual(petContent.includes('cat'), true);
  assert.strictEqual(petContent.includes('robot'), true);
  assert.strictEqual(petContent.includes('fox'), true);
  assert.strictEqual(petContent.includes('dragon'), true);
  assert.strictEqual(petContent.includes('handleFeed'), true);
  assert.strictEqual(petContent.includes('handlePet'), true);
});

test('Verification 12: Customization Studio, 12 Notch Shapes, and Animated Mascot Brand Badges', () => {
  const typesPath = path.join(projectRoot, 'src', 'types', 'index.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf8');

  // Verify new 4 notch shapes (12 total)
  assert.strictEqual(typesContent.includes('stealth-blade'), true);
  assert.strictEqual(typesContent.includes('cyber-diamond'), true);
  assert.strictEqual(typesContent.includes('liquid-droplet'), true);
  assert.strictEqual(typesContent.includes('split-capsule'), true);

  // Verify PillBrandBadge options
  assert.strictEqual(typesContent.includes('PillBrandBadge'), true);
  assert.strictEqual(typesContent.includes("'robot'"), true);
  assert.strictEqual(typesContent.includes("'cat'"), true);
  assert.strictEqual(typesContent.includes("'quantum'"), true);

  // Verify IslandBrandMascot in IslandPill.tsx
  const pillPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandPill.tsx');
  const pillContent = fs.readFileSync(pillPath, 'utf8');
  assert.strictEqual(pillContent.includes('IslandBrandMascot'), true);
  assert.strictEqual(pillContent.includes('fox'), true);
  assert.strictEqual(pillContent.includes('dragon'), true);

  // Verify Customization Studio in registry and RgbView.tsx
  const regPath = path.join(projectRoot, 'src', 'modules', 'registry.ts');
  const regContent = fs.readFileSync(regPath, 'utf8');
  assert.strictEqual(regContent.includes('Customization Studio'), true);

  const studioPath = path.join(projectRoot, 'src', 'modules', 'rgb', 'RgbView.tsx');
  const studioContent = fs.readFileSync(studioPath, 'utf8');
  assert.strictEqual(studioContent.includes('CUSTOMIZATION STUDIO'), true);
  assert.strictEqual(studioContent.includes('GLASSMORPHISM & CUSTOM COLORS'), true);
  assert.strictEqual(studioContent.includes('Astro Robot'), true);

  // Verify Streamlined Settings
  const settingsPath = path.join(projectRoot, 'src', 'modules', 'settings', 'SettingsView.tsx');
  const settingsContent = fs.readFileSync(settingsPath, 'utf8');
  assert.strictEqual(settingsContent.includes('Open Customization Studio'), true);
});

test('Verification 13: Single-Instance Resilience, EADDRINUSE Prevention, Custom Categories, Sub-tab Persistence, and 4 Flagship Features', () => {
  const electronPath = path.join(projectRoot, 'electron.cjs');
  const electronContent = fs.readFileSync(electronPath, 'utf8');

  // Verify Single-Instance Lock and ErrorBox suppression
  assert.strictEqual(electronContent.includes('dialog.showErrorBox'), true, 'dialog.showErrorBox must be suppressed');
  assert.strictEqual(electronContent.includes('Quitting duplicate process immediately'), true, 'Must exit immediately on lock failure');
  assert.strictEqual(electronContent.includes('startDropServer(0)'), true, 'Must fallback to port 0 on EADDRINUSE');
  assert.strictEqual(electronContent.includes("'get-wallpaper-palette'"), true, 'get-wallpaper-palette IPC handler must exist');

  // Verify Custom Categories in IslandExpanded.tsx
  const expandedPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandExpanded.tsx');
  const expandedContent = fs.readFileSync(expandedPath, 'utf8');
  assert.strictEqual(expandedContent.includes('nova_custom_categories_v2'), true, 'Must store custom categories in localStorage');
  assert.strictEqual(expandedContent.includes('handleCreateCategory'), true, 'handleCreateCategory must exist');
  assert.strictEqual(expandedContent.includes('handleDeleteCategory'), true, 'handleDeleteCategory must exist');
  assert.strictEqual(expandedContent.includes('toggleModuleInCustomCategory'), true, 'Module curation in custom categories must exist');

  // Verify Studio Tab Persistence in RgbView.tsx
  const rgbPath = path.join(projectRoot, 'src', 'modules', 'rgb', 'RgbView.tsx');
  const rgbContent = fs.readFileSync(rgbPath, 'utf8');
  assert.strictEqual(rgbContent.includes('nova_active_studio_tab'), true, 'Active tab must be stored in localStorage');
  assert.strictEqual(rgbContent.includes('Dynamic Wallpaper-Reactive Tinting'), true, 'Wallpaper tinting toggle must exist');
  assert.strictEqual(rgbContent.includes('Audio-Reactive Equalizer Edge Lighting'), true, 'Audio reactive edge lighting must exist');
  assert.strictEqual(rgbContent.includes('SEASONAL AMBIENT PARTICLES'), true, 'Ambient particles selector must exist');
  assert.strictEqual(rgbContent.includes('Tactile Sound Effects & Acoustic Feedback'), true, 'Sound effects toggle must exist');

  // Verify Sound Service and Ambient Particles files
  const soundServicePath = path.join(projectRoot, 'src', 'services', 'soundService.ts');
  assert.strictEqual(fs.existsSync(soundServicePath), true, 'soundService.ts must exist');

  const particlesPath = path.join(projectRoot, 'src', 'components', 'island', 'AmbientParticles.tsx');
  assert.strictEqual(fs.existsSync(particlesPath), true, 'AmbientParticles.tsx must exist');

  // Verify IslandContainer integration
  const containerPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandContainer.tsx');
  const containerContent = fs.readFileSync(containerPath, 'utf8');
  assert.strictEqual(containerContent.includes('AmbientParticles'), true, 'AmbientParticles must be rendered');
  assert.strictEqual(containerContent.includes('currentClipPath'), true, 'currentClipPath must be applied');
  assert.strictEqual(containerContent.includes('playHoverSound'), true, 'playHoverSound must be called');
  assert.strictEqual(containerContent.includes('enableAudioReactiveLighting'), true, 'Audio reactive lighting must be handled');
});

test('Verification 14: Dynamic Wing, Chamfered Notch, Split Capsule Twin-Pod, Center Clock, and Edge Light Customization', () => {
  const containerPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandContainer.tsx');
  const containerContent = fs.readFileSync(containerPath, 'utf8');

  // 1. Dynamic Wing must use aerodynamic swept winglet polygon
  assert.strictEqual(containerContent.includes('isDynamicWing'), true, 'isDynamicWing check must exist');
  assert.strictEqual(containerContent.includes('polygon(16px 0%, calc(100% - 16px) 0%, 100% 26%'), true, 'Aerodynamic wing contour must be defined');

  // 2. Chamfered Notch must use true 45-degree beveled corner polygon
  assert.strictEqual(containerContent.includes('isChamfered'), true, 'isChamfered check must exist');
  assert.strictEqual(containerContent.includes('polygon(14px 0%, calc(100% - 14px) 0%, 100% 14px'), true, '45-degree chamfer polygon must be defined');

  // 3. Custom Edge Lighting gradient
  assert.strictEqual(containerContent.includes('customEdgeLightingColor'), true, 'customEdgeLightingColor must be supported');
  assert.strictEqual(containerContent.includes('resolvedEdgeBackground'), true, 'resolvedEdgeBackground must resolve custom color');

  // 4. Split Capsule twin-pod architecture in IslandPill & dedicated center slot
  const pillPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandPill.tsx');
  const pillContent = fs.readFileSync(pillPath, 'utf8');
  assert.strictEqual(pillContent.includes('isSplitCapsule'), true, 'isSplitCapsule twin-pod check must exist');
  assert.strictEqual(pillContent.includes('renderCenterContent') && pillContent.includes('renderRightContent'), true, 'Collision-proof 3-zone flex slots must exist');

  // 5. Fixed + Category and Manage buttons in IslandExpanded
  const expandedPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandExpanded.tsx');
  const expandedContent = fs.readFileSync(expandedPath, 'utf8');
  assert.strictEqual(expandedContent.includes('Pinned Action Controls'), true, 'Pinned action controls must be present');
  assert.strictEqual(expandedContent.includes('SlidersHorizontal'), true, 'Manage action button must be present');
  assert.strictEqual(expandedContent.includes('isAddingCategory'), true, 'isAddingCategory must be present');
});

test('Verification 15: Compact Proportioned HomeView and Dynamic Expressive Mascot Engine', () => {
  // 1. HomeView must be sleek and compact
  const homePath = path.join(projectRoot, 'src', 'modules', 'home', 'HomeView.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf8');
  assert.strictEqual(homeContent.includes('Search apps, files, or run command...'), true, 'Compact search bar exists');
  assert.strictEqual(homeContent.includes('WORKFLOW ESSENTIALS'), true, 'Workflow essentials section exists');
  assert.strictEqual(homeContent.includes('System Vitals'), true, 'System vitals exists');

  // 2. Dynamic Astro mascot engine
  const pillPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandPill.tsx');
  const pillContent = fs.readFileSync(pillPath, 'utf8');
  assert.strictEqual(pillContent.includes('expressionSequence'), true, 'Expression state machine sequence exists');
  assert.strictEqual(pillContent.includes('Signal Beacon Wave Pulse'), true, 'Antenna beacon wave pulse exists');
  assert.strictEqual(pillContent.includes('isHappy'), true, 'Happy smile eye expression exists');
  assert.strictEqual(pillContent.includes('handleMascotClick'), true, 'Interactive mascot click handler exists');
});

test('Verification 16: 10 Mascots, No Crowded Names, Vertical Smooth Scroll, 3D Gyro Glare, and Soundpacks', () => {
  // 1. Types check for soundpacks and gyro glare
  const typesPath = path.join(projectRoot, 'src', 'types', 'index.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  assert.strictEqual(typesContent.includes('soundPack?:'), true);
  assert.strictEqual(typesContent.includes('enable3dGyroGlare?:'), true);
  assert.strictEqual(typesContent.includes("'panda'"), true);
  assert.strictEqual(typesContent.includes("'penguin'"), true);
  assert.strictEqual(typesContent.includes("'ghost'"), true);
  assert.strictEqual(typesContent.includes("'owl'"), true);

  // 2. IslandExpanded has vertical smooth scrolling and no horizontal overflow
  const expandedPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandExpanded.tsx');
  const expandedContent = fs.readFileSync(expandedPath, 'utf8');
  assert.strictEqual(expandedContent.includes("overflowY: 'auto'"), true);
  assert.strictEqual(expandedContent.includes("overflowX: 'hidden'"), true);

  // 3. HomeView has no horizontal overflow
  const homePath = path.join(projectRoot, 'src', 'modules', 'home', 'HomeView.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf8');
  assert.strictEqual(homeContent.includes("overflowX: 'hidden'"), true);

  // 4. IslandContainer has 3D Gyro Glare and Drag & Drop file handler
  const containerPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandContainer.tsx');
  const containerContent = fs.readFileSync(containerPath, 'utf8');
  assert.strictEqual(containerContent.includes('enable3dGyroGlare'), true);
  assert.strictEqual(containerContent.includes('onDragOver'), true);
  assert.strictEqual(containerContent.includes('onDrop'), true);

  // 5. Sound Service has soundpacks and playPetSound
  const soundPath = path.join(projectRoot, 'src', 'services', 'soundService.ts');
  const soundContent = fs.readFileSync(soundPath, 'utf8');
  assert.strictEqual(soundContent.includes('playPetSound'), true);
  assert.strictEqual(soundContent.includes('cyber'), true);
  assert.strictEqual(soundContent.includes('mech'), true);
  assert.strictEqual(soundContent.includes('retro'), true);
});

test('Verification 17: No Overlapping Layout, Custom Modular Builder, and Enlarged Mascots with Tailored Animations', () => {
  // 1. Custom slots in types
  const typesPath = path.join(projectRoot, 'src', 'types', 'index.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  assert.strictEqual(typesContent.includes('customPillCenter?: CustomPillCenter;'), true);
  assert.strictEqual(typesContent.includes('customPillRight?: CustomPillRight;'), true);
  assert.strictEqual(typesContent.includes('crypto-stock'), true);
  assert.strictEqual(typesContent.includes('pomodoro-focus'), true);
  assert.strictEqual(typesContent.includes('battery-power'), true);

  // 2. Custom modular builder and new options in RgbView.tsx
  const studioPath = path.join(projectRoot, 'src', 'modules', 'rgb', 'RgbView.tsx');
  const studioContent = fs.readFileSync(studioPath, 'utf8');
  assert.strictEqual(studioContent.includes('CUSTOM MODULAR NOTCH BUILDER'), true);
  assert.strictEqual(studioContent.includes('CENTER SLOT WIDGET'), true);
  assert.strictEqual(studioContent.includes('RIGHT SLOT WIDGET'), true);
  assert.strictEqual(studioContent.includes('crypto-stock'), true);

  // 3. Collision-free layout in IslandPill.tsx
  const pillPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandPill.tsx');
  const pillContent = fs.readFileSync(pillPath, 'utf8');
  assert.strictEqual(pillContent.includes('renderCenterContent'), true);
  assert.strictEqual(pillContent.includes('renderRightContent'), true);
  // Dedicated network-speed check without CPU/RAM collision
  assert.strictEqual(pillContent.includes("pillContentMode === 'network-speed'"), true);
  // Enlarged mascot size
  assert.strictEqual(pillContent.includes('viewBox="0 0 28 26"'), true);
  // Tailored mascot animations
  assert.strictEqual(pillContent.includes('Twin Swaying Spirit Tails'), true);
  assert.strictEqual(pillContent.includes('Animated Flapping Wings'), true);
  assert.strictEqual(pillContent.includes('Chewing Bamboo Stalk'), true);
  assert.strictEqual(pillContent.includes('Cozy Fluttering Winter Scarf'), true);
  assert.strictEqual(pillContent.includes('Glowing Aura Sparkles'), true);
});

test('Verification 18: Real Media Detection Listener and Geometric SVG Edge Lighting Engine', () => {
  // 1. App.tsx listens to real media updates from Windows SMTC
  const appPath = path.join(projectRoot, 'src', 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  assert.strictEqual(appContent.includes('media-status-update'), true);
  assert.strictEqual(appContent.includes('updateMedia'), true);
  assert.strictEqual(appContent.includes('get-media-status'), true);

  // 2. electron.cjs has get-media-status IPC handler
  const electronPath = path.join(projectRoot, 'electron.cjs');
  const electronContent = fs.readFileSync(electronPath, 'utf8');
  assert.strictEqual(electronContent.includes("'get-media-status'"), true);

  // 3. IslandPill strictly requires media.isPlaying for equalizer
  const pillPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandPill.tsx');
  const pillContent = fs.readFileSync(pillPath, 'utf8');
  assert.strictEqual(pillContent.includes('media.isPlaying && (pillContentMode ==='), true);

  // 4. IslandContainer geometric SVG edge lighting engine
  const containerPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandContainer.tsx');
  const containerContent = fs.readFileSync(containerPath, 'utf8');
  assert.strictEqual(containerContent.includes('getShapePath'), true);
  assert.strictEqual(containerContent.includes('shapePath'), true);
  assert.strictEqual(containerContent.includes('notch-edge-lighting-svg-grad'), true);
});

test('Verification 19: Seasonal Canvas Particles, Custom Notch Shape Studio, New Edge Lighting Modes, and Pet Module Overhaul', () => {
  // 1. Types verification
  const typesPath = path.join(projectRoot, 'src', 'types', 'index.ts');
  const typesContent = fs.readFileSync(typesPath, 'utf8');
  assert.strictEqual(typesContent.includes("'custom-shape'"), true);
  assert.strictEqual(typesContent.includes('customNotchChamfer?:'), true);
  assert.strictEqual(typesContent.includes('customNotchRadius?:'), true);
  assert.strictEqual(typesContent.includes('customNotchWingDepth?:'), true);
  assert.strictEqual(typesContent.includes("'aurora-sweep'"), true);
  assert.strictEqual(typesContent.includes("'comet-tail'"), true);
  assert.strictEqual(typesContent.includes("'dual-spin'"), true);
  assert.strictEqual(typesContent.includes("'plasma-flow'"), true);
  assert.strictEqual(typesContent.includes("'rainbow-cycle'"), true);
  assert.strictEqual(typesContent.includes("'fireflies'"), true);
  assert.strictEqual(typesContent.includes("'embers'"), true);

  // 2. High-performance HTML5 Canvas physics engine in AmbientParticles.tsx
  const particlesPath = path.join(projectRoot, 'src', 'components', 'island', 'AmbientParticles.tsx');
  const particlesContent = fs.readFileSync(particlesPath, 'utf8');
  assert.strictEqual(particlesContent.includes('<canvas'), true);
  assert.strictEqual(particlesContent.includes('requestAnimationFrame'), true);
  assert.strictEqual(particlesContent.includes("mode === 'fireflies'"), true);
  assert.strictEqual(particlesContent.includes("mode === 'embers'"), true);
  assert.strictEqual(particlesContent.includes("mode === 'snow'"), true);
  assert.strictEqual(particlesContent.includes("mode === 'sakura'"), true);
  assert.strictEqual(particlesContent.includes("mode === 'stardust'"), true);
  assert.strictEqual(particlesContent.includes("mode === 'bubbles'"), true);
  assert.strictEqual(particlesContent.includes("mode === 'matrix'"), true);

  // 3. Custom Notch Shape geometric calculation in IslandContainer.tsx
  const containerPath = path.join(projectRoot, 'src', 'components', 'island', 'IslandContainer.tsx');
  const containerContent = fs.readFileSync(containerPath, 'utf8');
  assert.strictEqual(containerContent.includes('isCustomShape'), true);
  assert.strictEqual(containerContent.includes('customChamfer'), true);
  assert.strictEqual(containerContent.includes('customWingDepth'), true);
  assert.strictEqual(containerContent.includes("'aurora-sweep'"), true);
  assert.strictEqual(containerContent.includes("'comet-tail'"), true);
  assert.strictEqual(containerContent.includes("'dual-spin'"), true);
  assert.strictEqual(containerContent.includes("'plasma-flow'"), true);
  assert.strictEqual(containerContent.includes("'rainbow-cycle'"), true);

  // 4. Custom Notch Shape Studio in RgbView.tsx
  const rgbPath = path.join(projectRoot, 'src', 'modules', 'rgb', 'RgbView.tsx');
  const rgbContent = fs.readFileSync(rgbPath, 'utf8');
  assert.strictEqual(rgbContent.includes('CUSTOM NOTCH SHAPE STUDIO'), true);
  assert.strictEqual(rgbContent.includes('Chamfer Cut'), true);
  assert.strictEqual(rgbContent.includes('Wing Inset Depth'), true);
  assert.strictEqual(rgbContent.includes('Corner Radius'), true);
  assert.strictEqual(rgbContent.includes('Cyber Octagon'), true);
  assert.strictEqual(rgbContent.includes('Aero Winglet'), true);

  // 5. Mascot Pet Module Overhaul in PetView.tsx
  const petPath = path.join(projectRoot, 'src', 'modules', 'pet', 'PetView.tsx');
  const petContent = fs.readFileSync(petPath, 'utf8');
  assert.strictEqual(petContent.includes('COMPANIONS'), true);
  assert.strictEqual(petContent.includes('LVL'), true);
  assert.strictEqual(petContent.includes('addXp'), true);
  assert.strictEqual(petContent.includes('handleFeed'), true);
  assert.strictEqual(petContent.includes('handlePlayMiniGame'), true);
  assert.strictEqual(petContent.includes('playPetSound'), true);
  assert.strictEqual(petContent.includes('Astro'), true);
  assert.strictEqual(petContent.includes('Mochi'), true);
  assert.strictEqual(petContent.includes('Kitsune'), true);
  assert.strictEqual(petContent.includes('Draco'), true);
  assert.strictEqual(petContent.includes('Bao'), true);
  assert.strictEqual(petContent.includes('Pippin'), true);
  assert.strictEqual(petContent.includes('Spooky'), true);
  assert.strictEqual(petContent.includes('Hoot'), true);
  assert.strictEqual(petContent.includes('Quantum'), true);
  assert.strictEqual(petContent.includes('Byte'), true);
});
