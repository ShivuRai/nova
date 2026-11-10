import React from 'react';
import { Sparkles, Sliders, Power, Check, ShieldCheck, Palette, Layers, Zap, Gauge } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { RgbPreset, NotchStyle, EdgeLightingMode, EdgeLightingColor, EdgeLightingSpeed } from '../../types';

interface PresetItem {
  id: RgbPreset;
  name: string;
  colors: string;
  desc: string;
}

const PRESETS: PresetItem[] = [
  { id: 'rainbow', name: 'Rainbow Spectrum', colors: '#60A5FA, #A78BFA, #F43F5E, #38BDF8, #34D399', desc: 'Full-gamut 360° chromatic sweep' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', colors: '#F43F5E, #D946EF, #06B6D4', desc: 'Hyper-saturated magenta and cyan' },
  { id: 'sunset', name: 'Sunset Glow', colors: '#F59E0B, #F43F5E, #9333EA', desc: 'Warm dusk twilight amber and rose' },
  { id: 'oceanic', name: 'Oceanic Breeze', colors: '#06B6D4, #10B981, #3B82F6', desc: 'Deep sea teal and arctic cobalt' },
  { id: 'aurora', name: 'Aurora Borealis', colors: '#10B981, #2DD4BF, #8B5CF6', desc: 'Vibrant northern green and violet' },
];

const NOTCH_STYLES: Array<{ id: NotchStyle; label: string; desc: string }> = [
  { id: 'floating-pill', label: 'Floating Pill', desc: 'Sleek floating dynamic island' },
  { id: 'notch-attached', label: 'Notch Attached', desc: 'MacBook bezel notch with organic curves' },
  { id: 'squircle-bar', label: 'Squircle Bar', desc: 'Modern curved rectangular bar' },
  { id: 'compact-badge', label: 'Compact Badge', desc: 'Minimalist slim status badge' },
  { id: 'chamfered-notch', label: 'Chamfered Notch', desc: 'Futuristic 45° beveled cyber notch' },
  { id: 'dynamic-wing', label: 'Dynamic Wing', desc: 'Sculpted aero winglets on sides' },
  { id: 'teardrop-capsule', label: 'Teardrop Capsule', desc: 'Fluid asymmetric organic contour' },
  { id: 'hex-pill', label: 'Hex HUD Pill', desc: 'Angular hexagonal sci-fi profile' },
];

const EDGE_MODES: Array<{ id: EdgeLightingMode; label: string; desc: string }> = [
  { id: 'continuous', label: 'Continuous Stream', desc: 'Perpetual perimeter border flow around edges' },
  { id: 'corners-inward', label: 'Corners Inward', desc: 'Dual beams sweeping from both corners inward' },
  { id: 'center-outward', label: 'Center Outward', desc: 'Central radiant pulse flowing outward to corners' },
  { id: 'breathing-glow', label: 'Breathing Rim', desc: 'Gentle organic breathing illumination' },
  { id: 'off', label: 'Edge Light Off', desc: 'Clean minimal border without animation' },
];

const EDGE_COLORS: Array<{ id: EdgeLightingColor; label: string; dot: string }> = [
  { id: 'cyan-pulse', label: 'Cyber Cyan', dot: '#38BDF8' },
  { id: 'emerald-beam', label: 'Emerald Mint', dot: '#10B981' },
  { id: 'sunset-flare', label: 'Sunset Amber', dot: '#F59E0B' },
  { id: 'violet-aurora', label: 'Electric Violet', dot: '#8B5CF6' },
  { id: 'pure-white', label: 'Platinum White', dot: '#FFFFFF' },
  { id: 'chromatic', label: 'Chromatic', dot: 'linear-gradient(135deg, #60A5FA, #F43F5E, #34D399)' },
];

const EDGE_SPEEDS: Array<{ id: EdgeLightingSpeed; label: string }> = [
  { id: 'slow', label: 'Calm (Slow)' },
  { id: 'normal', label: 'Smooth (Normal)' },
  { id: 'fast', label: 'Vibrant (Fast)' },
];

export const RgbView: React.FC = () => {
  const { settings, updateSettings } = useThemeStore();
  const isRgbActive = settings.enableRgbBorder || settings.themeMode === 'rgb';
  const currentPreset = settings.rgbPreset || 'rainbow';
  const currentEdgeMode = settings.edgeLightingMode || 'continuous';
  const currentEdgeColor = settings.edgeLightingColor || 'cyan-pulse';
  const currentEdgeSpeed = settings.edgeLightingSpeed || 'normal';

  const handleToggleRgb = (enable: boolean) => {
    if (enable) {
      updateSettings({ enableRgbBorder: true, themeMode: 'rgb' });
    } else {
      updateSettings({ enableRgbBorder: false, themeMode: 'minimal' });
    }
  };

  const handleSelectPreset = (preset: RgbPreset) => {
    updateSettings({
      enableRgbBorder: true,
      themeMode: 'rgb',
      rgbPreset: preset,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 330, overflowY: 'auto', paddingRight: 6 }}>
      {/* Top Master Controller Banner */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: isRgbActive ? 'rgba(96, 165, 250, 0.12)' : 'var(--nova-surface)',
          border: isRgbActive ? '1px solid var(--nova-blue)' : '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Sparkles size={14} style={{ color: isRgbActive ? 'var(--nova-blue)' : 'var(--nova-text-muted)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--nova-text-primary)' }}>
              DYNAMIC RGB & EDGE LIGHTING ENGINE
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', marginTop: 2 }}>
            {isRgbActive
              ? 'Status: Active GPU animated spectrum around the dynamic capsule'
              : 'Status: Disabled — Clean obsidian glass aesthetic'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isRgbActive ? (
            <button
              onClick={() => handleToggleRgb(false)}
              style={{
                padding: '6px 14px',
                backgroundColor: 'rgba(239, 68, 68, 0.18)',
                color: '#F87171',
                borderRadius: 'var(--nova-radius-pill)',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid rgba(239, 68, 68, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              title="Immediately disable RGB and revert to clean glass"
            >
              <Power size={11} />
              <span>Turn OFF RGB</span>
            </button>
          ) : (
            <button
              onClick={() => handleToggleRgb(true)}
              style={{
                padding: '6px 14px',
                backgroundColor: 'var(--nova-blue)',
                color: '#fff',
                borderRadius: 'var(--nova-radius-pill)',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid var(--nova-blue)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              title="Activate dynamic RGB border"
            >
              <Sparkles size={11} />
              <span>Turn ON RGB</span>
            </button>
          )}
        </div>
      </div>

      {/* Minimalistic Edge Lightings Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={12} style={{ color: 'var(--nova-blue)' }} />
          <span>MINIMALISTIC EDGE LIGHTING ANIMATIONS</span>
        </div>

        {/* Edge Animation Style Picker */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {EDGE_MODES.map((em) => {
            const isSelected = currentEdgeMode === em.id;
            return (
              <button
                key={em.id}
                onClick={() => updateSettings({ edgeLightingMode: em.id })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--nova-radius-input)',
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'var(--nova-surface)',
                  border: isSelected ? '1px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
                  color: isSelected ? 'var(--nova-cyan)' : 'var(--nova-text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>{em.label}</span>
                  {isSelected && <Check size={11} style={{ color: 'var(--nova-cyan)' }} />}
                </div>
                <span style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>{em.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Edge Color & Speed Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
          {/* Edge Colors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)', fontWeight: 600 }}>
              EDGE ILLUMINATION COLOR
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
              {EDGE_COLORS.map((ec) => {
                const isSelected = currentEdgeColor === ec.id;
                return (
                  <button
                    key={ec.id}
                    onClick={() => updateSettings({ edgeLightingColor: ec.id })}
                    style={{
                      padding: '4px 6px',
                      borderRadius: 6,
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'var(--nova-surface)',
                      border: isSelected ? '1px solid var(--nova-blue)' : '1px solid var(--nova-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      cursor: 'pointer',
                      fontSize: '9px',
                      color: 'var(--nova-text-secondary)',
                    }}
                    title={ec.label}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: ec.dot,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ec.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Edge Speed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)', fontWeight: 600 }}>
              BEAM ANIMATION SPEED
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {EDGE_SPEEDS.map((es) => {
                const isSelected = currentEdgeSpeed === es.id;
                return (
                  <button
                    key={es.id}
                    onClick={() => updateSettings({ edgeLightingSpeed: es.id })}
                    style={{
                      flex: 1,
                      padding: '5px 4px',
                      borderRadius: 6,
                      backgroundColor: isSelected ? 'var(--nova-blue)' : 'var(--nova-surface)',
                      color: isSelected ? '#fff' : 'var(--nova-text-secondary)',
                      border: isSelected ? '1px solid var(--nova-blue)' : '1px solid var(--nova-border)',
                      fontSize: '9px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {es.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Colorway Presets Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Palette size={12} style={{ color: 'var(--nova-cyan)' }} />
          <span>FULL SPECTRUM RGB PRESETS</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {PRESETS.map((p) => {
            const isSelected = isRgbActive && currentPreset === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                style={{
                  padding: '9px 12px',
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.16)' : 'var(--nova-surface)',
                  border: isSelected ? '1px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
                  borderRadius: 'var(--nova-radius-input)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${p.colors})`,
                    boxShadow: isSelected ? '0 0 8px var(--nova-cyan)' : 'none',
                    flexShrink: 0,
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
                      {p.name}
                    </span>
                    {isSelected && <Check size={12} style={{ color: 'var(--nova-cyan)' }} />}
                  </div>
                  <span style={{ fontSize: '9px', color: 'var(--nova-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Capsule Tip & Shape Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={12} style={{ color: 'var(--nova-violet)' }} />
          <span>CAPSULE SHAPE & BEZEL ATTACHMENT (8 SHAPES)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {NOTCH_STYLES.map((ns) => {
            const isSelected = (settings.notchStyle || 'floating-pill') === ns.id;
            return (
              <button
                key={ns.id}
                onClick={() => updateSettings({ notchStyle: ns.id })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--nova-radius-input)',
                  backgroundColor: isSelected ? 'rgba(167, 139, 250, 0.20)' : 'var(--nova-surface)',
                  border: isSelected ? '1px solid var(--nova-violet)' : '1px solid var(--nova-border)',
                  color: isSelected ? 'var(--nova-violet)' : 'var(--nova-text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>{ns.label}</span>
                  {isSelected && <Check size={11} style={{ color: 'var(--nova-violet)' }} />}
                </div>
                <span style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>{ns.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Natural Ambient Glow Settings */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
              Natural Ambient Aura & Glow
            </div>
            <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', marginTop: 2 }}>
              Soft organic Gaussian falloff with zero boxiness or clipping
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.enableGlow}
              onChange={(e) => updateSettings({ enableGlow: e.target.checked })}
              style={{ accentColor: 'var(--nova-blue)' }}
            />
            <span style={{ fontWeight: 600, color: settings.enableGlow ? 'var(--nova-cyan)' : 'var(--nova-text-muted)' }}>
              {settings.enableGlow ? 'Aura ON' : 'Aura OFF'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
