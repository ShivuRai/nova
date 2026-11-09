import React from 'react';
import { useThemeStore } from '../../stores/useThemeStore';
import { ThemeMode, NotchStyle } from '../../types';
import { Palette, Shield, Sliders, Monitor, Sparkles } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useThemeStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 310, overflowY: 'auto', paddingRight: 6 }}>
      {/* Section 1: Appearance & Themes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Palette size={13} style={{ color: 'var(--nova-blue)' }} />
          <span>APPEARANCE & THEME</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {(['minimal', 'rgb', 'light', 'vivid'] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => updateSettings({ themeMode: mode })}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--nova-radius-input)',
                backgroundColor:
                  settings.themeMode === mode ? 'rgba(102, 136, 255, 0.2)' : 'var(--nova-surface)',
                border:
                  settings.themeMode === mode
                    ? '1px solid var(--nova-blue)'
                    : '1px solid var(--nova-border)',
                color: settings.themeMode === mode ? 'var(--nova-blue)' : 'var(--nova-text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.enableRgbBorder}
              onChange={(e) => updateSettings({ enableRgbBorder: e.target.checked })}
            />
            <span>Enable Gaming RGB Edge Border</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.enableGlow}
              onChange={(e) => updateSettings({ enableGlow: e.target.checked })}
            />
            <span>Subtle Island Glow</span>
          </label>
        </div>
      </div>

      {/* Section 2: Notch Style */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={13} style={{ color: 'var(--nova-violet)' }} />
          <span>NOTCH GEOMETRY</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {(['floating-pill', 'notch-attached', 'extended-island'] as NotchStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => updateSettings({ notchStyle: style })}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--nova-radius-input)',
                backgroundColor:
                  settings.notchStyle === style ? 'rgba(149, 106, 255, 0.2)' : 'var(--nova-surface)',
                border:
                  settings.notchStyle === style
                    ? '1px solid var(--nova-violet)'
                    : '1px solid var(--nova-border)',
                color: settings.notchStyle === style ? 'var(--nova-violet)' : 'var(--nova-text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {style.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Section 3: Hover Delays */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sliders size={13} style={{ color: 'var(--nova-cyan)' }} />
          <span>HOVER PHYSICS & TIMING</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--nova-text-muted)', marginBottom: 4 }}>
              <span>Hover Delay</span>
              <span>{settings.hoverDelayMs} ms</span>
            </div>
            <input
              type="range"
              min={50}
              max={400}
              step={10}
              value={settings.hoverDelayMs}
              onChange={(e) => updateSettings({ hoverDelayMs: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--nova-text-muted)', marginBottom: 4 }}>
              <span>Collapse Delay</span>
              <span>{settings.collapseDelayMs} ms</span>
            </div>
            <input
              type="range"
              min={150}
              max={800}
              step={20}
              value={settings.collapseDelayMs}
              onChange={(e) => updateSettings({ collapseDelayMs: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Privacy & Data Storage */}
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
