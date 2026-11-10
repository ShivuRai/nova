import React, { useState, useEffect } from 'react';
import { Cpu, DollarSign, Activity, Plus, Trash2, CheckCircle2, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

interface AiSessionRecord {
  id: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  tool: string;
  timestamp: number;
}

export const AiCodingView: React.FC = () => {
  const [sessions, setSessions] = useState<AiSessionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('nova_ai_model_sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return []; // Start empty so we don't display fake data unless user feeds it!
  });

  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Form inputs
  const [modelName, setModelName] = useState<string>('Claude 3.7 Sonnet');
  const [promptTokens, setPromptTokens] = useState<number>(12500);
  const [completionTokens, setCompletionTokens] = useState<number>(3200);
  const [cost, setCost] = useState<string>('0.06');
  const [tool, setTool] = useState<string>('Claude Code');

  useEffect(() => {
    try {
      localStorage.setItem('nova_ai_model_sessions', JSON.stringify(sessions));
    } catch (e) {}
  }, [sessions]);

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: AiSessionRecord = {
      id: `ai-${Date.now()}`,
      modelName,
      promptTokens: Number(promptTokens) || 0,
      completionTokens: Number(completionTokens) || 0,
      cost: parseFloat(cost) || 0,
      tool,
      timestamp: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setIsAdding(false);
  };

  const handleLoadSample = () => {
    const sample: AiSessionRecord[] = [
      {
        id: 'sample-1',
        modelName: 'Claude 3.7 Sonnet',
        promptTokens: 48500,
        completionTokens: 8200,
        cost: 0.22,
        tool: 'Claude Code',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 'sample-2',
        modelName: 'Gemini 2.0 Flash',
        promptTokens: 120000,
        completionTokens: 18000,
        cost: 0.05,
        tool: 'Antigravity IDE',
        timestamp: Date.now() - 7200000,
      },
    ];
    setSessions(sample);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const totalTokens = sessions.reduce((acc, s) => acc + s.promptTokens + s.completionTokens, 0);
  const totalCost = sessions.reduce((acc, s) => acc + s.cost, 0);

  // Group by model
  const modelBreakdown = sessions.reduce((acc, s) => {
    const key = s.modelName;
    if (!acc[key]) acc[key] = { tokens: 0, cost: 0 };
    acc[key].tokens += s.promptTokens + s.completionTokens;
    acc[key].cost += s.cost;
    return acc;
  }, {} as Record<string, { tokens: number; cost: number }>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 330, overflowY: 'auto', paddingRight: 4 }}>
      {/* Header & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cpu size={13} style={{ color: 'var(--nova-blue)' }} />
          <span>AI MODEL USAGE & SESSIONS</span>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{
            fontSize: '10px',
            padding: '4px 10px',
            borderRadius: 'var(--nova-radius-pill)',
            backgroundColor: isAdding ? 'rgba(239, 68, 68, 0.2)' : 'var(--nova-surface)',
            border: isAdding ? '1px solid var(--nova-danger)' : '1px solid var(--nova-border)',
            color: isAdding ? 'var(--nova-danger)' : 'var(--nova-blue)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {isAdding ? 'Cancel' : <><Plus size={11} /> <span>Feed Session Data</span></>}
        </button>
      </div>

      {/* Manual Input Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSession}
          style={{
            padding: 12,
            backgroundColor: 'var(--nova-surface-elevated)',
            border: '1px solid var(--nova-blue)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-blue)' }}>
            FEED REAL MODEL SESSION DATA:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>Model Name:</span>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. Claude 3.7 Sonnet, GPT-4o, Gemini"
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  color: '#fff',
                  fontSize: '11px',
                  borderRadius: 4,
                }}
                required
              />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>CLI / Tool:</span>
              <input
                type="text"
                value={tool}
                onChange={(e) => setTool(e.target.value)}
                placeholder="e.g. Claude Code, Terminal, Cursor"
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  color: '#fff',
                  fontSize: '11px',
                  borderRadius: 4,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>Prompt Tokens:</span>
              <input
                type="number"
                value={promptTokens}
                onChange={(e) => setPromptTokens(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  color: '#fff',
                  fontSize: '11px',
                  borderRadius: 4,
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>Completion Tokens:</span>
              <input
                type="number"
                value={completionTokens}
                onChange={(e) => setCompletionTokens(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  color: '#fff',
                  fontSize: '11px',
                  borderRadius: 4,
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)' }}>Session Cost ($):</span>
              <input
                type="text"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.05"
                style={{
                  width: '100%',
                  padding: '4px 6px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  color: '#fff',
                  fontSize: '11px',
                  borderRadius: 4,
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '6px',
              backgroundColor: 'var(--nova-blue)',
              color: '#fff',
              borderRadius: 4,
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              marginTop: 4,
            }}
          >
            <CheckCircle2 size={12} />
            <span>Save & Track Session Record</span>
          </button>
        </form>
      )}

      {/* Top Banner: Real Tokens & Cost */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={13} style={{ color: 'var(--nova-blue)' }} /> TOTAL LOGGED TOKENS
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4, color: 'var(--nova-text-primary)' }}>
            {totalTokens.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', marginTop: 2 }}>
            From {sessions.length} recorded session{sessions.length === 1 ? '' : 's'}
          </div>
        </div>

        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <DollarSign size={13} style={{ color: 'var(--nova-success)' }} /> RECORDED COST
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 4, color: 'var(--nova-success)' }}>
            ${totalCost.toFixed(3)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', marginTop: 2 }}>
            Real calculated expenditure
          </div>
        </div>
      </div>

      {/* If No Sessions Exist: Honest Empty State */}
      {sessions.length === 0 ? (
        <div
          style={{
            padding: '24px 16px',
            backgroundColor: 'var(--nova-surface)',
            border: '1px dashed var(--nova-border)',
            borderRadius: 'var(--nova-radius-widget)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            textAlign: 'center',
          }}
        >
          <ShieldAlert size={28} style={{ color: 'var(--nova-cyan)' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
              No Model Usage Fed Yet
            </div>
            <div style={{ fontSize: '11px', color: 'var(--nova-text-muted)', marginTop: 2, maxWidth: 360 }}>
              We do not track external APIs without your consent. Feed your CLI or IDE coding sessions above to track live tokens and expenditure.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              onClick={() => setIsAdding(true)}
              style={{
                padding: '6px 14px',
                backgroundColor: 'var(--nova-blue)',
                color: '#fff',
                borderRadius: 'var(--nova-radius-button)',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              + Feed Session Data
            </button>
            <button
              onClick={handleLoadSample}
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--nova-surface-elevated)',
                border: '1px solid var(--nova-border)',
                color: 'var(--nova-text-secondary)',
                borderRadius: 'var(--nova-radius-button)',
                fontSize: '11px',
              }}
            >
              Load Sample Data
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Real Model Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', fontWeight: 600 }}>
              MODEL SHARE BREAKDOWN (BASED ON YOUR FED SESSIONS)
            </div>
            {Object.entries(modelBreakdown).map(([name, data]) => {
              const share = totalTokens > 0 ? Math.round((data.tokens / totalTokens) * 100) : 0;
              return (
                <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ fontWeight: 600 }}>{name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--nova-text-secondary)' }}>
                      {data.tokens.toLocaleString()} tokens (${data.cost.toFixed(3)}) • {share}%
                    </span>
                  </div>
                  <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${share}%`, height: '100%', backgroundColor: 'var(--nova-blue)', borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Session Log History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)', fontWeight: 600 }}>
                RECORDED SESSIONS LOG
              </span>
              <button
                onClick={() => setSessions([])}
                style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}
              >
                Clear All
              </button>
            </div>

            {sessions.map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  borderRadius: 'var(--nova-radius-input)',
                  fontSize: '11px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Terminal size={11} style={{ color: 'var(--nova-cyan)' }} />
                    <span>{s.modelName}</span>
                    <span style={{ color: 'var(--nova-text-muted)', fontWeight: 400, fontSize: '10px' }}>via {s.tool}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', marginTop: 2 }}>
                    Prompt: {s.promptTokens.toLocaleString()} • Completion: {s.completionTokens.toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--nova-success)' }}>
                    ${s.cost.toFixed(3)}
                  </span>
                  <button
                    onClick={() => handleDeleteSession(s.id)}
                    style={{ color: 'var(--nova-danger)', padding: 2 }}
                    title="Delete record"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
