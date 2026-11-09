import React from 'react';
import { DollarSign, ShieldCheck, CreditCard, ArrowUpRight } from 'lucide-react';

export const RevenueView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 320 }}>
      {/* Gross Revenue Card */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600 }}>
            THIS MONTH NET REVENUE
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--nova-success)', marginTop: 4 }}>
            $4,820.00
          </div>
          <div style={{ fontSize: '11px', color: 'var(--nova-text-muted)', marginTop: 2 }}>
            Gross: $5,120.00 • Stripe Fees: -$300.00
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>128 Sales</div>
          <div style={{ fontSize: '11px', color: 'var(--nova-success)', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end', marginTop: 4 }}>
            <ArrowUpRight size={12} /> +24.8% vs last mo
          </div>
        </div>
      </div>

      {/* Account Sources */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <div style={{ padding: 12, backgroundColor: 'var(--nova-surface)', border: '1px solid var(--nova-border)', borderRadius: 'var(--nova-radius-widget)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--nova-text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={13} style={{ color: 'var(--nova-blue)' }} /> Stripe Primary
            </span>
            <span style={{ color: 'var(--nova-success)' }}>Connected</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 6 }}>
            $3,450.00
          </div>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>84 Transactions</div>
        </div>

        <div style={{ padding: 12, backgroundColor: 'var(--nova-surface)', border: '1px solid var(--nova-border)', borderRadius: 'var(--nova-radius-widget)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--nova-text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={13} style={{ color: 'var(--nova-cyan)' }} /> Gumroad Digital
            </span>
            <span style={{ color: 'var(--nova-success)' }}>Connected</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 6 }}>
            $1,370.00
          </div>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>44 Transactions</div>
        </div>
      </div>

      {/* Security Guarantee */}
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
        <span>Read-only API access • Zero payment or refund capabilities exposed for maximum security</span>
      </div>
    </div>
  );
};
