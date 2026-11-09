import React, { useState } from 'react';
import { Volume2, VolumeX, Sun, Wifi, Bluetooth, Moon, Settings, Monitor, Shield } from 'lucide-react';

export const QuickSettingsView: React.FC = () => {
  const [volume, setVolume] = useState<number>(75);
  const [brightness, setBrightness] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [wifiEnabled, setWifiEnabled] = useState<boolean>(true);
  const [btEnabled, setBtEnabled] = useState<boolean>(true);
  const [nightLight, setNightLight] = useState<boolean>(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: 320 }}>
      {/* Quick Toggles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <button
          onClick={() => setWifiEnabled(!wifiEnabled)}
          style={{
            padding: '10px 12px',
            backgroundColor: wifiEnabled ? 'rgba(102, 136, 255, 0.2)' : 'var(--nova-surface)',
            border: wifiEnabled ? '1px solid var(--nova-blue)' : '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '11px',
            fontWeight: 600,
            color: wifiEnabled ? 'var(--nova-blue)' : 'var(--nova-text-secondary)',
          }}
        >
          <Wifi size={15} />
          <span>Wi-Fi {wifiEnabled ? 'On' : 'Off'}</span>
        </button>

        <button
          onClick={() => setBtEnabled(!btEnabled)}
          style={{
            padding: '10px 12px',
            backgroundColor: btEnabled ? 'rgba(84, 215, 232, 0.2)' : 'var(--nova-surface)',
            border: btEnabled ? '1px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '11px',
            fontWeight: 600,
            color: btEnabled ? 'var(--nova-cyan)' : 'var(--nova-text-secondary)',
          }}
        >
          <Bluetooth size={15} />
          <span>Bluetooth</span>
        </button>

        <button
          onClick={() => setNightLight(!nightLight)}
          style={{
            padding: '10px 12px',
            backgroundColor: nightLight ? 'rgba(243, 185, 91, 0.2)' : 'var(--nova-surface)',
            border: nightLight ? '1px solid var(--nova-warning)' : '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '11px',
            fontWeight: 600,
            color: nightLight ? 'var(--nova-warning)' : 'var(--nova-text-secondary)',
          }}
        >
          <Moon size={15} />
          <span>Night Light</span>
        </button>
      </div>

      {/* Sliders Box */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 14,
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
        }}
      >
        {/* Master Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{ color: isMuted ? 'var(--nova-danger)' : 'var(--nova-text-secondary)' }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setIsMuted(false);
              setVolume(Number(e.target.value));
            }}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', minWidth: 35 }}>
            {isMuted ? 0 : volume}%
          </span>
        </div>

        {/* Display Brightness */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sun size={16} style={{ color: 'var(--nova-warning)' }} />
          <input
            type="range"
            min={10}
            max={100}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', minWidth: 35 }}>
            {brightness}%
          </span>
        </div>
      </div>

      {/* Direct Windows Settings Navigators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 'auto' }}>
        <button
          onClick={() => alert('Opening Windows Display Settings...')}
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '11px',
            color: 'var(--nova-text-secondary)',
          }}
        >
          <Monitor size={13} style={{ color: 'var(--nova-blue)' }} />
          <span>Display Settings</span>
        </button>

        <button
          onClick={() => alert('Opening Windows Privacy & Security Settings...')}
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '11px',
            color: 'var(--nova-text-secondary)',
          }}
        >
          <Shield size={13} style={{ color: 'var(--nova-success)' }} />
          <span>Privacy Settings</span>
        </button>
      </div>
    </div>
  );
};
