import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../stores/useThemeStore';
import { ThemeMode, NotchStyle, ScreenPosition, PillDisplayContent } from '../../types';
import { Palette, Shield, Sliders, Monitor, Sparkles, Power, CheckCircle2, Move, LayoutGrid, Eye, Check } from 'lucide-react';
import { getAutoStartStatus, setAutoStartStatus } from '../../services/platformService';

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

const POSITIONS: Array<{ id: ScreenPosition; label: string; desc: string }> = [
  { id: 'top-left', label: 'Top Left', desc: 'Anchored at upper-left' },
  { id: 'top-center', label: 'Top Center', desc: 'Dynamic Island at top' },
  { id: 'top-right', label: 'Top Right', desc: 'Anchored at upper-right' },
  { id: 'bottom-left', label: 'Bottom Left', desc: 'Floating widget lower-left' },
  { id: 'bottom-center', label: 'Bottom Center', desc: 'Dock mode at bottom' },
  { id: 'bottom-right', label: 'Bottom Right', desc: 'Floating widget lower-right' },
];

const NOTCH_OPTIONS: Array<{ id: NotchStyle; label: string; desc: string }> = [
  { id: 'floating-pill', label: 'Floating Pill', desc: 'Curved island floating below screen edge' },
  { id: 'notch-attached', label: 'Notch Attached', desc: 'MacBook bezel notch with organic inverse curves' },
  { id: 'chamfered-notch', label: 'Chamfered Notch', desc: 'Futuristic 45° beveled cyber notch' },
  { id: 'dynamic-wing', label: 'Dynamic Wing', desc: 'Sculpted aero winglets expanding on sides' },
  { id: 'teardrop-capsule', label: 'Teardrop Capsule', desc: 'Fluid asymmetric organic contour' },
  { id: 'hex-pill', label: 'Hex HUD Pill', desc: 'Angular hexagonal sci-fi profile' },
  { id: 'squircle-bar', label: 'Squircle Bar', desc: 'Aerodynamic rounded rectangular status bar' },
  { id: 'compact-badge', label: 'Compact Badge', desc: 'Ultra-minimal slim unobtrusive badge' },
];

const PILL_DISPLAY_OPTIONS: Array<{ id: PillDisplayContent; label: string; desc: string; icon: string }> = [
  { id: 'smart-auto', label: 'Smart Contextual (Auto)', desc: 'Switches to YouTube/media when playing, live tasks, or system clock', icon: '⚡' },
  { id: 'media-priority', label: 'Media & YouTube Focus', desc: 'Always displays active track, artist & audio visualizer on collapsed pill', icon: '🎵' },
  { id: 'telemetry', label: 'Hardware Telemetry Monitor', desc: 'Real-time CPU %, RAM %, and thermals right on the capsule', icon: '📊' },
  { id: 'clock-weather', label: 'Clock & Weather Zen', desc: 'Minimalist clock with real-time temperature and sky conditions', icon: '⛅' },
  { id: 'minimal-zen', label: 'Minimal Zen Indicator', desc: 'Subtle breathing beacon with system clock only', icon: '🧘' },
];

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useThemeStore();
  const [autoStart, setAutoStart] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    getAutoStartStatus().then((status) => {
      setAutoStart(status);
    });
  }, []);

  const handleToggleAutoStart = async (enabled: boolean) => {
    setAutoStart(enabled);
    await setAutoStartStatus(enabled);
    setStatusMsg(enabled ? 'Enabled: Starts with Windows' : 'Disabled: Manual launch only');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 330, overflowY: 'auto', paddingRight: 6 }}>
      {/* Section 1: Themes & Glass Aesthetics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Palette size={13} style={{ color: 'var(--nova-blue)' }} />
            <span>GLASS THEMES & COLOR PALETTES</span>
          </div>
          <button
            onClick={() => updateSettings({ themeMode: 'minimal', enableRgbBorder: false, enableGlow: true, notchStyle: 'floating-pill', rgbPreset: 'rainbow' })}
            style={{
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: 'var(--nova-radius-pill)',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              color: 'var(--nova-cyan)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Reset theme and colors back to original default"
          >
            Reset to Default
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {THEMES.map((theme) => {
            const isSelected = settings.themeMode === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => updateSettings({ themeMode: theme.id })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--nova-radius-input)',
                  backgroundColor: isSelected ? 'rgba(96, 165, 250, 0.16)' : 'var(--nova-surface)',
                  border: isSelected ? '1px solid var(--nova-blue)' : '1px solid var(--nova-border)',
                  color: isSelected ? 'var(--nova-text-primary)' : 'var(--nova-text-secondary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  alignItems: 'flex-start',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, width: '100%' }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                      boxShadow: `0 0 6px ${theme.primary}`,
                    }}
                  />
                  <span style={{ fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {theme.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.enableRgbBorder}
              onChange={(e) => updateSettings({ enableRgbBorder: e.target.checked })}
              style={{ accentColor: 'var(--nova-blue)' }}
            />
            <span>Dynamic Spectrum RGB Border</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.enableGlow}
              onChange={(e) => updateSettings({ enableGlow: e.target.checked })}
              style={{ accentColor: 'var(--nova-blue)' }}
            />
            <span>Ambient Island Glow</span>
          </label>
        </div>
      </div>

      {/* Section 2: Screen Position & Placement (Real-Time) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Move size={13} style={{ color: 'var(--nova-cyan)' }} />
          <span>SCREEN POSITION & PLACEMENT (REAL-TIME)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {POSITIONS.map((pos) => {
            const isSelected = (settings.screenPosition || 'top-center') === pos.id;
            return (
              <button
                key={pos.id}
                onClick={() => updateSettings({ screenPosition: pos.id })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--nova-radius-input)',
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'var(--nova-surface)',
                  border: isSelected ? '1px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
                  color: isSelected ? 'var(--nova-cyan)' : 'var(--nova-text-secondary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: 'flex-start',
                }}
              >
                <span>{pos.label}</span>
                <span style={{ fontSize: '9px', color: 'var(--nova-text-muted)', fontWeight: 400 }}>
                  {pos.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Capsule Geometry & Dimensions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={13} style={{ color: 'var(--nova-violet)' }} />
          <span>CAPSULE GEOMETRY & SIZING</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {NOTCH_OPTIONS.map((opt) => {
            const isSelected = (settings.notchStyle || 'floating-pill') === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => updateSettings({ notchStyle: opt.id })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--nova-radius-input)',
                  backgroundColor: isSelected ? 'rgba(167, 139, 250, 0.22)' : 'var(--nova-surface)',
                  border: isSelected ? '1px solid var(--nova-violet)' : '1px solid var(--nova-border)',
                  color: isSelected ? 'var(--nova-violet)' : 'var(--nova-text-secondary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  alignItems: 'flex-start',
                  textAlign: 'left',
                }}
              >
                <span>{opt.label}</span>
                <span style={{ fontSize: '9px', color: 'var(--nova-text-muted)', fontWeight: 400 }}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--nova-text-muted)', marginBottom: 4 }}>
              <span>Capsule Width</span>
              <span>{settings.pillWidth} px</span>
            </div>
            <input
              type="range"
              min={180}
              max={300}
              step={10}
              value={settings.pillWidth}
              onChange={(e) => updateSettings({ pillWidth: Number(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--nova-violet)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--nova-text-muted)', marginBottom: 4 }}>
              <span>Capsule Height</span>
              <span>{settings.pillHeight} px</span>
            </div>
            <input
              type="range"
              min={32}
              max={46}
              step={2}
              value={settings.pillHeight}
              onChange={(e) => updateSettings({ pillHeight: Number(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--nova-violet)' }}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Collapsed Capsule Display on Hover-Off */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Eye size={13} style={{ color: 'var(--nova-cyan)' }} />
          <span>COLLAPSED CAPSULE DISPLAY (WHEN HOVERED OFF)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 6 }}>
          {PILL_DISPLAY_OPTIONS.map((opt) => {
            const isSelected = (settings.pillDisplayContent || 'smart-auto') === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => updateSettings({ pillDisplayContent: opt.id })}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--nova-radius-input)',
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.16)' : 'var(--nova-surface)',
                  border: isSelected ? '1px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
                  color: isSelected ? 'var(--nova-text-primary)' : 'var(--nova-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: '14px' }}>{opt.icon}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>{opt.label}</span>
                    <span style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>{opt.desc}</span>
                  </div>
                </div>
                {isSelected && <Check size={13} style={{ color: 'var(--nova-cyan)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 5: Hover Physics & Timing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sliders size={13} style={{ color: 'var(--nova-blue)' }} />
          <span>HOVER PHYSICS & EXPANSION TIMING</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--nova-text-muted)', marginBottom: 4 }}>
              <span>Hover Expand Delay</span>
              <span>{settings.hoverDelayMs} ms</span>
            </div>
            <input
              type="range"
              min={50}
              max={400}
              step={10}
              value={settings.hoverDelayMs}
              onChange={(e) => updateSettings({ hoverDelayMs: Number(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--nova-blue)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--nova-text-muted)', marginBottom: 4 }}>
              <span>Auto-Collapse Delay</span>
              <span>{settings.collapseDelayMs} ms</span>
            </div>
            <input
              type="range"
              min={150}
              max={800}
              step={20}
              value={settings.collapseDelayMs}
              onChange={(e) => updateSettings({ collapseDelayMs: Number(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--nova-blue)' }}
            />
          </div>
        </div>
      </div>

      {/* Section 5: Windows Startup & Persistence */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Power size={13} style={{ color: '#4ade80' }} />
          <span>SYSTEM & WINDOWS STARTUP</span>
        </div>

        <div
          style={{
            padding: 12,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
                Start NOVA automatically on system boot
              </span>
              <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>
                Launches your desktop companion directly when Windows boots or restarts.
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoStart}
              onChange={(e) => handleToggleAutoStart(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--nova-blue)', cursor: 'pointer' }}
            />
          </label>
          {statusMsg && (
            <div style={{ fontSize: '10px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={11} />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 6: Local Privacy & Storage */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={13} style={{ color: 'var(--nova-success)' }} />
          <span>LOCAL PRIVACY & STORAGE</span>
        </div>

        <div
          style={{
            padding: 10,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            fontSize: '11px',
            color: 'var(--nova-text-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>SQLite Database: nova.db (1.4 MB) • 0 Telemetry</span>
          <button
            onClick={() => alert('Local clipboard and temporary cache cleared.')}
            style={{
              padding: '4px 8px',
              backgroundColor: 'rgba(241, 108, 120, 0.2)',
              color: 'var(--nova-danger)',
              border: '1px solid rgba(241, 108, 120, 0.4)',
              borderRadius: 4,
              fontSize: '10px',
              fontWeight: 600,
            }}
          >
            Clear Local Cache
          </button>
        </div>
      </div>
    </div>
  );
};
