import React, { useState, useEffect } from 'react';
import { BarChart2, ShieldCheck, Clock, RefreshCw, Activity } from 'lucide-react';

interface AppStat {
  name: string;
  duration: string;
  percent: number;
  color: string;
}

export const ScreenTimeView: React.FC = () => {
  const [totalTime, setTotalTime] = useState('—');
  const [focusPercent, setFocusPercent] = useState<number | null>(null);
  const [idleMins, setIdleMins] = useState<number | null>(null);
  const [apps, setApps] = useState<AppStat[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    const ipc = window.novaDesktop;
    if (!ipc) return;
    setLoading(true);
    try {
      const data = await ipc.invoke('get-screen-time');
      if (!data) return;
      setTotalTime(data.totalScreenTime);
      setFocusPercent(data.focusPercent);
      setIdleMins(data.idleMinutes);
      setApps(data.apps);
    } catch {
      setTotalTime('—');
      setFocusPercent(null);
      setIdleMins(null);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 285 }}>
      {/* Top Total Time Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
        }}
      >
        <div>
          <div style={{ fontSize: '10.5px', color: 'var(--nova-text-secondary)', fontWeight: 600 }}>
            TODAY'S SCREEN TIME
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--nova-text-primary)' }}>
            {totalTime}
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '10.5px', color: 'var(--nova-text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            <span>Active Focus: <strong style={{ color: 'var(--nova-success)' }}>{focusPercent === null ? '—' : focusPercent + '%'}</strong></span>
            <button
              onClick={fetchStats}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--nova-cyan)',
                cursor: 'pointer',
                padding: 2,
                display: 'inline-flex',
                alignItems: 'center',
              }}
              title="Refresh Screen Time"
            >
              <RefreshCw size={11} className={loading ? 'spin' : ''} />
            </button>
          </div>
          <div style={{ marginTop: 2 }}>Idle Excluded: {idleMins === null ? '—' : idleMins + 'm'}</div>
        </div>
      </div>

      {/* Real Application Usage Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
        {apps.length === 0 && <p style={{ fontSize: 12, color: 'var(--nova-text-secondary)' }}>No app usage sampled yet.</p>}
        {apps.map((app) => (
          <div key={app.name} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px' }}>
              <span style={{ fontWeight: 600, color: 'var(--nova-text-primary)' }}>{app.name}</span>
              <span style={{ color: 'var(--nova-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {app.duration} ({app.percent}%)
              </span>
            </div>
            <div style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(app.percent, 100)}%`,
                  height: '100%',
                  backgroundColor: app.color || 'var(--nova-blue)',
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
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
          padding: '6px 10px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-input)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '9.5px',
          color: 'var(--nova-text-muted)',
        }}
      >
        <ShieldCheck size={11} style={{ color: 'var(--nova-success)' }} />
        <span>Foreground app time and idle time sampled locally while NOVA runs.</span>
      </div>
    </div>
  );
};
