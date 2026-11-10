import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useIslandStore } from '../../stores/useIslandStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useTimerStore } from '../../stores/useTimerStore';
import { Music, Activity, Battery, Timer, Cpu, QrCode, ChevronDown, Wifi } from 'lucide-react';

export const IslandBrandMascot: React.FC<{ isCompact?: boolean; type?: string }> = ({ isCompact, type = 'robot' }) => {
  const [expression, setExpression] = useState<'normal' | 'blink' | 'look-left' | 'look-right' | 'happy' | 'wink'>('normal');
  const [isInteracting, setIsInteracting] = useState(false);
  const [catTwitch, setCatTwitch] = useState(false);

  useEffect(() => {
    // Dynamic organic expression state machine
    const expressionSequence: Array<'normal' | 'blink' | 'normal' | 'look-left' | 'normal' | 'look-right' | 'happy' | 'blink' | 'wink' | 'normal'> = [
      'normal',
      'blink',
      'normal',
      'look-left',
      'normal',
      'look-right',
      'happy',
      'blink',
      'wink',
      'normal',
    ];
    let idx = 0;

    const interval = setInterval(() => {
      idx = (idx + 1) % expressionSequence.length;
      const nextExp = expressionSequence[idx];
      setExpression(nextExp);
      setCatTwitch(nextExp === 'happy' || nextExp === 'wink');

      // Return smoothly to normal after momentary micro-expressions
      if (nextExp === 'blink' || nextExp === 'wink') {
        setTimeout(() => setExpression('normal'), 240);
      } else if (nextExp === 'look-left' || nextExp === 'look-right') {
        setTimeout(() => setExpression('normal'), 900);
      } else if (nextExp === 'happy') {
        setTimeout(() => setExpression('normal'), 1200);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpression('happy');
    setIsInteracting(true);
    setTimeout(() => {
      setIsInteracting(false);
      setExpression('normal');
    }, 1400);
  };

  if (type === 'cat') {
    const isCatHappy = expression === 'happy' || isInteracting;
    return (
      <motion.div
        animate={{
          y: isInteracting ? [-2, 1, -2] : [0, -0.8, 0],
        }}
        transition={{ duration: isInteracting ? 0.35 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
        onClick={handleMascotClick}
        title="Pet Mochi!"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', lineHeight: 1, userSelect: 'none' }}
      >
        <svg width={isCompact ? 16 : 18} height={isCompact ? 14 : 16} viewBox="0 0 20 18" fill="none" style={{ display: 'block' }}>
          {/* Ears with interactive twitch */}
          <motion.polygon
            points="3,7 1,2 7,5"
            fill="#F472B6"
            animate={{ rotate: catTwitch ? [-8, 4, 0] : 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.polygon
            points="17,7 19,2 13,5"
            fill="#F472B6"
            animate={{ rotate: catTwitch ? [8, -4, 0] : 0 }}
            transition={{ duration: 0.3 }}
          />
          {/* Head */}
          <circle cx="10" cy="10" r="7" fill="#FDF2F8" stroke="#F472B6" strokeWidth="1.2" />
          {/* Blushing Cheeks with Soft Glow */}
          <motion.circle
            cx="6"
            cy="11.5"
            r="1.2"
            fill="#FDA4AF"
            animate={{ opacity: isCatHappy ? [0.7, 1, 0.7] : 0.8 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.circle
            cx="14"
            cy="11.5"
            r="1.2"
            fill="#FDA4AF"
            animate={{ opacity: isCatHappy ? [0.7, 1, 0.7] : 0.8 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Eyes with Blinking & Joy Expressions */}
          {expression === 'blink' ? (
            <>
              <line x1="6.5" y1="9.5" x2="8.5" y2="9.5" stroke="#831843" strokeWidth="1" strokeLinecap="round" />
              <line x1="11.5" y1="9.5" x2="13.5" y2="9.5" stroke="#831843" strokeWidth="1" strokeLinecap="round" />
            </>
          ) : isCatHappy ? (
            <>
              <path d="M 6.5,10.5 Q 7.5,8.5 8.5,10.5" stroke="#831843" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M 11.5,10.5 Q 12.5,8.5 13.5,10.5" stroke="#831843" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="7.5" cy="9.5" r="1.2" fill="#831843" />
              <circle cx="12.5" cy="9.5" r="1.2" fill="#831843" />
              <circle cx="7.8" cy="9.2" r="0.4" fill="#FFFFFF" />
              <circle cx="12.8" cy="9.2" r="0.4" fill="#FFFFFF" />
            </>
          )}
          {/* Nose */}
          <circle cx="10" cy="11" r="0.8" fill="#F43F5E" />
        </svg>
        <span style={{ fontSize: isCompact ? '10px' : '11px', fontWeight: 700, color: '#FDA4AF', lineHeight: 1, display: 'inline-block' }}>MOCHI</span>
      </motion.div>
    );
  }

  if (type === 'quantum') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, lineHeight: 1 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ width: 14, height: 14, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px dashed var(--nova-cyan)' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--nova-blue)', position: 'absolute' }} />
        </motion.div>
        <span style={{ fontSize: isCompact ? '10px' : '11px', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--nova-cyan)', lineHeight: 1, display: 'inline-block' }}>CORE</span>
      </div>
    );
  }

  if (type === 'pixel-alien') {
    return (
      <motion.div
        animate={{ y: [0, -1, 0] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, lineHeight: 1 }}
      >
        <svg width={isCompact ? 15 : 17} height={isCompact ? 13 : 15} viewBox="0 0 16 14" fill="none" style={{ display: 'block' }}>
          <rect x="2" y="2" width="2" height="2" fill="var(--nova-warning)" />
          <rect x="12" y="2" width="2" height="2" fill="var(--nova-warning)" />
          <rect x="4" y="4" width="8" height="6" fill="var(--nova-warning)" />
          <rect x="2" y="6" width="12" height="4" fill="var(--nova-warning)" />
          {expression === 'blink' ? null : (
            <>
              <rect x="5" y="6" width="2" height="2" fill="#000" />
              <rect x="9" y="6" width="2" height="2" fill="#000" />
            </>
          )}
        </svg>
        <span style={{ fontSize: isCompact ? '10px' : '11px', fontWeight: 700, color: 'var(--nova-warning)', lineHeight: 1, display: 'inline-block' }}>BYTE</span>
      </motion.div>
    );
  }

  if (type === 'text') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, lineHeight: 1 }}>
        <motion.span
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'var(--nova-blue)',
            boxShadow: '0 0 8px var(--nova-blue)',
            display: 'inline-block',
          }}
        />
        <span style={{ fontSize: isCompact ? '10px' : '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--nova-text-primary)', lineHeight: 1, display: 'inline-block' }}>
          NOVA
        </span>
      </div>
    );
  }

  // Default: Dynamic Expressive Astro Robot
  const isBlinking = expression === 'blink';
  const isLookingLeft = expression === 'look-left';
  const isLookingRight = expression === 'look-right';
  const isHappy = expression === 'happy' || isInteracting;
  const isWinking = expression === 'wink';

  // Eye tracking offsets
  const leftEyeX = isLookingLeft ? 7.2 : isLookingRight ? 9.8 : 8.5;
  const rightEyeX = isLookingLeft ? 12.2 : isLookingRight ? 14.8 : 13.5;
  const eyeY = 11.2;

  return (
    <motion.div
      animate={{
        y: isInteracting ? [-2, 1, -2] : [0, -1, 0],
      }}
      transition={{ duration: isInteracting ? 0.35 : 2.8, repeat: Infinity, ease: 'easeInOut' }}
      onClick={handleMascotClick}
      title="Click Astro!"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        cursor: 'pointer',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      <div style={{ position: 'relative', width: isCompact ? 16 : 19, height: isCompact ? 14 : 17, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg
          width={isCompact ? 16 : 19}
          height={isCompact ? 14 : 17}
          viewBox="0 0 22 20"
          fill="none"
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Signal Beacon Wave Pulse from Antenna */}
          <motion.circle
            cx="11"
            cy="1.5"
            r="1.8"
            animate={{ scale: [1, 2.2, 1], opacity: [0.85, 0, 0.85] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            stroke="var(--nova-cyan)"
            strokeWidth="0.8"
            fill="none"
          />

          {/* Antenna */}
          <line x1="11" y1="4.5" x2="11" y2="1.5" stroke="var(--nova-blue)" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="11" cy="1.5" r="1.3" fill="var(--nova-cyan)" />

          {/* Head Fuselage */}
          <rect x="3" y="4.5" width="16" height="13" rx="4" fill="#0B132B" stroke="var(--nova-blue)" strokeWidth="1.3" />

          {/* Visor Screen */}
          <rect x="5.5" y="7" width="11" height="8" rx="2" fill="#1C2541" />

          {/* Visor Cyber Scanline */}
          <line x1="6" y1="9" x2="16" y2="9" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.6" />

          {/* Expressive Visor Eyes */}
          {isHappy ? (
            /* Joyful ^ ^ eyes with glowing pink cheeks */
            <>
              <path d="M 7,12 Q 8.5,9.5 10,12" stroke="var(--nova-cyan)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M 12,12 Q 13.5,9.5 15,12" stroke="var(--nova-cyan)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <circle cx="6.5" cy="13" r="0.9" fill="#FDA4AF" />
              <circle cx="15.5" cy="13" r="0.9" fill="#FDA4AF" />
            </>
          ) : isBlinking ? (
            /* Blinking Eyelid Lines */
            <>
              <line x1="7" y1={eyeY} x2="9.8" y2={eyeY} stroke="var(--nova-cyan)" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="12.2" y1={eyeY} x2="15" y2={eyeY} stroke="var(--nova-cyan)" strokeWidth="1.4" strokeLinecap="round" />
            </>
          ) : isWinking ? (
            /* Wink Expression */
            <>
              <path d="M 7,12 Q 8.5,9.5 10,12" stroke="var(--nova-cyan)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <circle cx="13.5" cy={eyeY} r="1.4" fill="var(--nova-cyan)" />
              <circle cx="13.9" cy={eyeY - 0.4} r="0.4" fill="#FFFFFF" />
            </>
          ) : (
            /* Natural Cyber LED Eyes with Pupil Glint & Looking Direction */
            <>
              <circle cx={leftEyeX} cy={eyeY} r="1.4" fill="var(--nova-cyan)" />
              <circle cx={leftEyeX + 0.4} cy={eyeY - 0.4} r="0.4" fill="#FFFFFF" />
              <circle cx={rightEyeX} cy={eyeY} r="1.4" fill="var(--nova-cyan)" />
              <circle cx={rightEyeX + 0.4} cy={eyeY - 0.4} r="0.4" fill="#FFFFFF" />
            </>
          )}

          {/* Ear Bolts with Subtle Glow */}
          <rect x="1" y="8.5" width="1.8" height="5" rx="0.9" fill="var(--nova-cyan)" />
          <rect x="19.2" y="8.5" width="1.8" height="5" rx="0.9" fill="var(--nova-cyan)" />
        </svg>
      </div>
      <span
        style={{
          fontSize: isCompact ? '10px' : '11px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: 'var(--nova-cyan)',
          lineHeight: 1,
          display: 'inline-block',
        }}
      >
        ASTRO
      </span>
    </motion.div>
  );
};

const EDGE_GRADIENTS: Record<string, string> = {
  'cyan-pulse': 'linear-gradient(90deg, #38BDF8, #3B82F6, #60A5FA, #38BDF8)',
  'emerald-beam': 'linear-gradient(90deg, #10B981, #34D399, #06B6D4, #10B981)',
  'sunset-flare': 'linear-gradient(90deg, #F59E0B, #F43F5E, #EC4899, #F59E0B)',
  'violet-aurora': 'linear-gradient(90deg, #8B5CF6, #A855F7, #EC4899, #8B5CF6)',
  'pure-white': 'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0.25), rgba(255,255,255,0.95))',
  'chromatic': 'linear-gradient(90deg, #60A5FA, #A78BFA, #F43F5E, #38BDF8, #34D399, #60A5FA)',
};

export const IslandPillContent: React.FC<{ isCompact?: boolean }> = ({ isCompact = false }) => {
  const { liveActivity } = useIslandStore();
  const { media, metrics } = useSystemStore();
  const { settings } = useThemeStore();
  const { isRunning: isTimerRunning, secondsRemaining, stopwatchSeconds, mode: timerMode } = useTimerStore();
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

  const isNotch =
    (settings.notchStyle === 'notch-attached' || settings.notchStyle === 'chamfered-notch') &&
    !settings.screenPosition?.startsWith('bottom');

  const pillContentMode = settings.pillDisplayContent || 'smart-auto';
  const isSplitCapsule = settings.notchStyle === 'split-capsule';

  const customEdgeColor = settings.customEdgeLightingColor || '#38BDF8';
  const resolvedEdgeBackground =
    settings.edgeLightingColor === 'custom'
      ? `linear-gradient(90deg, ${customEdgeColor}, #ffffff, ${customEdgeColor})`
      : (EDGE_GRADIENTS[settings.edgeLightingColor || 'cyan-pulse'] || EDGE_GRADIENTS['cyan-pulse']);

  // True Twin-Pod Split Capsule architecture
  if (isSplitCapsule) {
    const borderGlow = Math.max(0.05, ((settings.glassmorphismBorderGlow ?? 35) / 100) * 0.45);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: '100%' }}>
        {/* Left Pod: Mascot / Identity Pod */}
        <div
          style={{
            height: '100%',
            padding: isCompact ? '0 8px' : '0 12px',
            borderRadius: '20px',
            backgroundColor: 'var(--nova-pill-bg)',
            boxShadow: 'var(--nova-shadow-pill)',
            border: `1px solid rgba(255, 255, 255, ${borderGlow})`,
            backdropFilter: `blur(${settings.glassmorphismBlur ?? 24}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${settings.glassmorphismBlur ?? 24}px) saturate(180%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {settings.edgeLightingMode && settings.edgeLightingMode !== 'off' && (
            <div
              className={`edge-lighting-trail mode-${settings.edgeLightingMode} speed-${settings.edgeLightingSpeed || 'normal'}`}
              style={{ background: resolvedEdgeBackground }}
            />
          )}
          <IslandBrandMascot isCompact={isCompact} type={settings.pillBrandBadge || 'robot'} />
        </div>

        {/* Right Pod: Telemetry / Time / Media Pod */}
        <div
          style={{
            flex: 1,
            height: '100%',
            padding: isCompact ? '0 10px' : '0 14px',
            borderRadius: '20px',
            backgroundColor: 'var(--nova-pill-bg)',
            boxShadow: 'var(--nova-shadow-pill)',
            border: `1px solid rgba(255, 255, 255, ${borderGlow})`,
            backdropFilter: `blur(${settings.glassmorphismBlur ?? 24}px) saturate(180%)`,
            WebkitBackdropFilter: `blur(${settings.glassmorphismBlur ?? 24}px) saturate(180%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {settings.edgeLightingMode && settings.edgeLightingMode !== 'off' && (
            <div
              className={`edge-lighting-trail mode-${settings.edgeLightingMode} speed-${settings.edgeLightingSpeed || 'normal'}`}
              style={{ background: resolvedEdgeBackground }}
            />
          )}
          {media.isPlaying ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
              <Music size={12} style={{ color: 'var(--nova-blue)', flexShrink: 0 }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {media.title || 'Playing'}
              </span>
            </div>
          ) : (
            <span
              style={{
                fontSize: isCompact ? '10px' : '11.5px',
                fontWeight: 600,
                color: 'var(--nova-text-primary)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.02em',
              }}
            >
              {time}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '10px', color: 'var(--nova-text-secondary)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Cpu size={10} style={{ color: 'var(--nova-blue)' }} />
              {metrics.cpuUsagePercent}%
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Activity size={10} style={{ color: 'var(--nova-cyan)' }} />
              {metrics.ramUsagePercent}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
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

      {/* Render based on user-configured pillDisplayContent mode */}
      {isTimerRunning ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '12px' }}>{timerMode === 'stopwatch' ? '⏱️' : '⏳'}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nova-cyan)', textTransform: 'capitalize' }}>
              {timerMode === 'pomodoro' ? 'Focus' : timerMode}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
            {`${String(Math.floor((timerMode === 'stopwatch' ? stopwatchSeconds : secondsRemaining) / 60)).padStart(2, '0')}:${String((timerMode === 'stopwatch' ? stopwatchSeconds : secondsRemaining) % 60).padStart(2, '0')}`}
          </div>
        </div>
      ) : liveActivity && pillContentMode !== 'minimal-zen' ? (
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
      ) : (pillContentMode === 'media-priority' && media.title) ||
        (pillContentMode === 'smart-auto' && media.isPlaying) ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
          <div
            style={{
              color: media.isPlaying ? 'var(--nova-cyan)' : 'var(--nova-text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Music size={13} style={{ marginRight: 4 }} />
            {media.isPlaying ? (
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
            ) : (
              <span style={{ fontSize: '9px', opacity: 0.8 }}>⏸</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxWidth: 175 }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: media.isPlaying ? 'var(--nova-text-primary)' : 'var(--nova-text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {media.title || 'Ready for YouTube / Media'}
            </span>
            {media.title && (
              <span
                style={{
                  fontSize: '9px',
                  color: 'var(--nova-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {media.isPlaying ? (media.artist || 'Web Media') : `(Paused) ${media.artist || ''}`}
              </span>
            )}
          </div>
        </div>
      ) : pillContentMode === 'telemetry' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <motion.span
              animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--nova-cyan)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nova-text-primary)' }}>
              SYS
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
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--nova-blue)' }}>
              <Cpu size={10} /> {metrics.cpuUsagePercent}%
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--nova-cyan)' }}>
              <Activity size={10} /> {metrics.ramUsagePercent}%
            </span>
            <span style={{ color: 'var(--nova-text-muted)' }}>{metrics.cpuTempCelsius}°C</span>
          </div>
        </div>
      ) : pillContentMode === 'network-speed' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Wifi size={13} style={{ color: 'var(--nova-cyan)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--nova-text-primary)' }}>
              NET
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span style={{ color: 'var(--nova-cyan)' }}>
              ↓ {metrics.networkDownloadKbps > 1024 ? `${(metrics.networkDownloadKbps / 1024).toFixed(1)}M` : `${metrics.networkDownloadKbps}K`}
            </span>
            <span style={{ color: 'var(--nova-blue)' }}>
              ↑ {metrics.networkUploadKbps > 1024 ? `${(metrics.networkUploadKbps / 1024).toFixed(1)}M` : `${metrics.networkUploadKbps}K`}
            </span>
          </div>
        </div>
      ) : pillContentMode === 'clock-weather' ? (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Left: Brand Mascot */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', zIndex: 1, lineHeight: 1 }}>
            <IslandBrandMascot isCompact={isCompact} type={settings.pillBrandBadge || 'robot'} />
          </div>

          {/* Center: Perfectly Centered Clock */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 2,
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontSize: isCompact ? '10px' : '11.5px',
                fontWeight: 600,
                color: 'var(--nova-text-primary)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.03em',
                lineHeight: 1,
                display: 'inline-block',
              }}
            >
              {time}
            </span>
          </div>

          {/* Right: Weather */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 4,
              fontSize: '10px',
              color: 'var(--nova-text-secondary)',
              zIndex: 1,
              lineHeight: 1,
            }}
          >
            <span>☀️ 22°C</span>
          </div>
        </div>
      ) : (
        /* Default and minimal-zen: Straight-Line Perfectly Aligned Layout */
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Left: Brand Mascot (Astro, Mochi, Quantum, Pixel, Text) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', zIndex: 1, lineHeight: 1 }}>
            <IslandBrandMascot isCompact={isCompact} type={settings.pillBrandBadge || 'robot'} />
          </div>

          {/* Center: Dedicated Centered Clock - Always Dead-Centered */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 2,
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontSize: isCompact ? '10px' : '11.5px',
                fontWeight: 600,
                color: 'var(--nova-text-primary)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.03em',
                lineHeight: 1,
                display: 'inline-block',
              }}
            >
              {time}
            </span>
          </div>

          {/* Right: Live Hardware Telemetry or Subtle Status Dot */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, zIndex: 1, lineHeight: 1 }}>
            {!isCompact && pillContentMode !== 'minimal-zen' ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '10px',
                  color: 'var(--nova-text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 2, lineHeight: 1 }}>
                  <Cpu size={10} style={{ color: 'var(--nova-blue)' }} />
                  {metrics.cpuUsagePercent}%
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 2, lineHeight: 1 }}>
                  <Activity size={10} style={{ color: 'var(--nova-cyan)' }} />
                  {metrics.ramUsagePercent}%
                </span>
                <ChevronDown size={11} style={{ color: 'var(--nova-text-muted)', opacity: 0.7 }} />
              </div>
            ) : (
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'var(--nova-cyan)',
                  boxShadow: '0 0 6px var(--nova-cyan)',
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

interface IslandPillProps {
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onClick?: () => void;
}

export const IslandPill: React.FC<IslandPillProps> = ({
  onHoverStart,
  onHoverEnd,
  onClick,
}) => {
  const { liveActivity } = useIslandStore();
  const { media } = useSystemStore();
  const { settings } = useThemeStore();

  const isRgb = settings.enableRgbBorder || settings.themeMode === 'rgb';
  const isBottom = settings.screenPosition?.startsWith('bottom');
  const isNotch =
    (settings.notchStyle === 'notch-attached' || settings.notchStyle === 'chamfered-notch') &&
    !isBottom;
  const isSquircle = settings.notchStyle === 'squircle-bar';
  const isCompact = settings.notchStyle === 'compact-badge';
  const isChamfered = settings.notchStyle === 'chamfered-notch';
  const isTeardrop = settings.notchStyle === 'teardrop-capsule';
  const isHexPill = settings.notchStyle === 'hex-pill';

  let borderRadius: string | number = 9999;
  if (isChamfered) {
    borderRadius = isBottom ? '16px 16px 0 0' : '0 0 16px 16px';
  } else if (isNotch) {
    borderRadius = isBottom ? '22px 22px 0 0' : '0 0 22px 22px';
  } else if (isSquircle) {
    borderRadius = '14px';
  } else if (isTeardrop) {
    borderRadius = '22px 8px 22px 18px';
  } else if (isHexPill) {
    borderRadius = '12px';
  }

  const effectiveWidth = isCompact
    ? 170
    : liveActivity || media.isPlaying || (settings.pillDisplayContent === 'media-priority' && media.title)
    ? 270
    : settings.pillDisplayContent === 'telemetry'
    ? 260
    : settings.pillWidth;

  const effectiveHeight = isCompact ? 32 : settings.pillHeight;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Natural Ambient Glow Aura */}
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

      {/* Left Notch Bezel Ear */}
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

      <div
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onClick={onClick}
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
      >
        <IslandPillContent isCompact={isCompact} />
      </div>
    </div>
  );
};
