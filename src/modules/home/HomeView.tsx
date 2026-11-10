import React from 'react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useIslandStore } from '../../stores/useIslandStore';
import {
  Cpu,
  Activity,
  HardDrive,
  Wifi,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ClipboardCopy,
  Timer,
  CloudSun,
  QrCode,
  FileText,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { metrics, media, updateMedia } = useSystemStore();
  const { setActiveModule } = useIslandStore();

  const handleMediaControl = (action: 'play-pause' | 'next' | 'prev') => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.send('control-media', action === 'play-pause' ? 'toggle' : action);
      } catch (e) {}
    }
    if (action === 'play-pause') {
      updateMedia({ isPlaying: !media.isPlaying });
    }
  };

  const hasMedia = Boolean(media.title);
  const isYouTube =
    media.title?.toLowerCase().includes('youtube') ||
    media.artist?.toLowerCase().includes('youtube') ||
    media.album?.toLowerCase().includes('chrome');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      {/* Sleek Micro Search / Launcher Trigger */}
      <div
        onClick={() => setActiveModule('launcher')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '5px 10px',
          height: 28,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-pill)',
          color: 'var(--nova-text-muted)',
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <Search size={13} style={{ color: 'var(--nova-blue)', flexShrink: 0 }} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Search apps, files, or run command...
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '9px',
            padding: '1px 5px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 3,
            fontFamily: 'var(--font-mono)',
            flexShrink: 0,
          }}
        >
          Alt+Space
        </span>
      </div>

      {/* Grid of Key Widgets - Compact & Proportionate */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
        }}
      >
        {/* Media / Now Playing Card */}
        <div
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: media.isPlaying
              ? '1px solid var(--nova-blue)'
              : hasMedia
              ? '1px solid rgba(56, 189, 248, 0.3)'
              : '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 6,
            minHeight: 74,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                backgroundColor: media.isPlaying
                  ? 'rgba(56, 189, 248, 0.18)'
                  : hasMedia
                  ? 'rgba(102, 136, 255, 0.12)'
                  : 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: media.isPlaying ? 'var(--nova-cyan)' : 'var(--nova-text-muted)',
                fontSize: '12px',
                flexShrink: 0,
              }}
            >
              {isYouTube ? '▶️' : '🎵'}
            </div>
            <div style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: hasMedia ? 'var(--nova-text-primary)' : 'var(--nova-text-secondary)',
                  lineHeight: 1.2,
                }}
              >
                {media.title || 'No Media Playing'}
              </div>
              <div
                style={{
                  fontSize: '9px',
                  color: 'var(--nova-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: 1,
                  lineHeight: 1.2,
                }}
              >
                {hasMedia
                  ? media.isPlaying
                    ? media.artist || 'Web Playback'
                    : `${media.artist || 'Web Media'} • Paused`
                  : 'YouTube & Spotify auto-detect'}
              </div>
            </div>
          </div>

          {/* Micro Media Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <button
              onClick={() => handleMediaControl('prev')}
              style={{ color: 'var(--nova-text-secondary)', padding: 2, cursor: 'pointer', background: 'none', border: 'none' }}
              title="Previous Track"
            >
              <SkipBack size={13} />
            </button>
            <button
              onClick={() => handleMediaControl('play-pause')}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                backgroundColor: 'var(--nova-blue)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: 'none',
              }}
              title={media.isPlaying ? 'Pause' : 'Play'}
            >
              {media.isPlaying ? <Pause size={11} /> : <Play size={11} style={{ marginLeft: 1 }} />}
            </button>
            <button
              onClick={() => handleMediaControl('next')}
              style={{ color: 'var(--nova-text-secondary)', padding: 2, cursor: 'pointer', background: 'none', border: 'none' }}
              title="Next Track"
            >
              <SkipForward size={13} />
            </button>
          </div>
        </div>

        {/* System Vitals Card */}
        <div
          onClick={() => setActiveModule('system')}
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 4,
            cursor: 'pointer',
            minHeight: 74,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10.5px',
              fontWeight: 600,
              color: 'var(--nova-text-secondary)',
            }}
          >
            <span>System Vitals</span>
            <span style={{ color: 'var(--nova-success)', fontSize: '9.5px', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--nova-success)', display: 'inline-block' }} />
              Optimal
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 5,
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Cpu size={11} style={{ color: 'var(--nova-blue)' }} />
              <div style={{ display: 'flex', gap: 3, alignItems: 'baseline' }}>
                <span style={{ color: 'var(--nova-text-muted)', fontSize: '8.5px' }}>CPU</span>
                <span style={{ fontWeight: 600 }}>{metrics.cpuUsagePercent}%</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Activity size={11} style={{ color: 'var(--nova-cyan)' }} />
              <div style={{ display: 'flex', gap: 3, alignItems: 'baseline' }}>
                <span style={{ color: 'var(--nova-text-muted)', fontSize: '8.5px' }}>RAM</span>
                <span style={{ fontWeight: 600 }}>{metrics.ramUsagePercent}%</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <HardDrive size={11} style={{ color: 'var(--nova-violet)' }} />
              <div style={{ display: 'flex', gap: 3, alignItems: 'baseline' }}>
                <span style={{ color: 'var(--nova-text-muted)', fontSize: '8.5px' }}>DISK</span>
                <span>{metrics.diskFreeGb}G</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Wifi size={11} style={{ color: 'var(--nova-warning)' }} />
              <div style={{ display: 'flex', gap: 3, alignItems: 'baseline' }}>
                <span style={{ color: 'var(--nova-text-muted)', fontSize: '8.5px' }}>NET</span>
                <span>{metrics.networkDownloadKbps > 1024 ? `${(metrics.networkDownloadKbps / 1024).toFixed(1)}M` : `${metrics.networkDownloadKbps}K`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px', marginTop: 2 }}>
        <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--nova-text-muted)', letterSpacing: '0.04em' }}>
          WORKFLOW ESSENTIALS
        </span>
        <span style={{ fontSize: '9px', color: 'var(--nova-cyan)', cursor: 'pointer' }} onClick={() => setActiveModule('links')}>
          Shortcuts
        </span>
      </div>

      {/* Quick Action Micro-Pills */}
      <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveModule('clipboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-pill)',
            fontSize: '10px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          <ClipboardCopy size={11} style={{ color: 'var(--nova-blue)' }} />
          <span>Clipboard</span>
        </button>

        <button
          onClick={() => setActiveModule('notes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-pill)',
            fontSize: '10px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          <FileText size={11} style={{ color: 'var(--nova-violet)' }} />
          <span>Notes</span>
        </button>

        <button
          onClick={() => setActiveModule('drop')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-pill)',
            fontSize: '10px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          <QrCode size={11} style={{ color: 'var(--nova-cyan)' }} />
          <span>NOVA Drop</span>
        </button>

        <button
          onClick={() => setActiveModule('timers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-pill)',
            fontSize: '10px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          <Timer size={11} style={{ color: 'var(--nova-warning)' }} />
          <span>Timer</span>
        </button>

        <button
          onClick={() => setActiveModule('weather')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-pill)',
            fontSize: '10px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          <CloudSun size={11} style={{ color: 'var(--nova-blue)' }} />
          <span>Weather</span>
        </button>
      </div>

      {/* Mini System Glance Status Strip */}
      <div
        style={{
          marginTop: 'auto',
          padding: '6px 10px',
          borderRadius: 'var(--nova-radius-widget)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '9.5px',
          color: 'var(--nova-text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Sparkles size={11} style={{ color: 'var(--nova-cyan)' }} />
          <span>Dynamic Island active • All modules synchronized</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)' }}>
          <span>CPU {metrics.cpuTempCelsius}°C</span>
          <span>•</span>
          <span style={{ color: 'var(--nova-cyan)', cursor: 'pointer' }} onClick={() => setActiveModule('rgb')}>
            Studio
          </span>
        </div>
      </div>
    </div>
  );
};
