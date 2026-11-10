import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIslandStore } from '../../stores/useIslandStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { Music, Activity, Battery, Timer, Cpu, QrCode, ChevronDown } from 'lucide-react';

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
  const isBottom = settings.screenPosition?.startsWith('bottom');
  const isNotch = settings.notchStyle === 'notch-attached' && !isBottom;
  const isSquircle = settings.notchStyle === 'squircle-bar';
  const isCompact = settings.notchStyle === 'compact-badge';

  let borderRadius: string | number = 9999;
  if (isNotch) {
    borderRadius = '0 0 22px 22px';
  } else if (isSquircle) {
    borderRadius = '14px';
  }

  const effectiveWidth = isCompact
    ? 170
    : liveActivity || media.isPlaying
    ? 260
    : settings.pillWidth;

  const effectiveHeight = isCompact ? 32 : settings.pillHeight;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Natural Ambient Glow Aura (Soft, organic, zero boxiness) */}
      {settings.enableGlow && (
        <div
          style={{
            position: 'absolute',
            inset: isNotch ? '0px -24px -22px -24px' : '-8px -22px',
            borderRadius: isNotch ? '0 0 32px 32px' : isSquircle ? '20px' : 9999,
            background: isRgb
              ? 'radial-gradient(ellipse at center, rgba(96, 165, 250, 0.45) 0%, rgba(167, 139, 250, 0.28) 40%, rgba(244, 63, 94, 0.10) 65%, transparent 80%)'
              : isNotch
              ? 'radial-gradient(ellipse at 50% 0%, var(--nova-glow-color) 0%, rgba(var(--nova-glow-rgb), 0.22) 40%, rgba(var(--nova-glow-rgb), 0.05) 65%, transparent 80%)'
              : 'radial-gradient(ellipse at center, var(--nova-glow-color) 0%, rgba(var(--nova-glow-rgb), 0.22) 40%, rgba(var(--nova-glow-rgb), 0.05) 65%, transparent 80%)',
            filter: 'blur(16px)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: isRgb ? 'rgb-flow 8s linear infinite' : undefined,
          }}
        />
      )}

      {/* Left Notch Bezel Ear (Seamlessly blends into top screen bezel) */}
      {isNotch && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          style={{
            position: 'absolute',
            top: 0,
            left: -16,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <path d="M 0,0 Q 16,0 16,16 L 16,0 Z" fill="var(--nova-pill-bg)" />
        </svg>
      )}

      {/* Right Notch Bezel Ear */}
      {isNotch && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          style={{
            position: 'absolute',
            top: 0,
            right: -16,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <path d="M 16,0 Q 0,0 0,16 L 0,0 Z" fill="var(--nova-pill-bg)" />
        </svg>
      )}

      <motion.div
        layoutId="nova-island-body"
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onClick={onClick}
        whileHover={{ scale: isNotch ? 1.01 : 1.025, y: isNotch ? 0 : -1 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          width: effectiveWidth,
          height: effectiveHeight,
          borderRadius,
          backgroundColor: 'var(--nova-pill-bg)',
          boxShadow: isRgb ? 'var(--nova-shadow-card)' : 'var(--nova-shadow-pill)',
          border: isRgb
            ? '1.5px solid rgba(96, 165, 250, 0.6)'
            : '1px solid var(--nova-border)',
          borderTop: isNotch ? 'none' : undefined,
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isCompact ? '0 10px' : '0 14px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 2,
        }}
        className={isRgb ? 'rgb-border' : ''}
        transition={{
          type: 'spring',
          stiffness: 360,
          damping: 30,
          mass: 0.75,
        }}
      >
        {/* Specular top light streak for ultra-realistic glass look */}
        {!isNotch && (
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
        )}

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                  fontSize: isCompact ? '10px' : '11px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--nova-text-primary)',
                }}
              >
                NOVA
              </span>
              <span
                style={{
                  fontSize: isCompact ? '10px' : '11px',
                  fontWeight: 500,
                  color: 'var(--nova-text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {time}
              </span>
            </div>

            {/* Right Live Hardware Telemetry */}
            {!isCompact && (
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
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
