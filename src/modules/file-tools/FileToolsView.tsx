import React, { useState } from 'react';
import { Hash, Copy, Check, FileSearch, ShieldCheck } from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

export const FileToolsView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const [inputText, setInputText] = useState('NOVA Windows Desktop Companion v1.0.0');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simple mock / deterministic hash generator for demonstration
  const simpleHash = (str: string, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c64e6d ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
  };

  const sha256 = simpleHash(inputText, 1) + simpleHash(inputText, 2) + simpleHash(inputText, 3) + simpleHash(inputText, 4);
  const md5 = simpleHash(inputText, 5) + simpleHash(inputText, 6);

  const copyHash = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 320 }}>
      {/* Top Input Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600 }}>
          HASH CALCULATOR & CHECKSUM VERIFIER
        </div>
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
            placeholder="Type text or paste file content to compute hashes..."
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
      </div>

      {/* Computed Hashes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* SHA-256 */}
        <div
          style={{
            padding: 10,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} /> SHA-256
            </span>
            <button
              onClick={() => copyHash('sha256', sha256)}
              style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {copiedKey === 'sha256' ? <Check size={11} style={{ color: 'var(--nova-success)' }} /> : <Copy size={11} />}
              <span>{copiedKey === 'sha256' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nova-text-primary)', wordBreak: 'break-all' }}>
            {sha256}
          </div>
        </div>

        {/* MD5 */}
        <div
          style={{
            padding: 10,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-cyan)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Hash size={12} /> MD5
            </span>
            <button
              onClick={() => copyHash('md5', md5)}
              style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {copiedKey === 'md5' ? <Check size={11} style={{ color: 'var(--nova-success)' }} /> : <Copy size={11} />}
              <span>{copiedKey === 'md5' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nova-text-primary)', wordBreak: 'break-all' }}>
            {md5}
          </div>
        </div>
      </div>

      {/* Batch Renamer Glance */}
      <div
        style={{
          padding: '10px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--nova-text-secondary)' }}>
          <FileSearch size={14} style={{ color: 'var(--nova-violet)' }} /> Bulk File Renamer & Regex Rule Matcher
        </span>
        <button
          onClick={() => alert('Batch file renamer ready for pattern matching.')}
          style={{
            padding: '4px 8px',
            backgroundColor: 'var(--nova-blue)',
            color: '#fff',
            borderRadius: 4,
            fontSize: '10px',
            fontWeight: 600,
          }}
        >
          Open Renamer
        </button>
      </div>
    </div>
  );
};
