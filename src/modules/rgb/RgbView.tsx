import React from 'react';
import { Sparkles, Music, Sliders, Palette } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';

export const RgbView: React.FC = () => {
  const { settings, updateSettings } = useThemeStore();

  const presets = [
    { name: 'Cyberpunk Neon', colors: '#6688FF, #956AFF, #54D7E8' },
    { name: 'Sunset Glow', colors: '#F16C78, #F3B95B, #956AFF' },
    { name: 'Oceanic Breeze', colors: '#54D7E8, #49C98A, #6688FF' },
    { name: 'Aurora Borealis', colors: '#49C98A, #54D7E8, #956AFF' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: 320 }}>
      {/* Top Banner */}
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
            DYNAMIC RGB & EDGE LIGHTING ENGINE
          </div>
          <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', marginTop: 2 }}>
            Low-overhead GPU shader borders around the top Dynamic Island
          </div>
        </div>

        <button
          onClick={() => updateSettings({ enableRgbBorder: !settings.enableRgbBorder })}
          style={{
            padding: '6px 14px',
            backgroundColor: settings.enableRgbBorder ? 'var(--nova-blue)' : 'rgba(255,255,255,0.06)',
            color: '#fff',
            borderRadius: 'var(--nova-radius-pill)',
            fontSize: '11px',
            fontWeight: 600,
            border: '1px solid var(--nova-border)',
          }}
        >
          RGB: {settings.enableRgbBorder ? 'ENABLED' : 'DISABLED'}
        </button>
      </div>

      {/* Presets Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600 }}>
          COLORWAY PRESETS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {presets.map((p) => (
            <div
              key={p.name}
              onClick={() => updateSettings({ enableRgbBorder: true, themeMode: 'rgb' })}
              style={{
                padding: 10,
                backgroundColor: 'var(--nova-surface)',
                border: '1px solid var(--nova-border)',
                borderRadius: 'var(--nova-radius-input)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${p.colors})`,
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Music-Reactive & Glow Controls */}
      <div
        style={{
          padding: 12,
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.enableGlow}
            onChange={(e) => updateSettings({ enableGlow: e.target.checked })}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} style={{ color: 'var(--nova-cyan)' }} /> Music-Reactive Ambient Glow Pulses
          </span>
        </label>
      </div>
    </div>
  );
};
