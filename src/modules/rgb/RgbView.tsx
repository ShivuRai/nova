import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Sliders,
  Power,
  Check,
  ShieldCheck,
  Layers,
  Zap,
  Gauge,
  Bot,
  Move,
  LayoutGrid,
  Eye,
  SlidersHorizontal,
  Monitor,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Radio,
} from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import {
  RgbPreset,
  NotchStyle,
  ScreenPosition,
  EdgeLightingMode,
  EdgeLightingColor,
  EdgeLightingSpeed,
  ThemeMode,
  PillDisplayContent,
  PillBrandBadge,
  AmbientParticleMode,
} from '../../types';

type StudioTab = 'themes' | 'shapes' | 'edge' | 'mascot' | 'display';

const THEMES: Array<{ id: ThemeMode; label: string; primary: string; secondary: string; bg: string }> = [
  { id: 'minimal', label: 'Obsidian Noir', primary: '#60A5FA', secondary: '#38BDF8', bg: '#0B0D12' },
  { id: 'aurora', label: 'Aurora Emerald', primary: '#34D399', secondary: '#38BDF8', bg: '#061412' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', primary: '#F43F5E', secondary: '#06B6D4', bg: '#11091C' },
  { id: 'deep-space', label: 'Deep Space', primary: '#3B82F6', secondary: '#6366F1', bg: '#080D1A' },
  { id: 'sunset', label: 'Sunset Amber', primary: '#F59E0B', secondary: '#F43F5E', bg: '#180D10' },
  { id: 'vivid', label: 'Vivid Electric', primary: '#6366F1', secondary: '#8B5CF6', bg: '#0E0E18' },
  { id: 'light', label: 'Frosted Quartz', primary: '#2563EB', secondary: '#7C3AED', bg: '#F1F5F9' },
  { id: 'rgb', label: 'Gaming RGB', primary: '#60A5FA', secondary: '#34D399', bg: '#0B0D12' },
];

const NOTCH_STYLES: Array<{ id: NotchStyle; label: string; desc: string; tag?: string }> = [
  { id: 'floating-pill', label: 'Floating Pill', desc: 'Smooth floating dynamic island' },
  { id: 'notch-attached', label: 'Notch Attached', desc: 'Organic curved bezel anchor' },
  { id: 'chamfered-notch', label: 'Chamfered Notch', desc: '45° beveled cyber notch' },
  { id: 'dynamic-wing', label: 'Dynamic Wing', desc: 'Sculpted aero winglets on sides' },
  { id: 'stealth-blade', label: 'Stealth Blade', desc: 'Angled faceted fighter blade', tag: 'NEW' },
  { id: 'cyber-diamond', label: 'Cyber Diamond', desc: 'Angular rhombus silhouette', tag: 'NEW' },
  { id: 'liquid-droplet', label: 'Liquid Droplet', desc: 'Fluid asymmetric droplet', tag: 'NEW' },
  { id: 'split-capsule', label: 'Split Capsule', desc: 'Futuristic twin-pod notch', tag: 'NEW' },
  { id: 'teardrop-capsule', label: 'Teardrop Capsule', desc: 'Fluid organic contour' },
  { id: 'hex-pill', label: 'Hex HUD Pill', desc: 'Angular sci-fi profile' },
  { id: 'squircle-bar', label: 'Squircle Bar', desc: 'Curved status bar' },
  { id: 'compact-badge', label: 'Compact Badge', desc: 'Ultra-slim minimal badge' },
];

const POSITIONS: Array<{ id: ScreenPosition; label: string }> = [
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-center', label: 'Top Center' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-center', label: 'Bottom Center' },
  { id: 'bottom-right', label: 'Bottom Right' },
];

const EDGE_MODES: Array<{ id: EdgeLightingMode; label: string; desc: string }> = [
  { id: 'continuous', label: 'Continuous Flow', desc: 'Perpetual perimeter border sweep' },
  { id: 'corners-inward', label: 'Corners Inward', desc: 'Dual beams sweeping from both corners inward' },
  { id: 'center-outward', label: 'Center Outward', desc: 'Radiant pulse flowing outward to corners' },
  { id: 'breathing-glow', label: 'Breathing Rim', desc: 'Gentle organic breathing illumination' },
  { id: 'off', label: 'Edge Light Off', desc: 'Minimal clean border without animations' },
];

const EDGE_COLORS: Array<{ id: EdgeLightingColor; label: string; dot: string }> = [
  { id: 'cyan-pulse', label: 'Cyber Cyan', dot: '#38BDF8' },
  { id: 'emerald-beam', label: 'Emerald Mint', dot: '#10B981' },
  { id: 'sunset-flare', label: 'Sunset Amber', dot: '#F59E0B' },
  { id: 'violet-aurora', label: 'Electric Violet', dot: '#8B5CF6' },
  { id: 'pure-white', label: 'Platinum White', dot: '#FFFFFF' },
  { id: 'chromatic', label: 'Chromatic', dot: 'linear-gradient(135deg, #60A5FA, #F43F5E, #34D399)' },
];

const MASCOT_OPTIONS: Array<{ id: PillBrandBadge; label: string; desc: string; preview: string }> = [
  { id: 'robot', label: 'Astro Robot', desc: 'Cute animated mini-bot with blinking visor & antenna', preview: '🤖' },
  { id: 'cat', label: 'Mochi Cat', desc: 'Sweet kitten with blushing cheeks & blinking eyes', preview: '🐱' },
  { id: 'quantum', label: 'Quantum Core', desc: 'Spinning sci-fi holographic energy orb', preview: '⚡' },
  { id: 'pixel-alien', label: 'Pixel Byte', desc: 'Retro 8-bit arcade space invader mascot', preview: '👾' },
  { id: 'text', label: 'Classic Text', desc: 'Clean typographic wordmark "NOVA"', preview: '✨' },
];

const PILL_DISPLAY_OPTIONS: Array<{ id: PillDisplayContent; label: string; desc: string; icon: string }> = [
  { id: 'smart-auto', label: 'Smart Contextual', desc: 'Auto-adapts to media playback, timers, or clock', icon: '⚡' },
  { id: 'network-speed', label: 'Network Speed', desc: 'Real-time internet download & upload speed (KB/s)', icon: '📶' },
  { id: 'media-priority', label: 'Media & YouTube Focus', desc: 'Always displays active track, artist & visualizer', icon: '🎵' },
  { id: 'telemetry', label: 'Hardware Telemetry', desc: 'Live CPU %, RAM %, and thermals right on the capsule', icon: '📊' },
  { id: 'clock-weather', label: 'Clock & Weather', desc: 'Minimalist clock with temperature and sky conditions', icon: '⛅' },
  { id: 'minimal-zen', label: 'Minimal Zen', desc: 'Subtle breathing beacon with system clock only', icon: '🧘' },
];

const PARTICLE_OPTIONS: Array<{ id: AmbientParticleMode; label: string; icon: string }> = [
  { id: 'off', label: 'Off', icon: '🚫' },
  { id: 'snow', label: 'Snowfall', icon: '❄️' },
  { id: 'sakura', label: 'Sakura', icon: '🌸' },
  { id: 'stardust', label: 'Stardust', icon: '✨' },
  { id: 'bubbles', label: 'Bubbles', icon: '🫧' },
  { id: 'matrix', label: 'Matrix', icon: '🟢' },
];

export const RgbView: React.FC = () => {
  const { settings, updateSettings } = useThemeStore();
  const [activeTab, setActiveTabState] = useState<StudioTab>(() => {
    try {
      const saved = localStorage.getItem('nova_active_studio_tab') as StudioTab;
      if (saved && ['themes', 'shapes', 'edge', 'mascot', 'display'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'themes';
  });

  const setActiveTab = (tab: StudioTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('nova_active_studio_tab', tab);
    } catch (e) {}
  };

  const isRgbActive = settings.enableRgbBorder || settings.themeMode === 'rgb';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 320, boxSizing: 'border-box' }}>
      {/* Top Header & Tab Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Palette size={14} style={{ color: 'var(--nova-blue)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nova-text-secondary)', letterSpacing: '0.04em' }}>
            CUSTOMIZATION STUDIO
          </span>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: 3 }}>
          {([
            { id: 'themes', label: 'Palette & Glass' },
            { id: 'shapes', label: 'Notch Shapes' },
            { id: 'edge', label: 'Edge Light' },
            { id: 'mascot', label: 'Mascot & Icon' },
            { id: 'display', label: 'Capsule Mode' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontSize: '10px',
                padding: '3px 7px',
                borderRadius: 'var(--nova-radius-pill)',
                backgroundColor: activeTab === tab.id ? 'var(--nova-blue)' : 'var(--nova-surface)',
                color: activeTab === tab.id ? '#fff' : 'var(--nova-text-secondary)',
                border: '1px solid var(--nova-border)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Themes & Glassmorphism */}
      {activeTab === 'themes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {/* Preset Palettes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {THEMES.map((theme) => {
              const isSelected = settings.themeMode === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => updateSettings({ themeMode: theme.id })}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: isSelected ? 'rgba(102, 136, 255, 0.15)' : 'var(--nova-surface)',
                    border: isSelected ? '1px solid var(--nova-blue)' : '1px solid var(--nova-border)',
                    borderRadius: 'var(--nova-radius-widget)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', gap: 2 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.primary }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.secondary }} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--nova-blue)' : 'var(--nova-text-primary)' }}>
                    {theme.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Theme Color & Glassmorphism Studio */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-widget)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>GLASSMORPHISM & CUSTOM COLORS</span>
              <button
                onClick={() => updateSettings({ customAccentColor: '#38BDF8', customBgColor: '#0B0D12', glassmorphismBlur: 24, glassmorphismOpacity: 85, glassmorphismBorderGlow: 35 })}
                style={{ fontSize: '9px', color: 'var(--nova-cyan)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Reset Colors
              </button>
            </div>

            {/* Custom Color Pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--nova-border)' }}>
                <span style={{ fontSize: '10px', color: 'var(--nova-text-primary)' }}>Accent Glow</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="color"
                    value={settings.customAccentColor || '#38BDF8'}
                    onChange={(e) => updateSettings({ customAccentColor: e.target.value })}
                    style={{ width: 18, height: 18, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                  />
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--nova-text-muted)' }}>
                    {settings.customAccentColor || '#38BDF8'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--nova-border)' }}>
                <span style={{ fontSize: '10px', color: 'var(--nova-text-primary)' }}>Panel Tone</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="color"
                    value={settings.customBgColor || '#0B0D12'}
                    onChange={(e) => updateSettings({ customBgColor: e.target.value })}
                    style={{ width: 18, height: 18, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                  />
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--nova-text-muted)' }}>
                    {settings.customBgColor || '#0B0D12'}
                  </span>
                </div>
              </div>
            </div>

            {/* Glass Sliders */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--nova-text-muted)', marginBottom: 2 }}>
                  <span>Glass Blur</span>
                  <span>{settings.glassmorphismBlur ?? 24}px</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={60}
                  value={settings.glassmorphismBlur ?? 24}
                  onChange={(e) => updateSettings({ glassmorphismBlur: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--nova-text-muted)', marginBottom: 2 }}>
                  <span>Opacity</span>
                  <span>{settings.glassmorphismOpacity ?? 85}%</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={settings.glassmorphismOpacity ?? 85}
                  onChange={(e) => updateSettings({ glassmorphismOpacity: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--nova-text-muted)', marginBottom: 2 }}>
                  <span>Rim Glow</span>
                  <span>{settings.glassmorphismBorderGlow ?? 35}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.glassmorphismBorderGlow ?? 35}
                  onChange={(e) => updateSettings({ glassmorphismBorderGlow: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Dynamic Wallpaper Tinting Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
                  Dynamic Wallpaper-Reactive Tinting
                </div>
                <div style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>
                  Samples Windows desktop background color to dynamically tint the frosted glass
                </div>
              </div>
              <button
                onClick={() => updateSettings({ enableWallpaperTinting: !settings.enableWallpaperTinting })}
                style={{
                  padding: '3px 9px',
                  borderRadius: 'var(--nova-radius-pill)',
                  backgroundColor: settings.enableWallpaperTinting ? 'var(--nova-blue)' : 'rgba(255,255,255,0.06)',
                  color: settings.enableWallpaperTinting ? '#fff' : 'var(--nova-text-muted)',
                  fontSize: '9px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {settings.enableWallpaperTinting ? 'Active' : 'Off'}
              </button>
            </div>
          </div>

          {/* Seasonal Ambient Particles Studio */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-widget)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>SEASONAL AMBIENT PARTICLES</span>
              <span style={{ fontSize: '9px', color: 'var(--nova-blue)' }}>
                {settings.ambientParticles && settings.ambientParticles !== 'off' ? `Active: ${settings.ambientParticles}` : 'Disabled'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
              {PARTICLE_OPTIONS.map((part) => {
                const isSelected = (settings.ambientParticles || 'off') === part.id;
                return (
                  <button
                    key={part.id}
                    onClick={() => updateSettings({ ambientParticles: part.id })}
                    style={{
                      padding: '5px 2px',
                      backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.16)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '1px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
                      borderRadius: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{part.icon}</span>
                    <span style={{ fontSize: '8.5px', color: isSelected ? 'var(--nova-cyan)' : 'var(--nova-text-secondary)', fontWeight: isSelected ? 700 : 400 }}>
                      {part.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Procedural Sound FX & Haptic Audio Feedback */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-widget)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {settings.enableSoundEffects !== false ? (
                  <Volume2 size={13} style={{ color: 'var(--nova-blue)' }} />
                ) : (
                  <VolumeX size={13} style={{ color: 'var(--nova-text-muted)' }} />
                )}
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
                    Tactile Sound Effects & Acoustic Feedback
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>
                    Procedural audio clicks on interactions, soft glass chimes on expand/collapse
                  </div>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ enableSoundEffects: settings.enableSoundEffects === false ? true : false })}
                style={{
                  padding: '3px 9px',
                  borderRadius: 'var(--nova-radius-pill)',
                  backgroundColor: settings.enableSoundEffects !== false ? 'var(--nova-blue)' : 'rgba(255,255,255,0.06)',
                  color: settings.enableSoundEffects !== false ? '#fff' : 'var(--nova-text-muted)',
                  fontSize: '9px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {settings.enableSoundEffects !== false ? 'Enabled' : 'Muted'}
              </button>
            </div>

            {settings.enableSoundEffects !== false && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                <span style={{ fontSize: '9px', color: 'var(--nova-text-muted)', whiteSpace: 'nowrap' }}>
                  Volume: {settings.soundVolume ?? 70}%
                </span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={settings.soundVolume ?? 70}
                  onChange={(e) => updateSettings({ soundVolume: Number(e.target.value) })}
                  style={{ flex: 1 }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Notch Shapes & Spacing */}
      {activeTab === 'shapes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {/* Shapes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {NOTCH_STYLES.map((shape) => {
              const isSelected = settings.notchStyle === shape.id;
              return (
                <button
                  key={shape.id}
                  onClick={() => updateSettings({ notchStyle: shape.id })}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--nova-surface)',
                    border: isSelected ? '1.5px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
                    borderRadius: 'var(--nova-radius-widget)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 3,
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? 'var(--nova-cyan)' : 'var(--nova-text-primary)' }}>
                      {shape.label}
                    </span>
                    {shape.tag && (
                      <span style={{ fontSize: '8px', padding: '1px 4px', backgroundColor: 'var(--nova-cyan)', color: '#000', borderRadius: 3, fontWeight: 700 }}>
                        {shape.tag}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>{shape.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Spacing & Offset Adjuster Box */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-widget)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-text-secondary)' }}>
                ANCHOR POSITION & BEZEL SPACING
              </span>
              <button
                onClick={() => updateSettings({ topOffset: 0, sideMargin: 16, screenPosition: 'top-center' })}
                style={{ fontSize: '9px', color: 'var(--nova-cyan)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Snap to Bezel
              </button>
            </div>

            {/* Position Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
              {POSITIONS.map((pos) => {
                const isSelected = settings.screenPosition === pos.id;
                return (
                  <button
                    key={pos.id}
                    onClick={() => updateSettings({ screenPosition: pos.id })}
                    style={{
                      padding: '4px',
                      fontSize: '9px',
                      borderRadius: 4,
                      backgroundColor: isSelected ? 'var(--nova-blue)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#fff' : 'var(--nova-text-secondary)',
                      border: '1px solid var(--nova-border)',
                      cursor: 'pointer',
                    }}
                  >
                    {pos.label}
                  </button>
                );
              })}
            </div>

            {/* Spacing Sliders */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--nova-text-muted)', marginBottom: 2 }}>
                  <span>Top Offset (Bezel Distance)</span>
                  <span>{settings.topOffset ?? 0}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={settings.topOffset ?? 0}
                  onChange={(e) => updateSettings({ topOffset: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--nova-text-muted)', marginBottom: 2 }}>
                  <span>Side Margin</span>
                  <span>{settings.sideMargin ?? 16}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={80}
                  value={settings.sideMargin ?? 16}
                  onChange={(e) => updateSettings({ sideMargin: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Edge Lighting & RGB */}
      {activeTab === 'edge' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {/* Master Toggle Banner */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: isRgbActive ? 'rgba(96, 165, 250, 0.12)' : 'var(--nova-surface)',
              border: isRgbActive ? '1px solid var(--nova-blue)' : '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-widget)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} style={{ color: isRgbActive ? 'var(--nova-blue)' : 'var(--nova-text-muted)' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
                Edge Lighting Engine {isRgbActive ? 'Active' : 'Off'}
              </span>
            </div>

            <button
              onClick={() => updateSettings({ enableRgbBorder: !isRgbActive, themeMode: isRgbActive ? 'minimal' : 'rgb' })}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--nova-radius-pill)',
                backgroundColor: isRgbActive ? 'var(--nova-blue)' : 'rgba(255,255,255,0.06)',
                color: isRgbActive ? '#fff' : 'var(--nova-text-muted)',
                fontSize: '10px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {isRgbActive ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Edge Lighting Modes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {EDGE_MODES.map((mode) => {
              const isSelected = settings.edgeLightingMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => updateSettings({ edgeLightingMode: mode.id, enableRgbBorder: mode.id !== 'off' })}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: isSelected ? 'rgba(102, 136, 255, 0.15)' : 'var(--nova-surface)',
                    border: isSelected ? '1.5px solid var(--nova-blue)' : '1px solid var(--nova-border)',
                    borderRadius: 'var(--nova-radius-widget)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 3,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? 'var(--nova-blue)' : 'var(--nova-text-primary)' }}>
                    {mode.label}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>{mode.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Color Beams & Speed */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
            <div style={{ padding: '8px 10px', backgroundColor: 'var(--nova-surface)', border: '1px solid var(--nova-border)', borderRadius: 'var(--nova-radius-widget)' }}>
              <div style={{ fontSize: '9px', color: 'var(--nova-text-secondary)', fontWeight: 600, marginBottom: 6 }}>LIGHTING BEAM COLOR</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                {EDGE_COLORS.map((col) => {
                  const isSelected = settings.edgeLightingColor === col.id;
                  return (
                    <button
                      key={col.id}
                      onClick={() => updateSettings({ edgeLightingColor: col.id })}
                      style={{
                        padding: '4px',
                        fontSize: '9px',
                        borderRadius: 4,
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '1px solid var(--nova-blue)' : '1px solid var(--nova-border)',
                        color: 'var(--nova-text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot }} />
                      <span style={{ whiteSpace: 'nowrap' }}>{col.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ padding: '8px 10px', backgroundColor: 'var(--nova-surface)', border: '1px solid var(--nova-border)', borderRadius: 'var(--nova-radius-widget)' }}>
              <div style={{ fontSize: '9px', color: 'var(--nova-text-secondary)', fontWeight: 600, marginBottom: 6 }}>FLOW SPEED</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(['slow', 'normal', 'fast'] as const).map((spd) => {
                  const isSelected = (settings.edgeLightingSpeed || 'normal') === spd;
                  return (
                    <button
                      key={spd}
                      onClick={() => updateSettings({ edgeLightingSpeed: spd })}
                      style={{
                        padding: '3px 6px',
                        fontSize: '9px',
                        borderRadius: 4,
                        backgroundColor: isSelected ? 'var(--nova-blue)' : 'rgba(255,255,255,0.02)',
                        color: isSelected ? '#fff' : 'var(--nova-text-secondary)',
                        border: '1px solid var(--nova-border)',
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                      }}
                    >
                      {spd}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Audio-Reactive Equalizer Edge Lighting */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: settings.enableAudioReactiveLighting ? 'rgba(56, 189, 248, 0.12)' : 'var(--nova-surface)',
              border: settings.enableAudioReactiveLighting ? '1px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-widget)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Music size={14} style={{ color: settings.enableAudioReactiveLighting ? 'var(--nova-cyan)' : 'var(--nova-text-muted)' }} />
              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
                  Audio-Reactive Equalizer Edge Lighting
                </div>
                <div style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>
                  Glow pulses rhythmically and casts dynamic equalizer light waves when YouTube or music is playing
                </div>
              </div>
            </div>

            <button
              onClick={() => updateSettings({ enableAudioReactiveLighting: !settings.enableAudioReactiveLighting })}
              style={{
                padding: '3px 9px',
                borderRadius: 'var(--nova-radius-pill)',
                backgroundColor: settings.enableAudioReactiveLighting ? 'var(--nova-cyan)' : 'rgba(255,255,255,0.06)',
                color: settings.enableAudioReactiveLighting ? '#000' : 'var(--nova-text-muted)',
                fontSize: '9px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {settings.enableAudioReactiveLighting ? 'Active' : 'Off'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Mascot & Island Branding */}
      {activeTab === 'mascot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', fontWeight: 600 }}>
            COLLAPSED CAPSULE BRANDING & ANIMATED COMPANION
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {MASCOT_OPTIONS.map((mascot) => {
              const isSelected = (settings.pillBrandBadge || 'robot') === mascot.id;
              return (
                <button
                  key={mascot.id}
                  onClick={() => updateSettings({ pillBrandBadge: mascot.id })}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--nova-surface)',
                    border: isSelected ? '1.5px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
                    borderRadius: 'var(--nova-radius-widget)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '24px' }}>{mascot.preview}</div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? 'var(--nova-cyan)' : 'var(--nova-text-primary)' }}>
                      {mascot.label}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--nova-text-muted)', marginTop: 2 }}>
                      {mascot.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(56, 189, 248, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: 'var(--nova-radius-widget)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '10px',
              color: 'var(--nova-text-secondary)',
            }}
          >
            <Bot size={16} style={{ color: 'var(--nova-cyan)', flexShrink: 0 }} />
            <span>
              The selected companion animates on your collapsed island pill at the top of Windows with idle breathing, eye blinking, and reaction gestures!
            </span>
          </div>
        </div>
      )}

      {/* Tab 5: Capsule Display Content */}
      {activeTab === 'display' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', fontWeight: 600 }}>
            DEFAULT CAPSULE DISPLAY ON DESKTOP
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {PILL_DISPLAY_OPTIONS.map((opt) => {
              const isSelected = (settings.pillDisplayContent || 'smart-auto') === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => updateSettings({ pillDisplayContent: opt.id })}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: isSelected ? 'rgba(102, 136, 255, 0.15)' : 'var(--nova-surface)',
                    border: isSelected ? '1.5px solid var(--nova-blue)' : '1px solid var(--nova-border)',
                    borderRadius: 'var(--nova-radius-widget)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '20px' }}>{opt.icon}</div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: isSelected ? 'var(--nova-blue)' : 'var(--nova-text-primary)' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--nova-text-muted)', marginTop: 2 }}>
                      {opt.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
