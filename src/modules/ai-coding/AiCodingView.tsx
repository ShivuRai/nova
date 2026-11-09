import React from 'react';
import { Cpu, DollarSign, Activity, Terminal, ShieldCheck } from 'lucide-react';

export const AiCodingView: React.FC = () => {
  const models = [
    { name: 'Claude 3.7 Sonnet', tokens: '142,500', cost: '$0.43', share: 62, color: 'var(--nova-blue)' },
    { name: 'Claude 3.5 Sonnet', tokens: '64,200', cost: '$0.19', share: 28, color: 'var(--nova-violet)' },
    { name: 'Codex / Local LLM', tokens: '23,100', cost: '$0.00', share: 10, color: 'var(--nova-cyan)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 320 }}>
      {/* Top Banner: Tokens & Cost */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={13} style={{ color: 'var(--nova-blue)' }} /> TODAY'S AI TOKENS
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4, color: 'var(--nova-text-primary)' }}>
            229,800
          </div>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', marginTop: 2 }}>
            Across 14 coding CLI sessions
          </div>
        </div>

        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <DollarSign size={13} style={{ color: 'var(--nova-success)' }} /> ESTIMATED COST
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4, color: 'var(--nova-success)' }}>
            $0.62
          </div>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', marginTop: 2 }}>
            Weekly budget remaining: $18.40
          </div>
        </div>
      </div>

      {/* Model Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600 }}>
          MODEL USAGE BREAKDOWN
        </div>
        {models.map((m) => (
          <div key={m.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ fontWeight: 600 }}>{m.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nova-text-secondary)' }}>
                {m.tokens} tokens ({m.cost})
              </span>
            </div>
            <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${m.share}%`, height: '100%', backgroundColor: m.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Privacy & Log Notice */}
      <div
        style={{
          marginTop: 'auto',
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-input)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '10px',
          color: 'var(--nova-text-muted)',
        }}
      >
        <ShieldCheck size={12} style={{ color: 'var(--nova-success)' }} />
        <span>Parsed strictly from local Claude Code and CLI logs • No external API credentials required</span>
      </div>
    </div>
  );
};
