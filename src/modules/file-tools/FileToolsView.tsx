import React, { useState, useEffect, useRef } from 'react';
import {
  Hash,
  Copy,
  Check,
  ShieldCheck,
  FileCode,
  FileCheck,
  AlertCircle,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';
import { runComputeFileHash } from '../../services/platformService';

export const FileToolsView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'text' | 'file'>('file');
  const [inputText, setInputText] = useState('NOVA Windows Desktop Companion');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Text hashes
  const [textSha256, setTextSha256] = useState<string>('');
  const [textSha1, setTextSha1] = useState<string>('');
  const [textSha512, setTextSha512] = useState<string>('');
  const [textBase64, setTextBase64] = useState<string>('');

  // File hashes
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number } | null>(null);
  const [fileSha256, setFileSha256] = useState<string>('');
  const [fileSha1, setFileSha1] = useState<string>('');
  const [isHashingFile, setIsHashingFile] = useState<boolean>(false);
  const [verifyChecksum, setVerifyChecksum] = useState<string>('');

  // Compute text hashes with Web Crypto API
  useEffect(() => {
    let isMounted = true;
    async function computeTextHashes() {
      if (!inputText) {
        setTextSha256('');
        setTextSha1('');
        setTextSha512('');
        setTextBase64('');
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);

      try {
        const hash256Buffer = await crypto.subtle.digest('SHA-256', data);
        const hash256Hex = Array.from(new Uint8Array(hash256Buffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        const hash1Buffer = await crypto.subtle.digest('SHA-1', data);
        const hash1Hex = Array.from(new Uint8Array(hash1Buffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        const hash512Buffer = await crypto.subtle.digest('SHA-512', data);
        const hash512Hex = Array.from(new Uint8Array(hash512Buffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        let b64 = '';
        try {
          b64 = btoa(unescape(encodeURIComponent(inputText)));
        } catch {
          b64 = 'Unable to encode to Base64';
        }

        if (isMounted) {
          setTextSha256(hash256Hex);
          setTextSha1(hash1Hex);
          setTextSha512(hash512Hex);
          setTextBase64(b64);
        }
      } catch (e) {
        console.error('Hashing error:', e);
      }
    }

    computeTextHashes();
    return () => {
      isMounted = false;
    };
  }, [inputText]);

  // Handle file hashing
  const processFile = async (file: File) => {
    setSelectedFile({ name: file.name, size: file.size });
    setIsHashingFile(true);
    setFileSha256('');
    setFileSha1('');

    try {
      // If native path is available, compute via main process for instant large file hashing
      const filePath = (file as any).path;
      if (filePath) {
        const res256 = await runComputeFileHash(filePath, 'sha256');
        const res1 = await runComputeFileHash(filePath, 'sha1');
        if (res256?.success) setFileSha256(res256.hash);
        if (res1?.success) setFileSha1(res1.hash);
        if (res256?.success || res1?.success) {
          setIsHashingFile(false);
          return;
        }
      }

      // Browser Web Crypto fallback
      const arrayBuffer = await file.arrayBuffer();
      const hash256Buffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hash256Hex = Array.from(new Uint8Array(hash256Buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const hash1Buffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
      const hash1Hex = Array.from(new Uint8Array(hash1Buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      setFileSha256(hash256Hex);
      setFileSha1(hash1Hex);
    } catch (err) {
      console.error('File hash error:', err);
    } finally {
      setIsHashingFile(false);
    }
  };

  const copyHash = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const isVerified =
    verifyChecksum.trim().length > 0 &&
    (verifyChecksum.trim().toLowerCase() === fileSha256.toLowerCase() ||
      verifyChecksum.trim().toLowerCase() === fileSha1.toLowerCase());

  const isMismatch =
    verifyChecksum.trim().length > 0 &&
    fileSha256.length > 0 &&
    verifyChecksum.trim().toLowerCase() !== fileSha256.toLowerCase() &&
    verifyChecksum.trim().toLowerCase() !== fileSha1.toLowerCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 320 }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
          }
        }}
      />

      {/* Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setActiveTab('file')}
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: 'var(--nova-radius-pill)',
              backgroundColor: activeTab === 'file' ? 'var(--nova-blue)' : 'var(--nova-surface)',
              color: activeTab === 'file' ? '#fff' : 'var(--nova-text-secondary)',
              border: '1px solid var(--nova-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              fontWeight: activeTab === 'file' ? 600 : 400,
            }}
          >
            <FileCheck size={12} />
            <span>File Checksum</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: 'var(--nova-radius-pill)',
              backgroundColor: activeTab === 'text' ? 'var(--nova-blue)' : 'var(--nova-surface)',
              color: activeTab === 'text' ? '#fff' : 'var(--nova-text-secondary)',
              border: '1px solid var(--nova-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              fontWeight: activeTab === 'text' ? 600 : 400,
            }}
          >
            <Hash size={12} />
            <span>Text Hasher</span>
          </button>
        </div>

        <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>
          Real Cryptographic Engine
        </span>
      </div>

      {activeTab === 'file' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
          {/* File Picker / Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processFile(e.dataTransfer.files[0]);
              }
            }}
            style={{
              border: '1.5px dashed var(--nova-border)',
              borderRadius: 'var(--nova-radius-widget)',
              padding: '12px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Upload size={18} style={{ color: 'var(--nova-cyan)' }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
                  {selectedFile ? selectedFile.name : 'Select or drop any file to compute checksum'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB • Click to choose different file`
                    : 'Computes authentic SHA-256 and SHA-1 checksums'}
                </div>
              </div>
            </div>
            {isHashingFile && <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--nova-blue)' }} />}
          </div>

          {/* Computed File SHA-256 */}
          {fileSha256 && (
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--nova-surface)',
                border: '1px solid var(--nova-border)',
                borderRadius: 'var(--nova-radius-widget)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={12} /> SHA-256 Checksum
                </span>
                <button
                  onClick={() => copyHash('file256', fileSha256)}
                  style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  {copiedKey === 'file256' ? <Check size={11} style={{ color: 'var(--nova-success)' }} /> : <Copy size={11} />}
                  <span>{copiedKey === 'file256' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--nova-text-primary)', wordBreak: 'break-all' }}>
                {fileSha256}
              </div>
            </div>
          )}

          {/* Computed File SHA-1 */}
          {fileSha1 && (
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--nova-surface)',
                border: '1px solid var(--nova-border)',
                borderRadius: 'var(--nova-radius-widget)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-cyan)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={12} /> SHA-1 Checksum
                </span>
                <button
                  onClick={() => copyHash('file1', fileSha1)}
                  style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  {copiedKey === 'file1' ? <Check size={11} style={{ color: 'var(--nova-success)' }} /> : <Copy size={11} />}
                  <span>{copiedKey === 'file1' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--nova-text-primary)', wordBreak: 'break-all' }}>
                {fileSha1}
              </div>
            </div>
          )}

          {/* Checksum Verifier Input */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: isVerified
                ? 'rgba(74, 222, 128, 0.08)'
                : isMismatch
                ? 'rgba(239, 68, 68, 0.08)'
                : 'var(--nova-surface)',
              border: isVerified
                ? '1px solid var(--nova-success)'
                : isMismatch
                ? '1px solid var(--nova-danger)'
                : '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-widget)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-text-secondary)' }}>
                VERIFY AGAINST EXPECTED HASH
              </span>
              {isVerified && (
                <span style={{ fontSize: '10px', color: 'var(--nova-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={12} /> MATCH: Authentic File
                </span>
              )}
              {isMismatch && (
                <span style={{ fontSize: '10px', color: 'var(--nova-danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={12} /> MISMATCH: Checksum does not match
                </span>
              )}
            </div>

            <input
              type="text"
              placeholder="Paste official checksum from vendor to verify..."
              value={verifyChecksum}
              onChange={(e) => setVerifyChecksum(e.target.value)}
              onFocus={() => setInteracting(true)}
              onBlur={() => setInteracting(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--nova-border)',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--nova-text-primary)',
              }}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
          {/* Text Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-input)',
              padding: '6px 10px',
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => setInteracting(true)}
              onBlur={() => setInteracting(false)}
              placeholder="Type string to compute real hashes..."
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--nova-text-primary)',
                fontSize: '12px',
                width: '100%',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          {/* Text SHA-256 */}
          <div
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-widget)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-blue)' }}>SHA-256</span>
              <button
                onClick={() => copyHash('text256', textSha256)}
                style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', background: 'none', border: 'none' }}
              >
                {copiedKey === 'text256' ? <Check size={11} style={{ color: 'var(--nova-success)' }} /> : <Copy size={11} />}
                <span>{copiedKey === 'text256' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--nova-text-primary)', wordBreak: 'break-all' }}>
              {textSha256}
            </div>
          </div>

          {/* Text SHA-1 */}
          <div
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-widget)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-cyan)' }}>SHA-1</span>
              <button
                onClick={() => copyHash('text1', textSha1)}
                style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', background: 'none', border: 'none' }}
              >
                {copiedKey === 'text1' ? <Check size={11} style={{ color: 'var(--nova-success)' }} /> : <Copy size={11} />}
                <span>{copiedKey === 'text1' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--nova-text-primary)', wordBreak: 'break-all' }}>
              {textSha1}
            </div>
          </div>

          {/* Base64 */}
          <div
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-widget)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-warning)' }}>Base64 Encoded</span>
              <button
                onClick={() => copyHash('textb64', textBase64)}
                style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', background: 'none', border: 'none' }}
              >
                {copiedKey === 'textb64' ? <Check size={11} style={{ color: 'var(--nova-success)' }} /> : <Copy size={11} />}
                <span>{copiedKey === 'textb64' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--nova-text-primary)', wordBreak: 'break-all' }}>
              {textBase64}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
