import React, { useState, useEffect } from 'react';
import {
  Settings,
  Power,
  Shield,
  Palette,
  RotateCcw,
  Sliders,
  HardDrive,
  Keyboard,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Info,
  Sparkles,
} from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useIslandStore } from '../../stores/useIslandStore';
import { getAutoStartStatus, setAutoStartStatus } from '../../services/platformService';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useThemeStore();
  const { setActiveModule } = useIslandStore();
  const [autoStart, setAutoStart] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    getAutoStartStatus().then((status) => {
      setAutoStart(status);
    });
  }, []);

  const handleToggleAutoStart = async (enabled: boolean) => {
    setAutoStart(enabled);
    await setAutoStartStatus(enabled);
    setStatusMsg(enabled ? 'Enabled: Starts with Windows on boot' : 'Disabled: Manual launch only');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleClearCache = (type: string) => {
    if (type === 'shelf') {
      localStorage.removeItem('nova_file_shelf_items_v2');
      setStatusMsg('File Shelf cleared.');
    } else if (type === 'clipboard') {
      localStorage.removeItem('nova_clipboard_history_v2');
      setStatusMsg('Clipboard history cleared.');
    } else if (type === 'all') {
      localStorage.clear();
      setStatusMsg('All local cache & settings reset.');
      setTimeout(() => window.location.reload(), 800);
    }
    setTimeout(() => setStatusMsg(''), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 320, boxSizing: 'border-box' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Settings size={14} style={{ color: 'var(--nova-blue)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nova-text-secondary)', letterSpacing: '0.04em' }}>
            SYSTEM & PREFERENCES
          </span>
        </div>

        {statusMsg && (
          <div style={{ fontSize: '10px', color: 'var(--nova-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={11} />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Prominent Quick-Link to the new Customization Studio */}
      <div
        onClick={() => setActiveModule('rgb')}
        style={{
          padding: '10px 14px',
          background: 'linear-gradient(90deg, rgba(96, 165, 250, 0.12), rgba(56, 189, 248, 0.12))',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: 'var(--nova-radius-widget)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: 'rgba(56, 189, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--nova-cyan)',
            }}
          >
            <Palette size={16} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nova-text-primary)' }}>
              Open Customization Studio
            </div>
            <div style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>
              Customize glass palettes, 12 notch shapes, edge lighting & mascot robots
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--nova-cyan)', fontSize: '11px', fontWeight: 600 }}>
          <span>Open Studio</span>
          <ExternalLink size={12} />
        </div>
      </div>

      {/* Settings Scrollable Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {/* Startup & Windows Integration */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Power size={13} style={{ color: 'var(--nova-blue)' }} />
              <span>Launch NOVA on Windows Startup</span>
            </div>
            <div style={{ fontSize: '9px', color: 'var(--nova-text-muted)', marginTop: 2 }}>
              Automatically runs NOVA minimized in the system tray when your PC boots up
            </div>
          </div>

          <button
            onClick={() => handleToggleAutoStart(!autoStart)}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--nova-radius-pill)',
              backgroundColor: autoStart ? 'var(--nova-blue)' : 'rgba(255,255,255,0.06)',
              color: autoStart ? '#fff' : 'var(--nova-text-muted)',
              fontSize: '10px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {autoStart ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Global Hotkeys & Controls */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Keyboard size={13} style={{ color: 'var(--nova-cyan)' }} />
            <span>Global Shortcuts & Hotkeys</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
            <span style={{ color: 'var(--nova-text-secondary)' }}>Toggle Dynamic Island Expand/Collapse</span>
            <kbd style={{ padding: '2px 6px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid var(--nova-border)', borderRadius: 4, fontFamily: 'var(--font-mono)', color: 'var(--nova-cyan)' }}>
              Alt + Space
            </kbd>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
            <span style={{ color: 'var(--nova-text-secondary)' }}>Windows System Tray Location</span>
            <span style={{ color: 'var(--nova-text-muted)' }}>Notification Area (Hidden Icons ^)</span>
          </div>
        </div>

        {/* Local Storage & Cache Management */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <HardDrive size={13} style={{ color: 'var(--nova-warning)' }} />
            <span>Local Cache & Privacy</span>
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            <button
              onClick={() => handleClearCache('shelf')}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--nova-border)',
                color: 'var(--nova-text-secondary)',
                cursor: 'pointer',
              }}
            >
              Clear File Shelf
            </button>

            <button
              onClick={() => handleClearCache('clipboard')}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--nova-border)',
                color: 'var(--nova-text-secondary)',
                cursor: 'pointer',
              }}
            >
              Clear Clipboard History
            </button>

            <button
              onClick={() => updateSettings({ themeMode: 'minimal', notchStyle: 'floating-pill', enableRgbBorder: false, topOffset: 0, pillBrandBadge: 'robot' })}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--nova-border)',
                color: 'var(--nova-cyan)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <RotateCcw size={10} />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* About App Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px', fontSize: '9px', color: 'var(--nova-text-muted)' }}>
          <span>NOVA Windows Desktop Companion • v1.0.0</span>
          <span>Zero telemetry • 100% offline & local</span>
        </div>
      </div>
    </div>
  );
};
