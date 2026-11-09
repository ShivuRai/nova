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
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { metrics, media, updateMedia } = useSystemStore();
  const { setActiveModule } = useIslandStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Search / Quick Launcher Trigger */}
      <div
        onClick={() => setActiveModule('launcher')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-button)',
          color: 'var(--nova-text-muted)',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        <Search size={15} style={{ color: 'var(--nova-blue)' }} />
        <span>Type to search apps, files, or run commands...</span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '10px',
            padding: '2px 6px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 4,
            fontFamily: 'var(--font-mono)',
          }}
        >
          Alt+Space
        </span>
      </div>

      {/* Grid of Key Widgets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        {/* Media / Now Playing Card */}
        <div
          style={{
            padding: 12,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'rgba(102, 136, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--nova-blue)',
              }}
            >
              🎵
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {media.title}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--nova-text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {media.artist}
              </div>
            </div>
          </div>

          {/* Media Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <button
              onClick={() => {}}
              style={{ color: 'var(--nova-text-secondary)', padding: 4 }}
            >
              <SkipBack size={15} />
            </button>
            <button
              onClick={() => updateMedia({ isPlaying: !media.isPlaying })}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'var(--nova-blue)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {media.isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
            </button>
            <button
              onClick={() => {}}
              style={{ color: 'var(--nova-text-secondary)', padding: 4 }}
            >
              <SkipForward size={15} />
            </button>
          </div>
        </div>

        {/* System Vitals Card */}
        <div
          onClick={() => setActiveModule('system')}
          style={{
            padding: 12,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--nova-text-secondary)',
            }}
          >
            <span>System Load</span>
            <span style={{ color: 'var(--nova-success)', fontSize: '11px' }}>● Normal</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              marginTop: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={13} style={{ color: 'var(--nova-blue)' }} />
              <div>
                <div style={{ color: 'var(--nova-text-muted)', fontSize: '9px' }}>CPU</div>
                <div>{metrics.cpuUsagePercent}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={13} style={{ color: 'var(--nova-cyan)' }} />
              <div>
                <div style={{ color: 'var(--nova-text-muted)', fontSize: '9px' }}>RAM</div>
                <div>{metrics.ramUsagePercent}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <HardDrive size={13} style={{ color: 'var(--nova-violet)' }} />
              <div>
                <div style={{ color: 'var(--nova-text-muted)', fontSize: '9px' }}>DISK</div>
                <div>{metrics.diskFreeGb}GB free</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wifi size={13} style={{ color: 'var(--nova-warning)' }} />
              <div>
                <div style={{ color: 'var(--nova-text-muted)', fontSize: '9px' }}>NET</div>
                <div>{metrics.networkDownloadKbps} KB/s</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        <button
          onClick={() => setActiveModule('clipboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-button)',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          <ClipboardCopy size={13} style={{ color: 'var(--nova-blue)' }} />
          <span>Clipboard</span>
        </button>

        <button
          onClick={() => setActiveModule('notes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-button)',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          <FileText size={13} style={{ color: 'var(--nova-violet)' }} />
          <span>Quick Notes</span>
        </button>

        <button
          onClick={() => setActiveModule('drop')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-button)',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          <QrCode size={13} style={{ color: 'var(--nova-cyan)' }} />
          <span>NOVA Drop</span>
        </button>

        <button
          onClick={() => setActiveModule('timers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-button)',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          <Timer size={13} style={{ color: 'var(--nova-warning)' }} />
          <span>Focus Timer</span>
        </button>

        <button
          onClick={() => setActiveModule('weather')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-button)',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          <CloudSun size={13} style={{ color: 'var(--nova-blue)' }} />
          <span>Weather</span>
        </button>
      </div>
    </div>
  );
};
