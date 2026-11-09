import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target } from 'lucide-react';
import { useIslandStore } from '../../stores/useIslandStore';

export const TimersView: React.FC = () => {
  const { setLiveActivity, dismissLiveActivity } = useIslandStore();
  const [mode, setMode] = useState<'pomodoro' | 'break' | 'stopwatch'>('pomodoro');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: number | null = null;
    if (isRunning) {
      interval = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setLiveActivity({
              id: 'timer-done',
              type: 'timer',
              title: 'Timer Completed!',
              icon: 'Timer',
              createdAt: Date.now(),
            });
            return 0;
          }
          const next = prev - 1;
          const mins = Math.floor(next / 60);
          const secs = next % 60;
          setLiveActivity({
            id: 'timer-active',
            type: 'timer',
            title: `Focus: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
            icon: 'Timer',
            createdAt: Date.now(),
          });
          return next;
        });
      }, 1000);
    } else {
      if (interval) window.clearInterval(interval);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isRunning, setLiveActivity]);

  const selectMode = (m: 'pomodoro' | 'break' | 'stopwatch') => {
    setMode(m);
    setIsRunning(false);
    dismissLiveActivity();
    if (m === 'pomodoro') setSecondsRemaining(25 * 60);
    else if (m === 'break') setSecondsRemaining(5 * 60);
    else setSecondsRemaining(0);
  };

  const handleReset = () => {
    setIsRunning(false);
    dismissLiveActivity();
    if (mode === 'pomodoro') setSecondsRemaining(25 * 60);
    else if (mode === 'break') setSecondsRemaining(5 * 60);
    else setSecondsRemaining(0);
  };

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '10px 0' }}>
      {/* Mode Selectors */}
      <div style={{ display: 'flex', gap: 6, backgroundColor: 'var(--nova-surface)', padding: 4, borderRadius: 'var(--nova-radius-pill)' }}>
        <button
          onClick={() => selectMode('pomodoro')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 'var(--nova-radius-pill)',
            backgroundColor: mode === 'pomodoro' ? 'var(--nova-blue)' : 'transparent',
            color: mode === 'pomodoro' ? '#fff' : 'var(--nova-text-secondary)',
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          <Target size={12} />
          <span>25m Focus</span>
        </button>

        <button
          onClick={() => selectMode('break')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 'var(--nova-radius-pill)',
            backgroundColor: mode === 'break' ? 'var(--nova-blue)' : 'transparent',
            color: mode === 'break' ? '#fff' : 'var(--nova-text-secondary)',
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          <Coffee size={12} />
          <span>5m Break</span>
        </button>
      </div>

      {/* Clock Face */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '44px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--nova-text-primary)',
          margin: '10px 0',
        }}
      >
        {timeFormatted}
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={handleReset}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            color: 'var(--nova-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Reset"
        >
          <RotateCcw size={15} />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'var(--nova-blue)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(102, 136, 255, 0.4)',
          }}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 3 }} />}
        </button>
      </div>
    </div>
  );
};
