import React, { useState } from 'react';
import { CalendarDays, Clock, Plus, ChevronLeft, ChevronRight, Trash2, Calendar as CalIcon } from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "14:30" or "02:30 PM"
  color: string;
}

export const CalendarView: React.FC = () => {
  const { setInteracting } = useIslandStore();
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  // Real user events stored in localStorage (no hardcoded demo events)
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('nova_calendar_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newColor, setNewColor] = useState('var(--nova-blue)');

  const saveEvents = (updated: CalendarEvent[]) => {
    setEvents(updated);
    try {
      localStorage.setItem('nova_calendar_events', JSON.stringify(updated));
    } catch (e) {}
  };

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString([], { month: 'long', year: 'numeric' });

  // Format date string for matching: YYYY-MM-DD
  const formatEventDate = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const selectedDateStr = formatEventDate(currentYear, currentMonth, selectedDay);
  const eventsForSelectedDay = events.filter((ev) => ev.date === selectedDateStr);

  const handleAddEvent = () => {
    if (!newTitle.trim()) return;
    const newEntry: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: newTitle.trim(),
      date: selectedDateStr,
      time: newTime.trim() || 'All Day',
      color: newColor,
    };
    saveEvents([...events, newEntry]);
    setNewTitle('');
    setIsAdding(false);
  };

  const handleDeleteEvent = (id: string) => {
    saveEvents(events.filter((ev) => ev.id !== id));
  };

  const colorOptions = [
    { label: 'Blue', value: 'var(--nova-blue)' },
    { label: 'Cyan', value: 'var(--nova-cyan)' },
    { label: 'Emerald', value: '#10B981' },
    { label: 'Violet', value: 'var(--nova-violet)' },
    { label: 'Rose', value: '#F43F5E' },
    { label: 'Amber', value: '#F59E0B' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, height: '100%' }}>
      {/* Left: Interactive Monthly Grid */}
      <div
        style={{
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--nova-text-primary)' }}>
            {monthName}
          </span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              onClick={goToday}
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: 'var(--nova-text-secondary)',
                cursor: 'pointer',
              }}
            >
              Today
            </button>
            <button onClick={prevMonth} style={{ padding: 3, color: 'var(--nova-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={nextMonth} style={{ padding: 3, color: 'var(--nova-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronRight size={14} />
            </button>
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
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} style={{ padding: '4px 0' }} />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const isToday =
              dayNum === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();
            const isSelected = dayNum === selectedDay;
            const dateStr = formatEventDate(currentYear, currentMonth, dayNum);
            const hasEvents = events.some((ev) => ev.date === dateStr);

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                style={{
                  padding: '5px 0',
                  borderRadius: 6,
                  backgroundColor: isSelected
                    ? 'var(--nova-blue)'
                    : isToday
                    ? 'rgba(56, 189, 248, 0.15)'
                    : 'transparent',
                  color: isSelected ? '#fff' : isToday ? 'var(--nova-cyan)' : 'var(--nova-text-primary)',
                  fontWeight: isSelected || isToday ? 700 : 400,
                  cursor: 'pointer',
                  position: 'relative',
                  border: isToday && !isSelected ? '1px solid var(--nova-cyan)' : 'none',
                  transition: 'all 0.1s ease',
                }}
              >
                {dayNum}
                {hasEvents && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      backgroundColor: isSelected ? '#fff' : 'var(--nova-cyan)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Selected Day Events & Inline Add */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 700 }}>
              {new Date(currentYear, currentMonth, selectedDay).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              backgroundColor: isAdding ? 'rgba(255,255,255,0.1)' : 'var(--nova-blue)',
              border: 'none',
              borderRadius: 4,
              fontSize: '10px',
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <Plus size={11} /> {isAdding ? 'Cancel' : 'Add Event'}
          </button>
        </div>

        {/* Inline Add Event Form */}
        {isAdding && (
          <div
            style={{
              padding: 10,
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              borderRadius: 'var(--nova-radius-widget)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <input
              type="text"
              placeholder="Event title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onFocus={() => setInteracting(true)}
              onBlur={() => setInteracting(false)}
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--nova-border)',
                borderRadius: 4,
                padding: '6px 8px',
                color: 'var(--nova-text-primary)',
                fontSize: '11px',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Time (e.g. 02:00 PM)"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                onFocus={() => setInteracting(true)}
                onBlur={() => setInteracting(false)}
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--nova-border)',
                  borderRadius: 4,
                  padding: '4px 6px',
                  color: 'var(--nova-text-primary)',
                  fontSize: '10px',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {colorOptions.map((c) => (
                  <div
                    key={c.value}
                    onClick={() => setNewColor(c.value)}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: c.value,
                      cursor: 'pointer',
                      border: newColor === c.value ? '2px solid #fff' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleAddEvent}
              disabled={!newTitle.trim()}
              style={{
                padding: '5px',
                backgroundColor: newTitle.trim() ? 'var(--nova-blue)' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: '11px',
                fontWeight: 600,
                cursor: newTitle.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Save Event
            </button>
          </div>
        )}

        {/* Event List for selected day */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxHeight: 220,
            paddingRight: 2,
          }}
        >
          {eventsForSelectedDay.length === 0 ? (
            <div
              style={{
                padding: '24px 8px',
                textAlign: 'center',
                color: 'var(--nova-text-muted)',
                fontSize: '11px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CalIcon size={20} style={{ opacity: 0.5 }} />
              <div>No events for this date</div>
              <div style={{ fontSize: '10px' }}>Click "+ Add Event" above to schedule</div>
            </div>
          ) : (
            eventsForSelectedDay.map((ev) => (
              <div
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  backgroundColor: 'var(--nova-surface)',
                  border: '1px solid var(--nova-border)',
                  borderRadius: 6,
                  borderLeft: `3px solid ${ev.color}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
                    {ev.title}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Clock size={10} />
                    <span>{ev.time}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteEvent(ev.id)}
                  title="Delete event"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--nova-text-muted)',
                    cursor: 'pointer',
                    padding: 3,
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default CalendarView;
