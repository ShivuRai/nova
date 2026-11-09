import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

export const MessageView: React.FC = () => {
  const { setLiveActivity, dismissLiveActivity, setInteracting } = useIslandStore();
  const [message, setMessage] = useState('Build the future. Ship NOVA.');
  const [selectedColor, setSelectedColor] = useState('var(--nova-blue)');

  const templates = [
    'Deep Work in Progress ⚡',
    'Stay Focused & Keep Shipping 🚀',
    'Hydrate and Stretch Break 💧',
    'Windows Desktop. Reimagined.',
  ];

  const handlePostMessage = () => {
    if (!message.trim()) return;
    setLiveActivity({
      id: `msg-${Date.now()}`,
      type: 'message',
      title: message.trim(),
      icon: 'MessageSquare',
      createdAt: Date.now(),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 320 }}>
      <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        <MessageSquare size={13} style={{ color: 'var(--nova-violet)' }} />
        <span>CUSTOM TICKER & MOTIVATIONAL NOTCH MESSAGES</span>
      </div>

      {/* Input Field */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          padding: 8,
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setInteracting(true)}
          onBlur={() => setInteracting(false)}
          placeholder="Type message to appear in top pill..."
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            fontSize: '13px',
            color: 'var(--nova-text-primary)',
            padding: '4px 8px',
          }}
        />
        <button
          onClick={handlePostMessage}
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
          <Send size={12} />
          <span>Show in Notch</span>
        </button>
      </div>

      {/* Preset Templates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', fontWeight: 600 }}>
          QUICK PRESETS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {templates.map((tpl) => (
            <button
              key={tpl}
              onClick={() => setMessage(tpl)}
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--nova-surface)',
                border: '1px solid var(--nova-border)',
                borderRadius: 'var(--nova-radius-input)',
                color: 'var(--nova-text-secondary)',
                fontSize: '11px',
                textAlign: 'left',
              }}
            >
              {tpl}
            </button>
          ))}
        </div>
      </div>

      {/* Dismiss Button */}
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={dismissLiveActivity}
          style={{
            padding: '6px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-button)',
            fontSize: '11px',
            color: 'var(--nova-text-muted)',
          }}
        >
          Clear Active Notch Message
        </button>
      </div>
    </div>
  );
};
