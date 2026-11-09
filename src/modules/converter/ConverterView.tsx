import React, { useState } from 'react';
import { RefreshCw, Image, Check, FileCheck, Sliders } from 'lucide-react';

export const ConverterView: React.FC = () => {
  const [targetFormat, setTargetFormat] = useState<string>('WEBP');
  const [quality, setQuality] = useState<number>(85);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{ name: string; from: string; to: string; sizeSaved: string }>>([
    { name: 'hero_wallpaper.png', from: 'PNG (2.4 MB)', to: 'WebP (380 KB)', sizeSaved: '-84%' },
    { name: 'app_icon.png', from: 'PNG (512 KB)', to: 'ICO (64 KB)', sizeSaved: '-87%' },
  ]);

  const formats = ['WEBP', 'PNG', 'JPG', 'BMP', 'ICO', 'PDF'];

  const handleStartConversion = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newEntry = {
        name: `screenshot_${Date.now().toString().slice(-4)}.png`,
        from: 'PNG (1.8 MB)',
        to: `${targetFormat} (${targetFormat === 'WEBP' ? '280 KB' : '410 KB'})`,
        sizeSaved: '-82%',
      };
      setHistory([newEntry, ...history]);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 320 }}>
      {/* Target Format Strip */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600 }}>
          SELECT TARGET FORMAT
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {formats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setTargetFormat(fmt)}
              style={{
                padding: '6px 8px',
                borderRadius: 'var(--nova-radius-input)',
                backgroundColor: targetFormat === fmt ? 'var(--nova-blue)' : 'var(--nova-surface)',
                color: targetFormat === fmt ? '#fff' : 'var(--nova-text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid var(--nova-border)',
              }}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Settings */}
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
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--nova-text-secondary)' }}>
          <Sliders size={13} style={{ color: 'var(--nova-cyan)' }} /> Quality / Compression:
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 180 }}>
          <input
            type="range"
            min={40}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', minWidth: 35 }}>{quality}%</span>
        </div>
      </div>

      {/* Action Trigger Box */}
      <div
        style={{
          border: '2px dashed var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image size={22} style={{ color: 'var(--nova-violet)' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>Convert & Compress Images</div>
            <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>Auto-optimized native encoding</div>
          </div>
        </div>

        <button
          onClick={handleStartConversion}
          disabled={isProcessing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            backgroundColor: 'var(--nova-blue)',
            color: '#fff',
            borderRadius: 'var(--nova-radius-button)',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <RefreshCw size={13} className={isProcessing ? 'animate-spin' : ''} />
          <span>{isProcessing ? 'Converting...' : `Convert to ${targetFormat}`}</span>
        </button>
      </div>

      {/* Recent Conversions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', fontWeight: 600 }}>
          CONVERSION HISTORY
        </div>
        {history.map((h, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-input)',
              fontSize: '11px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileCheck size={14} style={{ color: 'var(--nova-success)' }} />
              <div>
                <span style={{ fontWeight: 600 }}>{h.name}</span>
                <span style={{ color: 'var(--nova-text-muted)', marginLeft: 6 }}>({h.from} → {h.to})</span>
              </div>
            </div>
            <span style={{ color: 'var(--nova-success)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {h.sizeSaved}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
