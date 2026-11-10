import React from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, Timer as TimerIcon, Plus } from 'lucide-react';
import { useTimerStore, TimerMode } from '../../stores/useTimerStore';

export const TimersView: React.FC = () => {
  const { mode, secondsRemaining, stopwatchSeconds, isRunning, setMode, start, pause, reset } = useTimerStore();

  const selectMode = (m: TimerMode) => {
    setMode(m);
  };

  const currentSeconds = mode === 'stopwatch' ? stopwatchSeconds : secondsRemaining;
  const mins = Math.floor(currentSeconds / 60);
  const secs = currentSeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const totalModeSeconds = mode === 'pomodoro' ? 25 * 60 : mode === 'break' ? 5 * 60 : Math.max(stopwatchSeconds, 60);
  const progressPercent = mode === 'stopwatch'
    ? Math.min(100, (stopwatchSeconds % 60) / 60 * 100)
    : Math.max(0, Math.min(100, ((totalModeSeconds - secondsRemaining) / totalModeSeconds) * 100));

  const addExtraTime = (extraMinutes: number) => {
    if (mode === 'stopwatch') return;
    useTimerStore.setState((state) => ({
      secondsRemaining: state.secondsRemaining + extraMinutes * 60,
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '6px 0', height: '100%' }}>
      {/* Mode Selectors */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          backgroundColor: 'var(--nova-surface)',
          padding: '4px',
          borderRadius: 'var(--nova-radius-pill)',
          border: '1px solid var(--nova-border)',
        }}
      >
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
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Target size={13} />
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
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Coffee size={13} />
          <span>5m Break</span>
        </button>

        <button
          onClick={() => selectMode('stopwatch')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 'var(--nova-radius-pill)',
            backgroundColor: mode === 'stopwatch' ? 'var(--nova-blue)' : 'transparent',
            color: mode === 'stopwatch' ? '#fff' : 'var(--nova-text-secondary)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <TimerIcon size={13} />
          <span>Stopwatch</span>
        </button>
      </div>

      {/* Main Digital Clock & Progress Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%', maxWidth: 280 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '46px',
            fontWeight: 700,
            letterSpacing: '1px',
            color: isRunning ? 'var(--nova-cyan)' : 'var(--nova-text-primary)',
            textShadow: isRunning ? '0 0 24px rgba(56, 189, 248, 0.4)' : 'none',
            transition: 'color 0.2s, text-shadow 0.2s',
          }}
        >
          {timeFormatted}
        </div>

        {/* Progress Tracker */}
        <div
          style={{
            width: '100%',
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: isRunning ? 'var(--nova-cyan)' : 'var(--nova-blue)',
              borderRadius: 2,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={reset}
          title="Reset Timer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 38,
            height: 38,
            borderRadius: '50%',
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            color: 'var(--nova-text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={() => (isRunning ? pause() : start())}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 28px',
            borderRadius: 'var(--nova-radius-pill)',
            backgroundColor: isRunning ? 'rgba(244, 63, 94, 0.9)' : 'var(--nova-blue)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: isRunning
              ? '0 0 20px rgba(244, 63, 94, 0.4)'
              : '0 0 20px rgba(56, 189, 248, 0.35)',
            transition: 'all 0.15s ease',
          }}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>

        {mode !== 'stopwatch' && (
          <button
            onClick={() => addExtraTime(5)}
            title="Add +5 minutes"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '8px 12px',
              borderRadius: 'var(--nova-radius-pill)',
              backgroundColor: 'var(--nova-surface)',
              border: '1px solid var(--nova-border)',
              color: 'var(--nova-text-secondary)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={13} />
            <span>5m</span>
          </button>
        )}
      </div>

      <div style={{ fontSize: '11px', color: 'var(--nova-text-muted)' }}>
        {isRunning ? 'Focus session active in background' : 'Ready when you are'}
      </div>
    </div>
  );
};
export default TimersView;
