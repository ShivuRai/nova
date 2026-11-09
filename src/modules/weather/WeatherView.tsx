import React from 'react';
import { CloudSun, Wind, Droplets, Sun, CloudRain } from 'lucide-react';

export const WeatherView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Top Banner: Current City & Temp */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
        }}
      >
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
            Bengaluru, India
          </div>
          <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)' }}>
            Partly Cloudy • Feels like 24°C
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CloudSun size={32} style={{ color: 'var(--nova-warning)' }} />
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--nova-text-primary)',
            }}
          >
            23°C
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>HUMIDITY</div>
          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Droplets size={12} style={{ color: 'var(--nova-cyan)' }} /> 68%
          </div>
        </div>

        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>WIND</div>
          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Wind size={12} style={{ color: 'var(--nova-blue)' }} /> 14 km/h
          </div>
        </div>

        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>UV INDEX</div>
          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Sun size={12} style={{ color: 'var(--nova-warning)' }} /> 5 (Mod)
          </div>
        </div>

        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>RAIN PROB</div>
          <div style={{ fontSize: '12px', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <CloudRain size={12} style={{ color: 'var(--nova-blue)' }} /> 10%
          </div>
        </div>
      </div>

      {/* Hourly Strip */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          fontSize: '11px',
          textAlign: 'center',
        }}
      >
        {['Now (23°)', '20:00 (22°)', '21:00 (21°)', '22:00 (20°)', '23:00 (19°)'].map((slot, idx) => (
          <div key={idx}>
            <div style={{ color: 'var(--nova-text-secondary)', fontSize: '10px' }}>{slot.split(' ')[0]}</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{slot.split(' ')[1]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
