import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sliders, Download, Check, FileText, Trash2, RefreshCw, AlertCircle } from 'lucide-react';

interface ConversionRecord {
  id: string;
  originalName: string;
  convertedName: string;
  originalSize: string;
  convertedSize: string;
  savedPercent: string;
  downloadUrl?: string;
  timestamp: number;
}

export const ConverterView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('WEBP');
  const [quality, setQuality] = useState<number>(85);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [convertedResult, setConvertedResult] = useState<{ url: string; name: string; size: string; saved: string } | null>(null);
  const [history, setHistory] = useState<ConversionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nova_conversion_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('nova_conversion_history', JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setConvertedResult(null);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      if (selectedFile.type.startsWith('image/')) {
        // Real HTML5 Canvas Image Conversion
        const img = new Image();
        const objectUrl = URL.createObjectURL(selectedFile);
        img.src = objectUrl;

        await new Promise((resolve, reject) => {
          img.onload = () => resolve(true);
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context unavailable');

        ctx.drawImage(img, 0, 0);

        let mime = 'image/webp';
        let ext = 'webp';
        if (targetFormat === 'JPG' || targetFormat === 'JPEG') {
          mime = 'image/jpeg';
          ext = 'jpg';
          // Paint white background for transparent PNG to JPG conversion
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (targetFormat === 'PNG') {
          mime = 'image/png';
          ext = 'png';
        }

        const blob: Blob | null = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b), mime, quality / 100)
        );

        if (!blob) throw new Error('Conversion failed');

        const downloadUrl = URL.createObjectURL(blob);
        const originalBase = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
        const outName = `${originalBase}_converted.${ext}`;
        const diff = ((1 - blob.size / selectedFile.size) * 100).toFixed(0);
        const savedText = blob.size < selectedFile.size ? `-${diff}%` : `+${Math.abs(Number(diff))}%`;

        const resultObj = {
          url: downloadUrl,
          name: outName,
          size: formatFileSize(blob.size),
          saved: savedText,
        };
        setConvertedResult(resultObj);

        const record: ConversionRecord = {
          id: `conv-${Date.now()}`,
          originalName: selectedFile.name,
          convertedName: outName,
          originalSize: formatFileSize(selectedFile.size),
          convertedSize: formatFileSize(blob.size),
          savedPercent: savedText,
          downloadUrl: downloadUrl,
          timestamp: Date.now(),
        };
        setHistory([record, ...history.slice(0, 8)]);
      } else {
        // Text / Document Conversion
        const text = await selectedFile.text();
        const originalBase = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
        let blob: Blob;
        let outName: string;

        if (targetFormat === 'JSON') {
          const lines = text.split('\n').filter(Boolean);
          const jsonStr = JSON.stringify({ lines, count: lines.length }, null, 2);
          blob = new Blob([jsonStr], { type: 'application/json' });
          outName = `${originalBase}.json`;
        } else {
          blob = new Blob([text], { type: 'text/plain' });
          outName = `${originalBase}.txt`;
        }

        const downloadUrl = URL.createObjectURL(blob);
        const resultObj = {
          url: downloadUrl,
          name: outName,
          size: formatFileSize(blob.size),
          saved: '0%',
        };
        setConvertedResult(resultObj);

        const record: ConversionRecord = {
          id: `conv-${Date.now()}`,
          originalName: selectedFile.name,
          convertedName: outName,
          originalSize: formatFileSize(selectedFile.size),
          convertedSize: formatFileSize(blob.size),
          savedPercent: 'Converted',
          downloadUrl: downloadUrl,
          timestamp: Date.now(),
        };
        setHistory([record, ...history.slice(0, 8)]);
      }
    } catch (err: any) {
      alert(`Conversion error: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setConvertedResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 330, overflowY: 'auto', paddingRight: 4 }}>
      {/* Target Format Strip */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600 }}>
          TARGET FORMAT
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {['WEBP', 'JPG', 'PNG', 'JSON', 'TXT'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => {
                setTargetFormat(fmt);
                setConvertedResult(null);
              }}
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

      {/* Quality Settings (only for lossy images) */}
      {(targetFormat === 'WEBP' || targetFormat === 'JPG') && (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 170 }}>
            <input
              type="range"
              min={20}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--nova-cyan)' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', minWidth: 35 }}>{quality}%</span>
          </div>
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.txt,.json,.md,.csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Real Drop & File Selection Box */}
      {!selectedFile ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: 'var(--nova-surface)',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <UploadCloud size={28} style={{ color: 'var(--nova-blue)' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
              Click or Drag & Drop a File to Convert
            </div>
            <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', marginTop: 2 }}>
              Supports Images (PNG, JPG, WebP, GIF) & Text Documents (TXT, JSON, MD)
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--nova-surface-elevated)',
            border: '1px solid var(--nova-blue)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--nova-border)' }}
                />
              ) : (
                <FileText size={28} style={{ color: 'var(--nova-blue)' }} />
              )}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>
                  Size: {formatFileSize(selectedFile.size)} • Type: {selectedFile.type || 'document'}
                </div>
              </div>
            </div>

            <button
              onClick={clearSelectedFile}
              style={{ color: 'var(--nova-danger)', padding: 4 }}
              title="Remove file"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Convert Action Button */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 14px',
                backgroundColor: 'var(--nova-blue)',
                color: '#fff',
                borderRadius: 'var(--nova-radius-button)',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <RefreshCw size={13} className={isProcessing ? 'animate-spin' : ''} />
              <span>{isProcessing ? 'Converting Real File...' : `Convert to ${targetFormat}`}</span>
            </button>

            {convertedResult && (
              <a
                href={convertedResult.url}
                download={convertedResult.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  backgroundColor: 'var(--nova-success)',
                  color: '#fff',
                  borderRadius: 'var(--nova-radius-button)',
                  fontSize: '11px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <Download size={13} />
                <span>Save {convertedResult.name} ({convertedResult.size})</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Real Conversion History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)', fontWeight: 600 }}>
            RECENT REAL CONVERSIONS
          </span>
          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}
            >
              Clear
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'var(--nova-text-muted)', textAlign: 'center', padding: '10px 0' }}>
            No files converted yet. Pick a file above to convert.
          </div>
        ) : (
          history.map((h) => (
            <div
              key={h.id}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <Check size={13} style={{ color: 'var(--nova-success)' }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                    {h.originalName} → {h.convertedName}
                  </div>
                  <div style={{ color: 'var(--nova-text-muted)', fontSize: '10px' }}>
                    {h.originalSize} → {h.convertedSize} ({h.savedPercent})
                  </div>
                </div>
              </div>

              {h.downloadUrl && (
                <a
                  href={h.downloadUrl}
                  download={h.convertedName}
                  style={{ color: 'var(--nova-blue)', padding: 4 }}
                  title="Download again"
                >
                  <Download size={13} />
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
