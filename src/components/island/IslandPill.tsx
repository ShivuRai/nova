import React from 'react';
import { motion } from 'framer-motion';
import { useIslandStore } from '../../stores/useIslandStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { Music, Activity, Battery, Timer, Cpu, QrCode } from 'lucide-react';

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

  const isRgb = settings.enableRgbBorder || settings.themeMode === 'rgb';

  return (
    <motion.div
      layoutId="nova-island-body"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
      style={{
        width: liveActivity || media.isPlaying ? 230 : settings.pillWidth,
        height: settings.pillHeight,
        borderRadius: 'var(--nova-radius-pill)',
        backgroundColor: 'var(--nova-pill-bg)',
        boxShadow: isRgb ? 'var(--nova-shadow-card)' : 'var(--nova-shadow-pill)',
        border: isRgb
          ? '1px solid rgba(102, 136, 255, 0.5)'
          : '1px solid var(--nova-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      className={isRgb ? 'rgb-border' : ''}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 32,
      }}
    >
      {/* Live Activity or Default Status */}
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
              maxWidth: 160,
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
                animate={{ height: ['4px', '10px', '4px'] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ width: 2, backgroundColor: 'var(--nova-cyan)', borderRadius: 1 }}
              />
              <motion.span
                animate={{ height: ['8px', '3px', '8px'] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                style={{ width: 2, backgroundColor: 'var(--nova-blue)', borderRadius: 1 }}
              />
              <motion.span
                animate={{ height: ['3px', '9px', '3px'] }}
                transition={{ duration: 0.7, repeat: Infinity }}
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
              maxWidth: 140,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--nova-blue)',
                boxShadow: '0 0 6px var(--nova-blue)',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: 'var(--nova-text-primary)',
              }}
            >
              NOVA
            </span>
          </div>

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
          </div>
        </div>
      )}
    </motion.div>
  );
};
