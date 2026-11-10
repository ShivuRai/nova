import React, { useState, useEffect } from 'react';
import {
  Globe,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

interface MonitoredSite {
  id: string;
  name: string;
  url: string;
  lastStatus: number | 'ERR' | null;
  lastLatencyMs: number | null;
  lastChecked: number | null;
  history: number[]; // recent latencies
}

const STORAGE_KEY = 'nova_monitored_sites_v2';

const DEFAULT_SITES: MonitoredSite[] = [
  {
    id: 'site-1',
    name: 'GitHub',
    url: 'https://github.com',
    lastStatus: null,
    lastLatencyMs: null,
    lastChecked: null,
    history: [],
  },
  {
    id: 'site-2',
    name: 'Google',
    url: 'https://www.google.com',
    lastStatus: null,
    lastLatencyMs: null,
    lastChecked: null,
    history: [],
  },
];

export const AnalyticsView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const [sites, setSites] = useState<MonitoredSite[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SITES;
    } catch {
      return DEFAULT_SITES;
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [isCheckingAll, setIsCheckingAll] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
    } catch (e) {
      console.error(e);
    }
  }, [sites]);

  const pingSite = async (site: MonitoredSite): Promise<MonitoredSite> => {
    let url = site.url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    const start = performance.now();
    try {
      // Use mode 'no-cors' so arbitrary domains can be pinged from the renderer without CORS blocking
      await fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' });
      const latency = Math.round(performance.now() - start);
      const newHistory = [...(site.history || []).slice(-9), latency];
      return {
        ...site,
        lastStatus: 200,
        lastLatencyMs: latency,
        lastChecked: Date.now(),
        history: newHistory,
      };
    } catch (e) {
      const latency = Math.round(performance.now() - start);
      return {
        ...site,
        lastStatus: 'ERR',
        lastLatencyMs: latency,
        lastChecked: Date.now(),
        history: [...(site.history || []).slice(-9), latency],
      };
    }
  };

  const pingAll = async () => {
    setIsCheckingAll(true);
    const updated = await Promise.all(sites.map((s) => pingSite(s)));
    setSites(updated);
    setIsCheckingAll(false);
  };

  useEffect(() => {
    // Initial ping on load
    pingAll();
  }, []);

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteUrl.trim()) return;

    let url = newSiteUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    const name = newSiteName.trim() || new URL(url).hostname;

    const newSite: MonitoredSite = {
      id: 'site-' + Date.now(),
      name,
      url,
      lastStatus: null,
      lastLatencyMs: null,
      lastChecked: null,
      history: [],
    };

    setSites([...sites, newSite]);
    setNewSiteName('');
    setNewSiteUrl('');
    setIsAdding(false);
    pingSite(newSite).then((pinged) => {
      setSites((curr) => curr.map((s) => (s.id === newSite.id ? pinged : s)));
    });
  };

  const handleDelete = (id: string) => {
    setSites(sites.filter((s) => s.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 320 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Activity size={13} style={{ color: 'var(--nova-blue)' }} />
          <span>LIVE WEBSITE & API UPTIME MONITOR</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={pingAll}
            disabled={isCheckingAll}
            style={{
              padding: '3px 8px',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-pill)',
              color: 'var(--nova-text-secondary)',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: isCheckingAll ? 'default' : 'pointer',
            }}
          >
            <RefreshCw size={10} className={isCheckingAll ? 'animate-spin' : ''} />
            <span>Ping All</span>
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            style={{
              padding: '3px 8px',
              backgroundColor: isAdding ? 'rgba(239, 68, 68, 0.15)' : 'rgba(102, 136, 255, 0.15)',
              border: isAdding ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(102, 136, 255, 0.3)',
              borderRadius: 'var(--nova-radius-pill)',
              color: isAdding ? 'var(--nova-danger)' : 'var(--nova-blue)',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Plus size={11} />
            <span>{isAdding ? 'Cancel' : '+ Monitor Site'}</span>
          </button>
        </div>
      </div>

      {/* Add Site Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddSite}
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-blue)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            gap: 8,
          }}
        >
          <input
            type="text"
            placeholder="Site Label (e.g. My Portfolio)"
            value={newSiteName}
            onChange={(e) => setNewSiteName(e.target.value)}
            onFocus={() => setInteracting(true)}
            onBlur={() => setInteracting(false)}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--nova-border)',
              borderRadius: 6,
              padding: '6px 8px',
              fontSize: '11px',
              color: 'var(--nova-text-primary)',
            }}
          />
          <input
            type="text"
            placeholder="URL or Domain (e.g. https://mysite.com)"
            value={newSiteUrl}
            onChange={(e) => setNewSiteUrl(e.target.value)}
            onFocus={() => setInteracting(true)}
            onBlur={() => setInteracting(false)}
            required
            style={{
              flex: 2,
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--nova-border)',
              borderRadius: 6,
              padding: '6px 8px',
              fontSize: '11px',
              color: 'var(--nova-text-primary)',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--nova-blue)',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Add
          </button>
        </form>
      )}

      {/* Monitored Sites List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
        {sites.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              color: 'var(--nova-text-muted)',
              fontSize: '11px',
              fontStyle: 'italic',
            }}
          >
            No websites monitored yet. Click "+ Monitor Site" above to add your domain!
          </div>
        ) : (
          sites.map((site) => {
            const isOk = site.lastStatus === 200;
            const isErr = site.lastStatus === 'ERR';
            const latency = site.lastLatencyMs;

            return (
              <div
                key={site.id}
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--nova-surface)',
                  border: isOk
                    ? '1px solid rgba(74, 222, 128, 0.25)'
                    : isErr
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid var(--nova-border)',
                  borderRadius: 'var(--nova-radius-widget)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: isOk ? 'var(--nova-success)' : isErr ? 'var(--nova-danger)' : '#94A3B8',
                        boxShadow: isOk ? '0 0 8px rgba(74, 222, 128, 0.6)' : undefined,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
                        {site.name}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>{site.url}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {latency !== null && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '11px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: latency < 200 ? 'var(--nova-success)' : latency < 600 ? 'var(--nova-warning)' : 'var(--nova-danger)',
                        }}
                      >
                        <Zap size={12} />
                        <span>{latency} ms</span>
                      </div>
                    )}

                    <button
                      onClick={async () => {
                        const updated = await pingSite(site);
                        setSites((curr) => curr.map((s) => (s.id === site.id ? updated : s)));
                      }}
                      style={{
                        padding: '4px 6px',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--nova-border)',
                        borderRadius: 4,
                        color: 'var(--nova-text-secondary)',
                        cursor: 'pointer',
                      }}
                      title="Re-check this site"
                    >
                      <RefreshCw size={11} />
                    </button>

                    <button
                      onClick={() => handleDelete(site.id)}
                      style={{
                        padding: '4px 6px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--nova-text-muted)',
                        cursor: 'pointer',
                      }}
                      title="Delete site"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Latency History Spark Bars */}
                {site.history && site.history.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 16, paddingTop: 4 }}>
                    <span style={{ fontSize: '9px', color: 'var(--nova-text-muted)', marginRight: 4 }}>History:</span>
                    {site.history.map((lat, idx) => {
                      const maxLat = Math.max(...site.history, 400);
                      const barH = Math.max(3, Math.min(16, Math.round((lat / maxLat) * 16)));
                      const col = lat < 200 ? 'var(--nova-success)' : lat < 600 ? 'var(--nova-warning)' : 'var(--nova-danger)';
                      return (
                        <div
                          key={idx}
                          title={`${lat} ms`}
                          style={{
                            width: 6,
                            height: barH,
                            backgroundColor: col,
                            borderRadius: 1,
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
