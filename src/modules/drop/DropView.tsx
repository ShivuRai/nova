import React, { useState } from 'react';
import { QrCode, Smartphone, UploadCloud, ShieldCheck, Check } from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

export const DropView: React.FC = () => {
  const { setLiveActivity } = useIslandStore();
  const [pin] = useState('7842');
  const [isSimulatingTransfer, setIsSimulatingTransfer] = useState(false);

  const startTestTransfer = () => {
    setIsSimulatingTransfer(true);
    setLiveActivity({
      id: 'drop-active',
      type: 'transfer',
      title: 'Receiving screenshot.png...',
      icon: 'QrCode',
      createdAt: Date.now(),
    });
    setTimeout(() => {
      setIsSimulatingTransfer(false);
      setLiveActivity({
        id: 'drop-done',
        type: 'transfer',
        title: 'Transfer Completed (2.4 MB)',
        icon: 'Check',
        createdAt: Date.now(),
      });
    }, 3000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: 14, height: 310 }}>
      {/* Left: QR Pairing Card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          padding: 16,
          textAlign: 'center',
          gap: 10,
        }}
      >
        {/* Synthetic QR Code Canvas */}
        <div
          style={{
            width: 120,
            height: 120,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 3,
            }}
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                style={{
                  backgroundColor:
                    (i % 2 === 0 || i % 7 === 0 || i < 5 || i > 20) ? '#0B0D12' : '#ffffff',
                  borderRadius: 1,
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
          Scan to Connect Phone
        </div>

        <div
          style={{
            fontSize: '10px',
            color: 'var(--nova-text-muted)',
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        >
          PIN: <span style={{ color: 'var(--nova-cyan)', fontWeight: 600 }}>{pin}</span>
        </div>
      </div>

      {/* Right: Transfer Engine & Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Drop Target Zone */}
        <div
          style={{
            flex: 1,
            border: '2px dashed var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
          }}
        >
          <UploadCloud size={28} style={{ color: 'var(--nova-cyan)' }} />
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--nova-text-primary)' }}>
            Drag & Drop files to send to phone
          </div>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>
            Direct Wi-Fi stream • End-to-end local • No cloud
          </div>
        </div>

        {/* Security & Activity Glance */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--nova-success)' }}>
            <ShieldCheck size={14} />
            <span>Local LAN Server Active (Port 4820)</span>
          </div>

          <button
            onClick={startTestTransfer}
            disabled={isSimulatingTransfer}
            style={{
              padding: '4px 8px',
              backgroundColor: 'var(--nova-blue)',
              color: '#fff',
              borderRadius: 4,
              fontSize: '10px',
              fontWeight: 600,
            }}
          >
            {isSimulatingTransfer ? 'Transferring...' : 'Test Drop'}
          </button>
        </div>
      </div>
    </div>
  );
};
