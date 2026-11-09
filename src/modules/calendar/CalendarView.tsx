import React, { useState } from 'react';
import { CalendarDays, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  time: string;
  color: string;
}

export const CalendarView: React.FC = () => {
  const [currentDate] = useState(new Date());
  const [events, setEvents] = useState<EventItem[]>([
    { id: '1', title: 'NOVA Desktop Companion Review', time: '08:00 PM', color: 'var(--nova-blue)' },
    { id: '2', title: 'Sprint Architecture Sync', time: 'Tomorrow, 10:30 AM', color: 'var(--nova-violet)' },
    { id: '3', title: 'Community Feedback Session', time: 'Wed, 02:00 PM', color: 'var(--nova-cyan)' },
  ]);

  const daysInMonth = 30;
  const currentDay = currentDate.getDate();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, height: 320 }}>
      {/* Left: Mini Monthly Grid */}
      <div
        style={{
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>
            {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={{ padding: 2, color: 'var(--nova-text-secondary)' }}><ChevronLeft size={14} /></button>
            <button style={{ padding: 2, color: 'var(--nova-text-secondary)' }}><ChevronRight size={14} /></button>
          </div>
        </div>

        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '10px', color: 'var(--nova-text-muted)', fontWeight: 600 }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, textAlign: 'center', fontSize: '11px' }}>
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const isToday = dayNum === currentDay;
            return (
              <div
                key={dayNum}
                style={{
                  padding: '4px 0',
                  borderRadius: 4,
                  backgroundColor: isToday ? 'var(--nova-blue)' : 'transparent',
                  color: isToday ? '#fff' : 'var(--nova-text-primary)',
                  fontWeight: isToday ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Upcoming Agenda */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600 }}>
            UPCOMING AGENDA
          </span>
          <button
            onClick={() => {
              const demo = { id: `ev-${Date.now()}`, title: 'New Focus Block', time: '09:00 PM', color: 'var(--nova-success)' };
              setEvents([...events, demo]);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 6px',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 4,
              fontSize: '10px',
              color: 'var(--nova-text-primary)',
            }}
          >
            <Plus size={11} /> Event
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1, paddingRight: 4 }}>
          {events.map((ev) => (
            <div
              key={ev.id}
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--nova-surface)',
                border: '1px solid var(--nova-border)',
                borderLeft: `3px solid ${ev.color}`,
                borderRadius: 'var(--nova-radius-input)',
                fontSize: '11px',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--nova-text-primary)' }}>{ev.title}</div>
              <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={10} /> {ev.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
