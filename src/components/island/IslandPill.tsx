import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIslandStore } from '../../stores/useIslandStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useTimerStore } from '../../stores/useTimerStore';
import { Music, Activity, Battery, Timer, Cpu, QrCode, ChevronDown, Wifi } from 'lucide-react';
import { playPetSound } from '../../services/soundService';

interface MascotProps {
  isCompact?: boolean;
  type?: string;
  isTimerRunning?: boolean;
}

export const IslandBrandMascot: React.FC<MascotProps> = ({
  isCompact,
  type = 'robot',
  isTimerRunning = false,
}) => {
  const { media } = useSystemStore();
  const [expression, setExpression] = useState<'normal' | 'blink' | 'look-left' | 'look-right' | 'happy' | 'wink'>('normal');
  const [isInteracting, setIsInteracting] = useState(false);
  const [catTwitch, setCatTwitch] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

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
    playPetSound();
    setExpression('happy');
    setIsInteracting(true);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
    setTimeout(() => {
      setIsInteracting(false);
      setExpression('normal');
    }, 1400);
  };

  const isBlinking = expression === 'blink';
  const isLookingLeft = expression === 'look-left';
  const isLookingRight = expression === 'look-right';
  const isHappy = expression === 'happy' || isInteracting;
  const isWinking = expression === 'wink';

  // Base motion wrapper with interactive floating and music bobbing
  const bobbingDuration = media.isPlaying ? 0.55 : isInteracting ? 0.35 : 2.8;
  const bobbingY = media.isPlaying ? [-1.5, 1, -1.5] : isInteracting ? [-2.5, 1.5, -2.5] : [0, -1, 0];

  const mascotContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    lineHeight: 1,
    userSelect: 'none',
  };

  // Heart celebration particle on click
  const heartParticle = (
    <AnimatePresence>
      {showHeart && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 0.6 }}
          animate={{ opacity: 0, y: -16, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: -4,
            fontSize: '11px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          💖
        </motion.div>
      )}
    </AnimatePresence>
  );

  // 1. Mochi Cat
  if (type === 'cat') {
    return (
      <motion.div
        animate={{ y: bobbingY }}
        transition={{ duration: bobbingDuration, repeat: Infinity, ease: 'easeInOut' }}
        onClick={handleMascotClick}
        title="Pet Mochi Cat!"
        style={mascotContainerStyle}
      >
        {heartParticle}
        <svg width={isCompact ? 20 : 25} height={isCompact ? 18 : 22} viewBox="0 0 24 22" fill="none" style={{ display: 'block' }}>
          {/* Ears with interactive twitch */}
          <motion.polygon
            points="4,8 1.5,2 9,5.5"
            fill="#F472B6"
            animate={{ rotate: catTwitch ? [-8, 4, 0] : 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.polygon
            points="20,8 22.5,2 15,5.5"
            fill="#F472B6"
            animate={{ rotate: catTwitch ? [8, -4, 0] : 0 }}
            transition={{ duration: 0.3 }}
          />
          {/* Head */}
          <circle cx="12" cy="12" r="8.5" fill="#FDF2F8" stroke="#F472B6" strokeWidth="1.3" />
          {/* Blushing Cheeks with Soft Glow */}
          <motion.circle
            cx="7"
            cy="13.5"
            r="1.4"
            fill="#FDA4AF"
            animate={{ opacity: isHappy ? [0.7, 1, 0.7] : 0.8 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.circle
            cx="17"
            cy="13.5"
            r="1.4"
            fill="#FDA4AF"
            animate={{ opacity: isHappy ? [0.7, 1, 0.7] : 0.8 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="7.5" y1="11" x2="10.5" y2="11" stroke="#831843" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="13.5" y1="11" x2="16.5" y2="11" stroke="#831843" strokeWidth="1.3" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            <>
              <path d="M 7.5,12.5 Q 9,10 10.5,12.5" stroke="#831843" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M 13.5,12.5 Q 15,10 16.5,12.5" stroke="#831843" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="9" cy="11.5" r="1.4" fill="#831843" />
              <circle cx="15" cy="11.5" r="1.4" fill="#831843" />
              <circle cx="9.4" cy="11.1" r="0.4" fill="#FFFFFF" />
              <circle cx="15.4" cy="11.1" r="0.4" fill="#FFFFFF" />
            </>
          )}
          {/* Nose */}
          <polygon points="12,13.2 11,14.5 13,14.5" fill="#F43F5E" />
        </svg>
      </motion.div>
    );
  }

  // 2. Kitsune Fox
  if (type === 'fox') {
    return (
      <motion.div
        animate={{ y: bobbingY }}
        transition={{ duration: bobbingDuration, repeat: Infinity, ease: 'easeInOut' }}
        onClick={handleMascotClick}
        title="Pet Kitsune Fox!"
        style={mascotContainerStyle}
      >
        {heartParticle}
        <svg width={isCompact ? 20 : 25} height={isCompact ? 18 : 22} viewBox="0 0 24 22" fill="none" style={{ display: 'block' }}>
          {/* Big Fox Ears */}
          <polygon points="3,9 1,2 8,6" fill="#F97316" />
          <polygon points="4,7.5 2.5,3.5 7,6" fill="#FFF" />
          <polygon points="21,9 23,2 16,6" fill="#F97316" />
          <polygon points="20,7.5 21.5,3.5 17,6" fill="#FFF" />
          {/* Head & Muzzle */}
          <polygon points="12,21 3,10 21,10" fill="#EA580C" />
          <polygon points="12,20 6,11 18,11" fill="#FFF" />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="7.5" y1="11.5" x2="10" y2="11.5" stroke="#000" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="14" y1="11.5" x2="16.5" y2="11.5" stroke="#000" strokeWidth="1.3" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            <>
              <path d="M 7.5,12.5 Q 9,10 10.5,12.5" stroke="#000" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M 13.5,12.5 Q 15,10 16.5,12.5" stroke="#000" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="9" cy="11.5" r="1.3" fill="var(--nova-cyan)" />
              <circle cx="15" cy="11.5" r="1.3" fill="var(--nova-cyan)" />
            </>
          )}
          {/* Nose Tip */}
          <circle cx="12" cy="18.5" r="1.2" fill="#0F172A" />
        </svg>
      </motion.div>
    );
  }

  // 3. Draco Mini Dragon
  if (type === 'dragon') {
    return (
      <motion.div
        animate={{ y: bobbingY }}
        transition={{ duration: bobbingDuration, repeat: Infinity, ease: 'easeInOut' }}
        onClick={handleMascotClick}
        title="Pet Draco Dragon!"
        style={mascotContainerStyle}
      >
        {heartParticle}
        <svg width={isCompact ? 20 : 25} height={isCompact ? 18 : 22} viewBox="0 0 24 22" fill="none" style={{ display: 'block' }}>
          {/* Horns */}
          <polygon points="7,5 4,1 9,3" fill="#F59E0B" />
          <polygon points="17,5 20,1 15,3" fill="#F59E0B" />
          {/* Dragon Head */}
          <rect x="4" y="5" width="16" height="14" rx="6" fill="#10B981" />
          {/* Cute Belly / Snout */}
          <rect x="6.5" y="12" width="11" height="6.5" rx="3.5" fill="#34D399" />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="8" y1="10" x2="10.5" y2="10" stroke="#064E3B" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="13.5" y1="10" x2="16" y2="10" stroke="#064E3B" strokeWidth="1.4" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            <>
              <path d="M 8,10.5 Q 9.5,8.5 11,10.5" stroke="#064E3B" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M 13,10.5 Q 14.5,8.5 16,10.5" stroke="#064E3B" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="9.5" cy="9.5" r="1.5" fill="#064E3B" />
              <circle cx="14.5" cy="9.5" r="1.5" fill="#064E3B" />
              <circle cx="9.8" cy="9.2" r="0.5" fill="#A7F3D0" />
              <circle cx="14.8" cy="9.2" r="0.5" fill="#A7F3D0" />
            </>
          )}
          {/* Nostrils */}
          <circle cx="10.5" cy="14.5" r="0.7" fill="#064E3B" />
          <circle cx="13.5" cy="14.5" r="0.7" fill="#064E3B" />
        </svg>
      </motion.div>
    );
  }

  // 4. Bao Panda
  if (type === 'panda') {
    return (
      <motion.div
        animate={{ y: bobbingY }}
        transition={{ duration: bobbingDuration, repeat: Infinity, ease: 'easeInOut' }}
        onClick={handleMascotClick}
        title="Pet Bao Panda!"
        style={mascotContainerStyle}
      >
        {heartParticle}
        <svg width={isCompact ? 20 : 25} height={isCompact ? 18 : 22} viewBox="0 0 24 22" fill="none" style={{ display: 'block' }}>
          {/* Black Ears */}
          <circle cx="5.5" cy="5.5" r="3.5" fill="#0F172A" />
          <circle cx="18.5" cy="5.5" r="3.5" fill="#0F172A" />
          {/* White Head */}
          <circle cx="12" cy="12" r="8.5" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.2" />
          {/* Eye Patches */}
          <ellipse cx="8.5" cy="11.5" rx="2.5" ry="3" fill="#0F172A" transform="rotate(-15 8.5 11.5)" />
          <ellipse cx="15.5" cy="11.5" rx="2.5" ry="3" fill="#0F172A" transform="rotate(15 15.5 11.5)" />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="7.5" y1="11.5" x2="9.5" y2="11.5" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="14.5" y1="11.5" x2="16.5" y2="11.5" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            <>
              <path d="M 7.5,12.5 Q 8.5,10.5 9.5,12.5" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M 14.5,12.5 Q 15.5,10.5 16.5,12.5" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="8.5" cy="11.5" r="1.1" fill="#FFF" />
              <circle cx="15.5" cy="11.5" r="1.1" fill="#FFF" />
            </>
          )}
          {/* Nose */}
          <ellipse cx="12" cy="15" rx="1.3" ry="0.9" fill="#0F172A" />
        </svg>
      </motion.div>
    );
  }

  // 5. Pippin Penguin
  if (type === 'penguin') {
    return (
      <motion.div
        animate={{ y: bobbingY }}
        transition={{ duration: bobbingDuration, repeat: Infinity, ease: 'easeInOut' }}
        onClick={handleMascotClick}
        title="Pet Pippin Penguin!"
        style={mascotContainerStyle}
      >
        {heartParticle}
        <svg width={isCompact ? 20 : 25} height={isCompact ? 18 : 22} viewBox="0 0 24 22" fill="none" style={{ display: 'block' }}>
          {/* Cozy Earmuffs Band */}
          <path d="M 4,11 Q 12,2 20,11" stroke="var(--nova-cyan)" strokeWidth="1.8" fill="none" />
          <circle cx="4" cy="11" r="3" fill="var(--nova-blue)" />
          <circle cx="20" cy="11" r="3" fill="var(--nova-blue)" />
          {/* Penguin Body */}
          <ellipse cx="12" cy="12" rx="7.5" ry="8.5" fill="#0F172A" />
          {/* White Belly */}
          <ellipse cx="12" cy="13" rx="5" ry="6" fill="#F8FAFC" />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="9" y1="10" x2="11" y2="10" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="13" y1="10" x2="15" y2="10" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="10" cy="10" r="1.1" fill="#0F172A" />
              <circle cx="14" cy="10" r="1.1" fill="#0F172A" />
            </>
          )}
          {/* Beak */}
          <polygon points="12,14 10.5,12 13.5,12" fill="#F59E0B" />
        </svg>
      </motion.div>
    );
  }

  // 6. Spooky Ghost
  if (type === 'ghost') {
    return (
      <motion.div
        animate={{ y: [-2, 1.5, -2], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        onClick={handleMascotClick}
        title="Say hi to Spooky!"
        style={mascotContainerStyle}
      >
        {heartParticle}
        <svg width={isCompact ? 20 : 25} height={isCompact ? 18 : 22} viewBox="0 0 24 22" fill="none" style={{ display: 'block' }}>
          {/* Ghost Body */}
          <path
            d="M 5,11 Q 5,4 12,4 Q 19,4 19,11 L 19,18 Q 17,16 15.5,18 Q 14,20 12,18 Q 10,16 8.5,18 Q 7,20 5,18 Z"
            fill="rgba(241, 245, 249, 0.9)"
            stroke="var(--nova-cyan)"
            strokeWidth="1.2"
          />
          {/* Cheeks */}
          <circle cx="8" cy="13.5" r="1.1" fill="#FDA4AF" />
          <circle cx="16" cy="13.5" r="1.1" fill="#FDA4AF" />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="8" y1="11" x2="10.5" y2="11" stroke="#0F172A" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="13.5" y1="11" x2="16" y2="11" stroke="#0F172A" strokeWidth="1.3" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            <>
              <path d="M 8,11.5 Q 9.5,9.5 11,11.5" stroke="#0F172A" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M 13,11.5 Q 14.5,9.5 16,11.5" stroke="#0F172A" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="9.5" cy="11" r="1.4" fill="#0F172A" />
              <circle cx="14.5" cy="11" r="1.4" fill="#0F172A" />
              <circle cx="9.8" cy="10.7" r="0.4" fill="#FFF" />
              <circle cx="14.8" cy="10.7" r="0.4" fill="#FFF" />
            </>
          )}
        </svg>
      </motion.div>
    );
  }

  // 7. Hoot Cyber Owl
  if (type === 'owl') {
    return (
      <motion.div
        animate={{ y: bobbingY }}
        transition={{ duration: bobbingDuration, repeat: Infinity, ease: 'easeInOut' }}
        onClick={handleMascotClick}
        title="Pet Hoot Owl!"
        style={mascotContainerStyle}
      >
        {heartParticle}
        <svg width={isCompact ? 20 : 25} height={isCompact ? 18 : 22} viewBox="0 0 24 22" fill="none" style={{ display: 'block' }}>
          {/* Feather Ear Tufts */}
          <polygon points="5,8 2,2 8,5" fill="#8B5CF6" />
          <polygon points="19,8 22,2 16,5" fill="#8B5CF6" />
          {/* Owl Body */}
          <circle cx="12" cy="12" r="8.5" fill="#4C1D95" stroke="#8B5CF6" strokeWidth="1.2" />
          {/* Cyber Goggle Eyes */}
          <circle cx="8.5" cy="11" r="3.2" fill="#1E1B4B" stroke="var(--nova-cyan)" strokeWidth="1.2" />
          <circle cx="15.5" cy="11" r="3.2" fill="#1E1B4B" stroke="var(--nova-cyan)" strokeWidth="1.2" />
          {isBlinking ? (
            <>
              <line x1="7" y1="11" x2="10" y2="11" stroke="var(--nova-cyan)" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="14" y1="11" x2="17" y2="11" stroke="var(--nova-cyan)" strokeWidth="1.3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="8.5" cy="11" r="1.3" fill="var(--nova-cyan)" />
              <circle cx="15.5" cy="11" r="1.3" fill="var(--nova-cyan)" />
            </>
          )}
          {/* Beak */}
          <polygon points="12,15.5 10.5,13 13.5,13" fill="#F59E0B" />
        </svg>
      </motion.div>
    );
  }

  // 8. Quantum Core
  if (type === 'quantum') {
    return (
      <div style={mascotContainerStyle} onClick={handleMascotClick} title="Quantum Core">
        {heartParticle}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          style={{ width: isCompact ? 18 : 22, height: isCompact ? 18 : 22, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '1.5px dashed var(--nova-cyan)' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--nova-blue)', position: 'absolute', boxShadow: '0 0 8px var(--nova-blue)' }} />
        </motion.div>
      </div>
    );
  }

  // 9. Pixel Byte
  if (type === 'pixel-alien') {
    return (
      <motion.div
        animate={{ y: bobbingY }}
        transition={{ duration: 1.6, repeat: Infinity }}
        onClick={handleMascotClick}
        title="Pixel Byte"
        style={mascotContainerStyle}
      >
        {heartParticle}
        <svg width={isCompact ? 18 : 22} height={isCompact ? 16 : 19} viewBox="0 0 16 14" fill="none" style={{ display: 'block' }}>
          <rect x="2" y="2" width="2" height="2" fill="var(--nova-warning)" />
          <rect x="12" y="2" width="2" height="2" fill="var(--nova-warning)" />
          <rect x="4" y="4" width="8" height="6" fill="var(--nova-warning)" />
          <rect x="2" y="6" width="12" height="4" fill="var(--nova-warning)" />
          {isBlinking ? null : (
            <>
              <rect x="5" y="6" width="2" height="2" fill="#000" />
              <rect x="9" y="6" width="2" height="2" fill="#000" />
            </>
          )}
        </svg>
      </motion.div>
    );
  }

  // 10. Default: Astro Robot
  const leftEyeX = isLookingLeft ? 7.2 : isLookingRight ? 9.8 : 8.5;
  const rightEyeX = isLookingLeft ? 12.2 : isLookingRight ? 14.8 : 13.5;
  const eyeY = 11.2;

  return (
    <motion.div
      animate={{ y: bobbingY }}
      transition={{ duration: bobbingDuration, repeat: Infinity, ease: 'easeInOut' }}
      onClick={handleMascotClick}
      title="Pet Astro Robot!"
      style={mascotContainerStyle}
    >
      {heartParticle}
      <svg
        width={isCompact ? 20 : 25}
        height={isCompact ? 18 : 22}
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

        {/* Focus Headband when Timer is Active (Cheerleader Mode!) */}
        {isTimerRunning && (
          <rect x="3" y="6" width="16" height="2.2" rx="1" fill="#EF4444" stroke="#DC2626" strokeWidth="0.6" />
        )}

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
        {/* Left Pod: ALWAYS CONTINUOUS MASCOT POD */}
        <div
          style={{
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
          <IslandBrandMascot isCompact={isCompact} type={settings.pillBrandBadge || 'robot'} isTimerRunning={isTimerRunning} />
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
          {isTimerRunning ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1, lineHeight: 1 }}>
              <span style={{ fontSize: '11px' }}>⏱️</span>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--nova-cyan)', fontFamily: 'var(--font-mono)' }}>
                {`${String(Math.floor((timerMode === 'stopwatch' ? stopwatchSeconds : secondsRemaining) / 60)).padStart(2, '0')}:${String((timerMode === 'stopwatch' ? stopwatchSeconds : secondsRemaining) % 60).padStart(2, '0')}`}
              </span>
            </div>
          ) : media.isPlaying ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1, lineHeight: 1 }}>
              <Music size={12} style={{ color: 'var(--nova-blue)', flexShrink: 0 }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1 }}>
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
                lineHeight: 1,
              }}
            >
              {time}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '10px', color: 'var(--nova-text-secondary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
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

  // Single Master Layout: Mascot is ALWAYS CONTINUOUSLY VISIBLE on the left!
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: isCompact ? '0 10px' : '0 14px',
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

      {/* LEFT: The Mascot is ALWAYS CONTINUOUSLY PRESENT in ALL MODES! */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', zIndex: 3, flexShrink: 0, lineHeight: 1 }}>
        <IslandBrandMascot isCompact={isCompact} type={settings.pillBrandBadge || 'robot'} isTimerRunning={isTimerRunning} />
      </div>

      {/* CENTER: Dead-Center Zone (Guaranteed 50% Horizontal & Vertical Centering) */}
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
          maxWidth: isCompact ? 105 : 155,
        }}
      >
        {isTimerRunning ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: '11.5px', fontWeight: 700, color: 'var(--nova-cyan)', letterSpacing: '0.04em' }}>
            <span>{timerMode === 'stopwatch' ? '⏱️' : '⏳'}</span>
            <span>{`${String(Math.floor((timerMode === 'stopwatch' ? stopwatchSeconds : secondsRemaining) / 60)).padStart(2, '0')}:${String((timerMode === 'stopwatch' ? stopwatchSeconds : secondsRemaining) % 60).padStart(2, '0')}`}</span>
          </div>
        ) : (pillContentMode === 'media-priority' && media.title) || (pillContentMode === 'smart-auto' && media.isPlaying) ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--nova-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: isCompact ? 90 : 130 }}>
              {media.title || 'YouTube Media'}
            </span>
          </div>
        ) : pillContentMode === 'network-speed' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--nova-cyan)' }}>
              ↓ {metrics.networkDownloadKbps > 1024 ? `${(metrics.networkDownloadKbps / 1024).toFixed(1)}M` : `${metrics.networkDownloadKbps}K`}
            </span>
            <span style={{ color: 'var(--nova-blue)' }}>
              ↑ {metrics.networkUploadKbps > 1024 ? `${(metrics.networkUploadKbps / 1024).toFixed(1)}M` : `${metrics.networkUploadKbps}K`}
            </span>
          </div>
        ) : (
          /* Normal, Telemetry, Clock-Weather, Minimal-Zen: Absolute Dead-Center Clock */
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
        )}
      </div>

      {/* RIGHT: Contextual Telemetry, 5-Bar Live Equalizer, Weather, or Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, zIndex: 3, flexShrink: 0, lineHeight: 1 }}>
        {media.isPlaying ? (
          /* 5-Bar Live Micro Audio Visualizer */
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
            <motion.span animate={{ height: ['3px', '11px', '4px'] }} transition={{ duration: 0.65, repeat: Infinity }} style={{ width: 2, backgroundColor: 'var(--nova-cyan)', borderRadius: 1 }} />
            <motion.span animate={{ height: ['9px', '3px', '12px'] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ width: 2, backgroundColor: 'var(--nova-blue)', borderRadius: 1 }} />
            <motion.span animate={{ height: ['4px', '13px', '5px'] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ width: 2, backgroundColor: 'var(--nova-violet)', borderRadius: 1 }} />
            <motion.span animate={{ height: ['11px', '4px', '8px'] }} transition={{ duration: 0.55, repeat: Infinity }} style={{ width: 2, backgroundColor: 'var(--nova-cyan)', borderRadius: 1 }} />
            <motion.span animate={{ height: ['4px', '9px', '3px'] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ width: 2, backgroundColor: 'var(--nova-blue)', borderRadius: 1 }} />
          </div>
        ) : pillContentMode === 'clock-weather' ? (
          <span style={{ fontSize: '10px', color: 'var(--nova-text-secondary)' }}>☀️ 22°C</span>
        ) : !isCompact && pillContentMode !== 'minimal-zen' ? (
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

  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        borderRadius,
        position: 'relative',
        userSelect: 'none',
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
    >
      <IslandPillContent isCompact={isCompact} />
    </motion.div>
  );
};
