import React, { useState, useEffect } from 'react';
import { Globe, Sun, Moon, Clock } from 'lucide-react';

interface CityClock {
  name: string;
  tz: string;
  utcOffset: number;
}

export const ClockView: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cities: CityClock[] = [
    { name: 'Local Time (Bengaluru)', tz: 'Asia/Kolkata', utcOffset: 5.5 },
    { name: 'London (GMT)', tz: 'Europe/London', utcOffset: 0 },
    { name: 'San Francisco (PST)', tz: 'America/Los_Angeles', utcOffset: -8 },
    { name: 'Tokyo (JST)', tz: 'Asia/Tokyo', utcOffset: 9 },
  ];

  const getTimeForTz = (tz: string) => {
    return now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const getIsDay = (tz: string) => {
    const hr = parseInt(now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', hour12: false }), 10);
    return hr >= 6 && hr < 18;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: 320 }}>
      <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Globe size={13} style={{ color: 'var(--nova-blue)' }} />
        <span>WORLD CLOCKS & RELATIVE TIMEZONES</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {cities.map((city) => {
          const isDay = getIsDay(city.tz);
          const time = getTimeForTz(city.tz);
          return (
            <div
              key={city.name}
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--nova-surface)',
                border: '1px solid var(--nova-border)',
                borderRadius: 'var(--nova-radius-widget)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
                  {city.name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--nova-text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {isDay ? (
                    <Sun size={11} style={{ color: 'var(--nova-warning)' }} />
                  ) : (
                    <Moon size={11} style={{ color: 'var(--nova-blue)' }} />
                  )}
                  <span>{isDay ? 'Daytime' : 'Nighttime'}</span>
                </div>
              </div>

              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--nova-cyan)',
                }}
              >
                {time}
              </div>
            </div>
          );
        })}
      </div>

      {/* Meeting Planner Comparison Strip */}
      <div
        style={{
          marginTop: 'auto',
          padding: '10px 14px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--nova-border)',
          borderRadius: 'var(--nova-radius-widget)',
          fontSize: '11px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={13} style={{ color: 'var(--nova-cyan)' }} /> UTC Reference: {now.toISOString().slice(11, 19)}
        </span>
        <span style={{ color: 'var(--nova-success)', fontWeight: 600 }}>Optimal overlap window: 1:30 PM - 5:30 PM</span>
      </div>
    </div>
  );
};
