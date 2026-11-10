import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Plus,
  Trash2,
  Calendar,
  Tag,
  Target,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

interface IncomeEntry {
  id: string;
  amount: number;
  source: string;
  note: string;
  date: string;
  createdAt: number;
}

const STORAGE_KEY = 'nova_revenue_data_v2';
const GOAL_STORAGE_KEY = 'nova_revenue_monthly_goal_v2';

export const RevenueView: React.FC = () => {
  const { setInteracting } = useIslandStore();

  const [monthlyGoal, setMonthlyGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(GOAL_STORAGE_KEY);
      return saved ? Number(saved) : 5000;
    } catch {
      return 5000;
    }
  });

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(monthlyGoal));

  const [entries, setEntries] = useState<IncomeEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [formAmount, setFormAmount] = useState('');
  const [formSource, setFormSource] = useState('Freelance');
  const [formNote, setFormNote] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error(e);
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem(GOAL_STORAGE_KEY, String(monthlyGoal));
    } catch (e) {
      console.error(e);
    }
  }, [monthlyGoal]);

  const totalRevenue = entries.reduce((acc, curr) => acc + curr.amount, 0);
  const progressPercent = monthlyGoal > 0 ? Math.min(100, Math.round((totalRevenue / monthlyGoal) * 100)) : 0;

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const newEntry: IncomeEntry = {
      id: 'rev-' + Date.now(),
      amount: amountNum,
      source: formSource,
      note: formNote.trim() || 'Payment received',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      createdAt: Date.now(),
    };

    setEntries([newEntry, ...entries]);
    setFormAmount('');
    setFormNote('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((item) => item.id !== id));
  };

  const handleSaveGoal = () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val > 0) {
      setMonthlyGoal(val);
    }
    setIsEditingGoal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 320 }}>
      {/* Top Header Card */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
        }}
      >
        <div>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <DollarSign size={11} style={{ color: 'var(--nova-success)' }} />
            <span>TOTAL RECORDED INCOME</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--nova-success)', marginTop: 2 }}>
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>Target:</span>
            {isEditingGoal ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  style={{ width: 60, fontSize: '11px', padding: '2px 4px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--nova-border)', borderRadius: 4 }}
                />
                <button onClick={handleSaveGoal} style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: 'var(--nova-blue)', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>OK</button>
              </div>
            ) : (
              <span
                onClick={() => { setIsEditingGoal(true); setGoalInput(String(monthlyGoal)); }}
                style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                title="Click to edit monthly revenue goal"
              >
                ${monthlyGoal.toLocaleString()} ✎
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--nova-cyan)', fontWeight: 600, marginTop: 4 }}>
            {progressPercent}% Achieved
          </div>
        </div>
      </div>

      {/* Goal Progress Bar */}
      <div style={{ height: 6, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: progressPercent >= 100 ? 'var(--nova-success)' : 'var(--nova-blue)',
            borderRadius: 3,
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)', fontWeight: 600 }}>
          TRANSACTIONS ({entries.length})
        </span>

        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{
            padding: '3px 8px',
            backgroundColor: isAdding ? 'rgba(239, 68, 68, 0.15)' : 'rgba(74, 222, 128, 0.15)',
            border: isAdding ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: 'var(--nova-radius-pill)',
            color: isAdding ? 'var(--nova-danger)' : 'var(--nova-success)',
            fontSize: '10px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {isAdding ? <X size={11} /> : <Plus size={11} />}
          <span>{isAdding ? 'Cancel' : '+ Add Income'}</span>
        </button>
      </div>

      {/* Add Income Drawer Form */}
      {isAdding && (
        <form
          onSubmit={handleAddEntry}
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-success)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input
              type="number"
              step="any"
              placeholder="Amount ($ e.g. 250.00)"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              onFocus={() => setInteracting(true)}
              onBlur={() => setInteracting(false)}
              required
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--nova-border)',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: '11px',
                color: 'var(--nova-text-primary)',
              }}
            />
            <select
              value={formSource}
              onChange={(e) => setFormSource(e.target.value)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--nova-border)',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: '11px',
                color: 'var(--nova-text-primary)',
              }}
            >
              <option value="Freelance">Freelance Client</option>
              <option value="Stripe">Stripe / Online</option>
              <option value="Consulting">Consulting / Hourly</option>
              <option value="Gumroad">Digital Product</option>
              <option value="Salary">Salary / Stipend</option>
              <option value="Other">Other Income</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Description / Client Name (e.g. Web design for Acme)"
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              onFocus={() => setInteracting(true)}
              onBlur={() => setInteracting(false)}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--nova-border)',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: '11px',
                color: 'var(--nova-text-primary)',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '6px 14px',
                backgroundColor: 'var(--nova-success)',
                border: 'none',
                borderRadius: 6,
                color: '#000',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Transaction List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflowY: 'auto' }}>
        {entries.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              color: 'var(--nova-text-muted)',
              fontSize: '11px',
              fontStyle: 'italic',
            }}
          >
            No income entries logged yet. Click "+ Add Income" above to track your real revenue!
          </div>
        ) : (
          entries.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                backgroundColor: 'var(--nova-surface)',
                border: '1px solid var(--nova-border)',
                borderRadius: 'var(--nova-radius-widget)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    backgroundColor: 'rgba(74, 222, 128, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--nova-success)',
                  }}
                >
                  <DollarSign size={13} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
                    {item.note}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>
                    {item.source} • {item.date}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--nova-success)' }}>
                  +${item.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    padding: 3,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--nova-text-muted)',
                    cursor: 'pointer',
                  }}
                  title="Delete entry"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
