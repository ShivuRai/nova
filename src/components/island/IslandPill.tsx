import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIslandStore } from '../../stores/useIslandStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { Music, Activity, Battery, Timer, Cpu, QrCode, Sparkles, ChevronDown } from 'lucide-react';

interface IslandPillProps {
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}

export const IslandPill: React.FC<IslandPillProps> = ({
  onHoverStart,
  onHoverEnd,
  onClick,
}) => {
  const { liveActivity } = useIslandStore();
  const { media, metrics } = useSystemStore();
  const { settings } = useThemeStore();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isRgb = settings.enableRgbBorder || settings.themeMode === 'rgb';

  return (
    <motion.div
      layoutId="nova-island-body"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
      whileHover={{ scale: 1.025, y: -1 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: liveActivity || media.isPlaying ? 260 : settings.pillWidth,
        height: settings.pillHeight,
        borderRadius: 9999, // Guarantee true continuous pill capsule
        backgroundColor: 'var(--nova-pill-bg)',
        boxShadow: isRgb ? 'var(--nova-shadow-card)' : 'var(--nova-shadow-pill)',
        border: isRgb
          ? '1px solid rgba(96, 165, 250, 0.6)'
          : '1px solid var(--nova-border)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      className={isRgb ? 'rgb-border' : ''}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 32,
        mass: 0.8,
      }}
    >
      {/* Specular top light streak for ultra-realistic glass look */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '12%',
          right: '12%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Live Activity or Media or Default Status */}
      {liveActivity ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
          <div style={{ color: 'var(--nova-blue)' }}>
            {liveActivity.type === 'music' && <Music size={14} />}
            {liveActivity.type === 'timer' && <Timer size={14} />}
            {liveActivity.type === 'transfer' && <QrCode size={14} />}
            {liveActivity.type === 'critical' && <Battery size={14} style={{ color: 'var(--nova-danger)' }} />}
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--nova-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 180,
            }}
          >
            {liveActivity.title}
          </span>
        </div>
      ) : media.isPlaying ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
          <div style={{ color: 'var(--nova-cyan)', display: 'flex', alignItems: 'center' }}>
            <Music size={13} style={{ marginRight: 4 }} />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 10 }}>
              <motion.span
                animate={{ height: ['4px', '11px', '4px'] }}
                transition={{ duration: 0.7, repeat: Infinity }}
                style={{ width: 2, backgroundColor: 'var(--nova-cyan)', borderRadius: 1 }}
              />
              <motion.span
                animate={{ height: ['9px', '3px', '9px'] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ width: 2, backgroundColor: 'var(--nova-blue)', borderRadius: 1 }}
              />
              <motion.span
                animate={{ height: ['3px', '10px', '3px'] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                style={{ width: 2, backgroundColor: 'var(--nova-violet)', borderRadius: 1 }}
              />
            </div>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--nova-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 160,
            }}
          >
            {media.title}
          </span>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Left Brand Badge with Breathing Light Dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: 'var(--nova-blue)',
                boxShadow: '0 0 8px var(--nova-blue)',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'var(--nova-text-primary)',
              }}
            >
              NOVA
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--nova-text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {time}
            </span>
          </div>

          {/* Right Live Hardware Telemetry */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '10px',
              color: 'var(--nova-text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Cpu size={10} style={{ color: 'var(--nova-blue)' }} />
              {metrics.cpuUsagePercent}%
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Activity size={10} style={{ color: 'var(--nova-cyan)' }} />
              {metrics.ramUsagePercent}%
            </span>
            <ChevronDown size={11} style={{ color: 'var(--nova-text-muted)', opacity: 0.7 }} />
          </div>
        </div>
      )}
    </motion.div>
  );
};
