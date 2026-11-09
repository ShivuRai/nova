import React from 'react';
import { TrendingUp, Users, Eye, ArrowUpRight, Globe } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const sources = [
    { source: 'GitHub Repositories', visitors: '1,420', share: 48 },
    { source: 'Direct / Bookmarks', visitors: '860', share: 29 },
    { source: 'Twitter / X', visitors: '410', share: 14 },
    { source: 'Reddit (r/windows)', visitors: '260', share: 9 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 320 }}>
      {/* Top Glance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: 'var(--nova-surface)', border: '1px solid var(--nova-border)', borderRadius: 'var(--nova-radius-widget)' }}>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={12} style={{ color: 'var(--nova-blue)' }} /> TODAY VISITORS
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
            2,950
          </div>
          <div style={{ fontSize: '10px', color: 'var(--nova-success)', display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
            <ArrowUpRight size={10} /> +18.4%
          </div>
        </div>

        <div style={{ padding: 10, backgroundColor: 'var(--nova-surface)', border: '1px solid var(--nova-border)', borderRadius: 'var(--nova-radius-widget)' }}>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={12} style={{ color: 'var(--nova-cyan)' }} /> PAGEVIEWS
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
            8,420
          </div>
          <div style={{ fontSize: '10px', color: 'var(--nova-success)', display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
            <ArrowUpRight size={10} /> +12.1%
          </div>
        </div>

        <div style={{ padding: 10, backgroundColor: 'var(--nova-surface)', border: '1px solid var(--nova-border)', borderRadius: 'var(--nova-radius-widget)' }}>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Globe size={12} style={{ color: 'var(--nova-violet)' }} /> BOUNCE RATE
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4 }}>
            34.2%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--nova-success)', display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
            Healthy
          </div>
        </div>
      </div>

      {/* Top Sources */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600 }}>
          TOP TRAFFIC SOURCES (PLAUSIBLE API)
        </div>
        {sources.map((s) => (
          <div key={s.source} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span>{s.source}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nova-text-secondary)' }}>{s.visitors} ({s.share}%)</span>
            </div>
            <div style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${s.share}%`, height: '100%', backgroundColor: 'var(--nova-blue)', borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Connection Status */}
      <div style={{ marginTop: 'auto', fontSize: '10px', color: 'var(--nova-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Connected site: nova-desktop.org</span>
        <span style={{ color: 'var(--nova-success)' }}>● Live Sync</span>
      </div>
    </div>
  );
};
