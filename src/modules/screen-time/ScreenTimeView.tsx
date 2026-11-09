import React from 'react';
import { BarChart2, ShieldCheck, Clock } from 'lucide-react';

export const ScreenTimeView: React.FC = () => {
  const appStats = [
    { name: 'Visual Studio Code', duration: '3h 45m', percent: 45, color: 'var(--nova-blue)' },
    { name: 'Google Chrome', duration: '2h 10m', percent: 28, color: 'var(--nova-cyan)' },
    { name: 'Windows Terminal', duration: '1h 15m', percent: 16, color: 'var(--nova-violet)' },
    { name: 'Slack / Discord', duration: '45m', percent: 11, color: 'var(--nova-warning)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 320 }}>
      {/* Top Total Time Banner */}
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
          <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600 }}>
            TODAY'S SCREEN TIME
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--nova-text-primary)' }}>
            7h 55m
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--nova-text-muted)' }}>
          <div>Active Focus: <span style={{ color: 'var(--nova-success)', fontWeight: 600 }}>82%</span></div>
          <div>Idle Excluded: 42m</div>
        </div>
      </div>

      {/* Application Usage Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {appStats.map((app) => (
          <div key={app.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ fontWeight: 600 }}>{app.name}</span>
              <span style={{ color: 'var(--nova-text-secondary)', fontFamily: 'var(--font-mono)' }}>{app.duration} ({app.percent}%)</span>
            </div>
            <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${app.percent}%`,
                  height: '100%',
                  backgroundColor: app.color,
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Guarantee */}
      <div
        style={{
          marginTop: 'auto',
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-input)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '10px',
          color: 'var(--nova-text-muted)',
        }}
      >
        <ShieldCheck size={12} style={{ color: 'var(--nova-success)' }} />
        <span>Strictly local foreground process title logging • Zero keylogging • Zero screen capturing</span>
      </div>
    </div>
  );
};
