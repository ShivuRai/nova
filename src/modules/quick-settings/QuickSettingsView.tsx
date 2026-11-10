import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Volume1,
  Wifi,
  Bluetooth,
  Moon,
  Monitor,
  Scissors,
  Activity,
  Calculator,
  Lock,
  Settings,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { runQuickAction } from '../../services/platformService';

export const QuickSettingsView: React.FC = () => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const triggerAction = async (action: string, label: string) => {
    setFeedback(`Triggered: ${label}`);
    try {
      await runQuickAction(action);
    } catch (e) {
      console.warn('Quick action error:', e);
    }
    setTimeout(() => {
      setFeedback((current) => (current?.includes(label) ? null : current));
    }, 2400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 320, boxSizing: 'border-box' }}>
      {/* Header with real-time feedback toast */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sliders size={13} style={{ color: 'var(--nova-blue)' }} />
          <span>WINDOWS SYSTEM QUICK ACTIONS</span>
        </div>
        {feedback && (
          <div
            style={{
              fontSize: '10px',
              color: 'var(--nova-success)',
              backgroundColor: 'rgba(74, 222, 128, 0.12)',
              padding: '2px 8px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={11} />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Main Connectivity Toggles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <button
          onClick={() => triggerAction('open-wifi', 'Wi-Fi Networks')}
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(102, 136, 255, 0.12)',
            border: '1px solid rgba(102, 136, 255, 0.3)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 6,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--nova-blue)' }}>
            <Wifi size={15} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Wi-Fi</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>Manage Networks</span>
        </button>

        <button
          onClick={() => triggerAction('open-bluetooth', 'Bluetooth Devices')}
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(84, 215, 232, 0.12)',
            border: '1px solid rgba(84, 215, 232, 0.3)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 6,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--nova-cyan)' }}>
            <Bluetooth size={15} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Bluetooth</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>Pair Devices</span>
        </button>

        <button
          onClick={() => triggerAction('open-nightlight', 'Night Light')}
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(243, 185, 91, 0.12)',
            border: '1px solid rgba(243, 185, 91, 0.3)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 6,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--nova-warning)' }}>
            <Moon size={15} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Night Light</span>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>Warm Colors</span>
        </button>
      </div>

      {/* Master Volume Controller Box */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '10px 12px',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
            Master Windows Volume
          </span>
          <button
            onClick={() => triggerAction('open-sound-settings', 'Sound Settings')}
            style={{ fontSize: '10px', color: 'var(--nova-blue)', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            Sound Settings ↗
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => triggerAction('volume-mute', 'Toggle Mute')}
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--nova-border)',
              borderRadius: 6,
              color: 'var(--nova-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <VolumeX size={14} style={{ color: 'var(--nova-danger)' }} />
            <span>Mute</span>
          </button>

          <button
            onClick={() => triggerAction('volume-down', 'Volume Down')}
            style={{
              flex: 1,
              padding: '6px 10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--nova-border)',
              borderRadius: 6,
              color: 'var(--nova-text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <Volume1 size={14} />
            <span>Vol Down (-4%)</span>
          </button>

          <button
            onClick={() => triggerAction('volume-up', 'Volume Up')}
            style={{
              flex: 1,
              padding: '6px 10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--nova-border)',
              borderRadius: 6,
              color: 'var(--nova-text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <Volume2 size={14} style={{ color: 'var(--nova-success)' }} />
            <span>Vol Up (+4%)</span>
          </button>
        </div>
      </div>

      {/* Windows Utility Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <button
          onClick={() => triggerAction('open-snipping-tool', 'Snipping Tool')}
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '11px',
            color: 'var(--nova-text-primary)',
            cursor: 'pointer',
          }}
        >
          <Scissors size={14} style={{ color: 'var(--nova-violet)' }} />
          <span>Snipping Tool</span>
        </button>

        <button
          onClick={() => triggerAction('open-task-manager', 'Task Manager')}
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '11px',
            color: 'var(--nova-text-primary)',
            cursor: 'pointer',
          }}
        >
          <Activity size={14} style={{ color: 'var(--nova-cyan)' }} />
          <span>Task Manager</span>
        </button>

        <button
          onClick={() => triggerAction('open-calc', 'Calculator')}
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '11px',
            color: 'var(--nova-text-primary)',
            cursor: 'pointer',
          }}
        >
          <Calculator size={14} style={{ color: 'var(--nova-warning)' }} />
          <span>Calculator</span>
        </button>

        <button
          onClick={() => triggerAction('open-display-settings', 'Display Settings')}
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '11px',
            color: 'var(--nova-text-primary)',
            cursor: 'pointer',
          }}
        >
          <Monitor size={14} style={{ color: 'var(--nova-blue)' }} />
          <span>Display Setup</span>
        </button>

        <button
          onClick={() => triggerAction('lock-workstation', 'Lock Workstation')}
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '11px',
            color: 'var(--nova-text-primary)',
            cursor: 'pointer',
          }}
        >
          <Lock size={14} style={{ color: 'var(--nova-danger)' }} />
          <span>Lock Screen</span>
        </button>

        <button
          onClick={() => triggerAction('open-windows-settings', 'Windows Settings')}
          style={{
            padding: '8px 10px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '11px',
            color: 'var(--nova-text-primary)',
            cursor: 'pointer',
          }}
        >
          <Settings size={14} style={{ color: 'var(--nova-text-secondary)' }} />
          <span>All Settings</span>
        </button>
      </div>
    </div>
  );
};
