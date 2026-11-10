import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  UploadCloud,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  FolderOpen,
  FileCheck,
  Radio,
} from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

interface DroppedFile {
  name: string;
  size: string;
  timestamp: number;
}

export const DropView: React.FC = () => {
  const { setLiveActivity } = useIslandStore();
  const [serverInfo, setServerInfo] = useState<{ url: string; ip: string; port: number; active: boolean }>({
    url: 'http://127.0.0.1:5980',
    ip: '127.0.0.1',
    port: 5980,
    active: true,
  });
  const [recentFiles, setRecentFiles] = useState<DroppedFile[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.invoke('get-drop-info').then((info: any) => {
          if (info && info.url) {
            setServerInfo(info);
          }
        });

        ipcRenderer.invoke('get-dropped-files').then((files: any) => {
          if (Array.isArray(files)) {
            setRecentFiles(files);
          }
        });

        const handleFileReceived = (_event: any, data: any) => {
          if (data && data.fileName) {
            setRecentFiles((prev) => [
              { name: data.fileName, size: data.fileSize || '1 MB', timestamp: Date.now() },
              ...prev,
            ]);
            setLiveActivity({
              id: 'drop-' + Date.now(),
              type: 'transfer',
              title: `Received ${data.fileName} (${data.fileSize})`,
              icon: 'Check',
              createdAt: Date.now(),
            });
          }
        };

        ipcRenderer.on('drop-file-received', handleFileReceived);
        return () => {
          ipcRenderer.removeListener('drop-file-received', handleFileReceived);
        };
      } catch (e) {}
    }
  }, [setLiveActivity]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(serverInfo.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenFolder = () => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.invoke('open-drop-folder');
      } catch (e) {}
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&margin=6&data=${encodeURIComponent(
    serverInfo.url
  )}`;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: 14, height: 285 }}>
      {/* Left: Real Scannable QR Pairing Card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          padding: 12,
          textAlign: 'center',
          gap: 8,
        }}
      >
        {/* Real Dynamic QR Code Image */}
        <div
          style={{
            width: 110,
            height: 110,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
            overflow: 'hidden',
          }}
        >
          <img
            src={qrImageUrl}
            alt="Scan to Drop"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as any).style.display = 'none';
            }}
          />
        </div>

        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
          Scan to Send Files
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <button
            onClick={handleCopyUrl}
            style={{
              fontSize: '9px',
              color: copied ? 'var(--nova-success)' : 'var(--nova-cyan)',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              padding: '3px 8px',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            <span>{copied ? 'Copied!' : 'Copy Wi-Fi Link'}</span>
          </button>
        </div>
      </div>

      {/* Right: Transfer Engine & Live Files */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Wi-Fi LAN Connection Header */}
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-input)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px' }}>
            <Radio size={13} style={{ color: 'var(--nova-success)' }} />
            <span style={{ fontWeight: 600, color: 'var(--nova-text-primary)' }}>Wi-Fi LAN Drop Active</span>
            <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)', fontFamily: 'var(--font-mono)' }}>
              ({serverInfo.ip}:{serverInfo.port})
            </span>
          </div>

          <button
            onClick={handleOpenFolder}
            style={{
              padding: '3px 8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--nova-border)',
              borderRadius: 4,
              color: 'var(--nova-text-secondary)',
              fontSize: '10px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
            title="Open Downloads/NovaDrop on your PC"
          >
            <FolderOpen size={11} style={{ color: 'var(--nova-blue)' }} />
            <span>Open Folder</span>
          </button>
        </div>

        {/* Real Transferred Files Stream */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            padding: 10,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {recentFiles.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 6,
                color: 'var(--nova-text-muted)',
                textAlign: 'center',
              }}
            >
              <UploadCloud size={24} style={{ color: 'var(--nova-cyan)', opacity: 0.8 }} />
              <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--nova-text-secondary)' }}>
                Ready to receive files
              </div>
              <div style={{ fontSize: '9px' }}>
                Open <span style={{ color: 'var(--nova-cyan)', fontFamily: 'var(--font-mono)' }}>{serverInfo.url}</span> on your phone browser or scan QR
              </div>
            </div>
          ) : (
            recentFiles.map((file, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  borderRadius: 6,
                  fontSize: '11px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                  <FileCheck size={13} style={{ color: 'var(--nova-success)', flexShrink: 0 }} />
                  <span
                    style={{
                      fontWeight: 600,
                      color: 'var(--nova-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {file.name}
                  </span>
                </div>
                <span style={{ fontSize: '9px', color: 'var(--nova-text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                  {file.size}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
