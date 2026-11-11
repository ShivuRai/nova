import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIslandStore } from '../../stores/useIslandStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useTimerStore } from '../../stores/useTimerStore';
import { Music, Activity, Battery, Timer, Cpu, ChevronDown, Wifi, Sparkles, TrendingUp, Sun, Flame, Zap } from 'lucide-react';
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
  const bobbingDuration = media.isPlaying ? 0.52 : isInteracting ? 0.32 : 2.6;
  const bobbingY = media.isPlaying ? [-1.8, 1.2, -1.8] : isInteracting ? [-3, 1.8, -3] : [0, -1.2, 0];

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
          animate={{ opacity: 0, y: -18, scale: 1.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: -6,
            fontSize: '13px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          💖
        </motion.div>
      )}
    </AnimatePresence>
  );

  const mascotW = isCompact ? 24 : 30;
  const mascotH = isCompact ? 22 : 28;

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
        <svg width={mascotW} height={mascotH} viewBox="0 0 28 26" fill="none" style={{ display: 'block', overflow: 'visible' }}>
          {/* Animated Swaying Tail */}
          <motion.path
            d="M 23,17 Q 27,12 25,7"
            stroke="#F472B6"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            animate={{ rotate: [-6, 8, -6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '23px 17px' }}
          />
          {/* Ears with interactive twitch */}
          <motion.polygon
            points="5,9 2,2 10.5,6"
            fill="#F472B6"
            animate={{ rotate: catTwitch ? [-10, 5, 0] : 0 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: '5px 9px' }}
          />
          <motion.polygon
            points="23,9 26,2 17.5,6"
            fill="#F472B6"
            animate={{ rotate: catTwitch ? [10, -5, 0] : 0 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: '23px 9px' }}
          />
          {/* Inner ears */}
          <polygon points="5.5,8 3.5,3.5 9.5,6" fill="#FDF2F8" />
          <polygon points="22.5,8 24.5,3.5 18.5,6" fill="#FDF2F8" />
          {/* Head */}
          <circle cx="14" cy="14" r="10" fill="#FDF2F8" stroke="#F472B6" strokeWidth="1.4" />
          {/* Blushing Cheeks with Soft Glow */}
          <motion.circle
            cx="8"
            cy="16"
            r="1.7"
            fill="#FDA4AF"
            animate={{ opacity: isHappy ? [0.7, 1, 0.7] : 0.85 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.circle
            cx="20"
            cy="16"
            r="1.7"
            fill="#FDA4AF"
            animate={{ opacity: isHappy ? [0.7, 1, 0.7] : 0.85 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="8.5" y1="13" x2="12" y2="13" stroke="#831843" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="16" y1="13" x2="19.5" y2="13" stroke="#831843" strokeWidth="1.4" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            <>
              <path d="M 8.5,14.5 Q 10.5,11.5 12.5,14.5" stroke="#831843" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M 15.5,14.5 Q 17.5,11.5 19.5,14.5" stroke="#831843" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </>
          ) : isWinking ? (
            <>
              <path d="M 8.5,14.5 Q 10.5,11.5 12.5,14.5" stroke="#831843" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <circle cx="17.5" cy="13.5" r="1.6" fill="#831843" />
              <circle cx="18" cy="13" r="0.5" fill="#FFFFFF" />
            </>
          ) : (
            <>
              <circle cx="10.5" cy="13.5" r="1.6" fill="#831843" />
              <circle cx="17.5" cy="13.5" r="1.6" fill="#831843" />
              <circle cx="11" cy="13" r="0.5" fill="#FFFFFF" />
              <circle cx="18" cy="13" r="0.5" fill="#FFFFFF" />
            </>
          )}
          {/* Nose & Whiskers */}
          <polygon points="14,15.2 13,16.5 15,16.5" fill="#F43F5E" />
          <line x1="6" y1="14.5" x2="2.5" y2="13.5" stroke="#F472B6" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="6" y1="16.5" x2="2.5" y2="17.5" stroke="#F472B6" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="22" y1="14.5" x2="25.5" y2="13.5" stroke="#F472B6" strokeWidth="0.8" strokeLinecap="round" />
          <line x1="22" y1="16.5" x2="25.5" y2="17.5" stroke="#F472B6" strokeWidth="0.8" strokeLinecap="round" />
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
        <svg width={mascotW} height={mascotH} viewBox="0 0 28 26" fill="none" style={{ display: 'block', overflow: 'visible' }}>
          {/* Twin Swaying Spirit Tails */}
          <motion.path
            d="M 22,18 Q 27,14 26,8 Q 24,12 21,17"
            fill="#EA580C"
            animate={{ rotate: [-6, 8, -6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '22px 18px' }}
          />
          {/* Floating Fox Spirit Flame */}
          <motion.circle
            cx="2"
            cy="11"
            r="1.8"
            fill="var(--nova-cyan)"
            animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 0.95, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          {/* Fox Ears */}
          <polygon points="4,11 1,2 9.5,7" fill="#F97316" />
          <polygon points="5,9.5 2.8,4.5 8.5,7.5" fill="#FFF" />
          <polygon points="24,11 27,2 18.5,7" fill="#F97316" />
          <polygon points="23,9.5 25.2,4.5 19.5,7.5" fill="#FFF" />
          {/* Head & Muzzle */}
          <polygon points="14,24 4,12 24,12" fill="#EA580C" />
          <polygon points="14,23 7,13 21,13" fill="#FFF" />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="8.5" y1="13.5" x2="11.5" y2="13.5" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="16.5" y1="13.5" x2="19.5" y2="13.5" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            <>
              <path d="M 8.5,14.5 Q 10.5,11.5 12.5,14.5" stroke="#000" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M 15.5,14.5 Q 17.5,11.5 19.5,14.5" stroke="#000" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="10.5" cy="13.5" r="1.5" fill="var(--nova-cyan)" />
              <circle cx="17.5" cy="13.5" r="1.5" fill="var(--nova-cyan)" />
              <circle cx="11" cy="13" r="0.5" fill="#FFF" />
              <circle cx="18" cy="13" r="0.5" fill="#FFF" />
            </>
          )}
          {/* Nose Tip */}
          <circle cx="14" cy="21.5" r="1.4" fill="#0F172A" />
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
        <svg width={mascotW} height={mascotH} viewBox="0 0 28 26" fill="none" style={{ display: 'block', overflow: 'visible' }}>
          {/* Animated Flapping Wings */}
          <motion.path
            d="M 5,14 Q 0,8 3,4 Q 6,9 6,14"
            fill="#059669"
            animate={{ rotate: [-12, 12, -12] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '6px 14px' }}
          />
          <motion.path
            d="M 23,14 Q 28,8 25,4 Q 22,9 22,14"
            fill="#059669"
            animate={{ rotate: [12, -12, 12] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '22px 14px' }}
          />
          {/* Horns */}
          <polygon points="8,7 4,2 10.5,4.5" fill="#F59E0B" />
          <polygon points="20,7 24,2 17.5,4.5" fill="#F59E0B" />
          {/* Dragon Head */}
          <rect x="5" y="6" width="18" height="16" rx="7" fill="#10B981" />
          {/* Snout */}
          <rect x="8" y="14" width="12" height="7.5" rx="4" fill="#34D399" />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="9.5" y1="12" x2="12.5" y2="12" stroke="#064E3B" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="15.5" y1="12" x2="18.5" y2="12" stroke="#064E3B" strokeWidth="1.5" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            <>
              <path d="M 9.5,12.5 Q 11,10 12.5,12.5" stroke="#064E3B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M 15.5,12.5 Q 17,10 18.5,12.5" stroke="#064E3B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="11" cy="11.5" r="1.7" fill="#064E3B" />
              <circle cx="17" cy="11.5" r="1.7" fill="#064E3B" />
              <circle cx="11.5" cy="11" r="0.6" fill="#A7F3D0" />
              <circle cx="17.5" cy="11" r="0.6" fill="#A7F3D0" />
            </>
          )}
          {/* Nostrils */}
          <circle cx="12" cy="17" r="0.8" fill="#064E3B" />
          <circle cx="16" cy="17" r="0.8" fill="#064E3B" />
          {/* Playful Ember Spark on Hover */}
          {isHappy && (
            <motion.circle
              cx="14"
              cy="7"
              r="1.4"
              fill="#F97316"
              animate={{ y: [-1, -6], opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
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
        <svg width={mascotW} height={mascotH} viewBox="0 0 28 26" fill="none" style={{ display: 'block', overflow: 'visible' }}>
          {/* Black Ears with twitch */}
          <motion.circle
            cx="6.5"
            cy="6.5"
            r="4.2"
            fill="#0F172A"
            animate={{ rotate: catTwitch ? [-8, 8, 0] : 0 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: '6.5px 6.5px' }}
          />
          <motion.circle
            cx="21.5"
            cy="6.5"
            r="4.2"
            fill="#0F172A"
            animate={{ rotate: catTwitch ? [8, -8, 0] : 0 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: '21.5px 6.5px' }}
          />
          {/* White Head */}
          <circle cx="14" cy="14" r="10" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.4" />
          {/* Eye Patches */}
          <ellipse cx="10" cy="13.5" rx="3" ry="3.5" fill="#0F172A" transform="rotate(-15 10 13.5)" />
          <ellipse cx="18" cy="13.5" rx="3" ry="3.5" fill="#0F172A" transform="rotate(15 18 13.5)" />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="8.5" y1="13.5" x2="11.5" y2="13.5" stroke="#FFF" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="16.5" y1="13.5" x2="19.5" y2="13.5" stroke="#FFF" strokeWidth="1.3" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            <>
              <path d="M 8.5,14.5 Q 10,12 11.5,14.5" stroke="#FFF" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M 16.5,14.5 Q 18,12 19.5,14.5" stroke="#FFF" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="10" cy="13.5" r="1.3" fill="#FFF" />
              <circle cx="18" cy="13.5" r="1.3" fill="#FFF" />
              <circle cx="10.5" cy="13" r="0.4" fill="#0F172A" />
              <circle cx="18.5" cy="13" r="0.4" fill="#0F172A" />
            </>
          )}
          {/* Nose */}
          <ellipse cx="14" cy="17.5" rx="1.6" ry="1.1" fill="#0F172A" />
          {/* Chewing Bamboo Stalk */}
          <path d="M 14,19 Q 19,19 23,17" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="21" cy="17" r="1" fill="#4ADE80" />
        </svg>
      </motion.div>
    );
  }

  // 5. Pippin Penguin
  if (type === 'penguin') {
    return (
      <motion.div
        animate={{ y: bobbingY, rotate: [-4, 4, -4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        onClick={handleMascotClick}
        title="Pet Pippin Penguin!"
        style={mascotContainerStyle}
      >
        {heartParticle}
        <svg width={mascotW} height={mascotH} viewBox="0 0 28 26" fill="none" style={{ display: 'block', overflow: 'visible' }}>
          {/* Earmuffs Band */}
          <path d="M 5,13 Q 14,2 23,13" stroke="var(--nova-cyan)" strokeWidth="2" fill="none" />
          <circle cx="5" cy="13" r="3.5" fill="var(--nova-blue)" />
          <circle cx="23" cy="13" r="3.5" fill="var(--nova-blue)" />
          {/* Penguin Body */}
          <ellipse cx="14" cy="14" rx="9" ry="10" fill="#0F172A" />
          {/* White Belly */}
          <ellipse cx="14" cy="15" rx="6" ry="7.2" fill="#F8FAFC" />
          {/* Cozy Fluttering Winter Scarf */}
          <rect x="8" y="18" width="12" height="3" rx="1.5" fill="#06B6D4" />
          <motion.path
            d="M 17,20 L 19,25 L 21,24 L 19,20 Z"
            fill="#0891B2"
            animate={{ rotate: [-8, 8, -8] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '17px 20px' }}
          />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="10.5" y1="11.5" x2="13" y2="11.5" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="15" y1="11.5" x2="17.5" y2="11.5" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="11.5" cy="11.5" r="1.4" fill="#0F172A" />
              <circle cx="16.5" cy="11.5" r="1.4" fill="#0F172A" />
              <circle cx="12" cy="11" r="0.4" fill="#FFF" />
              <circle cx="17" cy="11" r="0.4" fill="#FFF" />
            </>
          )}
          {/* Orange Beak */}
          <polygon points="14,16.5 12,14 16,14" fill="#F59E0B" />
        </svg>
      </motion.div>
    );
  }

  // 6. Spooky Ghost
  if (type === 'ghost') {
    return (
      <motion.div
        animate={{ y: [-3, 2, -3], rotate: [0, 2.5, -2.5, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        onClick={handleMascotClick}
        title="Say hi to Spooky!"
        style={mascotContainerStyle}
      >
        {heartParticle}
        <svg width={mascotW} height={mascotH} viewBox="0 0 28 26" fill="none" style={{ display: 'block', overflow: 'visible' }}>
          {/* Ghost Body with soft aura */}
          <path
            d="M 6,13 Q 6,4 14,4 Q 22,4 22,13 L 22,21 Q 19.5,18.5 18,21 Q 16,23 14,21 Q 12,18.5 10,21 Q 8.5,23 6,21 Z"
            fill="rgba(241, 245, 249, 0.92)"
            stroke="var(--nova-cyan)"
            strokeWidth="1.4"
          />
          {/* Glowing Aura Sparkles */}
          <circle cx="4" cy="7" r="1" fill="var(--nova-cyan)" />
          <circle cx="24" cy="9" r="1.2" fill="var(--nova-cyan)" />
          {/* Cheeks */}
          <circle cx="9.5" cy="16" r="1.4" fill="#FDA4AF" />
          <circle cx="18.5" cy="16" r="1.4" fill="#FDA4AF" />
          {/* Eyes */}
          {isBlinking ? (
            <>
              <line x1="9.5" y1="13" x2="12.5" y2="13" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="15.5" y1="13" x2="18.5" y2="13" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" />
            </>
          ) : isHappy ? (
            <>
              <path d="M 9.5,13.5 Q 11,11 12.5,13.5" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M 15.5,13.5 Q 17,11 18.5,13.5" stroke="#0F172A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="11" cy="12.5" r="1.6" fill="#0F172A" />
              <circle cx="17" cy="12.5" r="1.6" fill="#0F172A" />
              <circle cx="11.4" cy="12.1" r="0.5" fill="#FFF" />
              <circle cx="17.4" cy="12.1" r="0.5" fill="#FFF" />
            </>
          )}
          {/* Mouth */}
          <ellipse cx="14" cy="16.5" rx="1.5" ry="2" fill="#0F172A" />
        </svg>
      </motion.div>
    );
  }

  // 7. Hoot Cyber Owl
  if (type === 'owl') {
    return (
      <motion.div
        animate={{ y: bobbingY, rotate: [-8, 8, -8] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        onClick={handleMascotClick}
        title="Pet Hoot Owl!"
        style={mascotContainerStyle}
      >
        {heartParticle}
        <svg width={mascotW} height={mascotH} viewBox="0 0 28 26" fill="none" style={{ display: 'block', overflow: 'visible' }}>
          {/* Feather Ear Tufts */}
          <polygon points="6,9 2,2 10,5.5" fill="#8B5CF6" />
          <polygon points="22,9 26,2 18,5.5" fill="#8B5CF6" />
          {/* Owl Body */}
          <circle cx="14" cy="14" r="10" fill="#4C1D95" stroke="#8B5CF6" strokeWidth="1.4" />
          {/* Cyber Goggle Eyes */}
          <circle cx="10" cy="13" r="3.8" fill="#1E1B4B" stroke="var(--nova-cyan)" strokeWidth="1.3" />
          <circle cx="18" cy="13" r="3.8" fill="#1E1B4B" stroke="var(--nova-cyan)" strokeWidth="1.3" />
          {isBlinking ? (
            <>
              <line x1="8" y1="13" x2="12" y2="13" stroke="var(--nova-cyan)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="13" x2="20" y2="13" stroke="var(--nova-cyan)" strokeWidth="1.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="10" cy="13" r="1.6" fill="var(--nova-cyan)" />
              <circle cx="18" cy="13" r="1.6" fill="var(--nova-cyan)" />
              <circle cx="10.5" cy="12.5" r="0.5" fill="#FFF" />
              <circle cx="18.5" cy="12.5" r="0.5" fill="#FFF" />
            </>
          )}
          {/* Beak */}
          <polygon points="14,18 12,15 16,15" fill="#F59E0B" />
        </svg>
      </motion.div>
    );
  }

  // 8. Quantum Core
  if (type === 'quantum') {
    return (
      <div style={mascotContainerStyle} onClick={handleMascotClick} title="Quantum Core">
        {heartParticle}
        <div style={{ width: mascotW, height: mascotH, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Outer Gyro Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: '90%', height: '90%', borderRadius: '50%', border: '1.8px dashed var(--nova-cyan)' }}
          />
          {/* Inner Counter-Rotating Gyro Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', width: '65%', height: '65%', borderRadius: '50%', border: '1.4px solid var(--nova-blue)', borderTopColor: 'transparent' }}
          />
          {/* Core Pulsing Orb */}
          <motion.div
            animate={{ scale: [0.85, 1.25, 0.85] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--nova-cyan)', boxShadow: '0 0 10px var(--nova-cyan)' }}
          />
        </div>
      </div>
    );
  }

  // 9. Pixel Byte
  if (type === 'pixel-alien') {
    return (
      <motion.div
        animate={{ y: bobbingY }}
        transition={{ duration: 1.4, repeat: Infinity }}
        onClick={handleMascotClick}
        title="Pixel Byte"
        style={mascotContainerStyle}
      >
        {heartParticle}
        <svg width={mascotW} height={mascotH} viewBox="0 0 20 18" fill="none" style={{ display: 'block' }}>
          <rect x="3" y="3" width="2.5" height="2.5" fill="var(--nova-warning)" />
          <rect x="14.5" y="3" width="2.5" height="2.5" fill="var(--nova-warning)" />
          <rect x="5.5" y="5.5" width="9" height="7.5" fill="var(--nova-warning)" />
          <rect x="3" y="8" width="14" height="5" fill="var(--nova-warning)" />
          {isBlinking ? null : (
            <>
              <rect x="6.5" y="8" width="2.5" height="2.5" fill="#000" />
              <rect x="11" y="8" width="2.5" height="2.5" fill="#000" />
            </>
          )}
          {/* Stepped Feet */}
          <rect x="4" y="14" width="2.5" height="2.5" fill="var(--nova-warning)" />
          <rect x="13.5" y="14" width="2.5" height="2.5" fill="var(--nova-warning)" />
        </svg>
      </motion.div>
    );
  }

  // 10. Default: Astro Robot
  const leftEyeX = isLookingLeft ? 9 : isLookingRight ? 12 : 10.5;
  const rightEyeX = isLookingLeft ? 15.5 : isLookingRight ? 18.5 : 17;
  const eyeY = 14;

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
        width={mascotW}
        height={mascotH}
        viewBox="0 0 28 26"
        fill="none"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Signal Beacon Wave Pulse from Antenna */}
        <motion.circle
          cx="14"
          cy="2.5"
          r="2.2"
          animate={{ scale: [1, 2.5, 1], opacity: [0.9, 0, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          stroke="var(--nova-cyan)"
          strokeWidth="0.9"
          fill="none"
        />

        {/* Antenna */}
        <line x1="14" y1="6" x2="14" y2="2.5" stroke="var(--nova-blue)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="14" cy="2.5" r="1.6" fill="var(--nova-cyan)" />

        {/* Head Fuselage */}
        <rect x="4" y="6" width="20" height="17" rx="5" fill="#0B132B" stroke="var(--nova-blue)" strokeWidth="1.5" />

        {/* Visor Screen */}
        <rect x="6.5" y="9.5" width="15" height="10.5" rx="3" fill="#1C2541" />

        {/* Visor Cyber Scanline Beam */}
        <motion.line
          x1="7"
          y1="10"
          x2="21"
          y2="10"
          stroke="rgba(56, 189, 248, 0.4)"
          strokeWidth="1"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Focus Headband when Timer is Active (Cheerleader Mode!) */}
        {isTimerRunning && (
          <rect x="4" y="8" width="20" height="2.8" rx="1.4" fill="#EF4444" stroke="#DC2626" strokeWidth="0.8" />
        )}

        {/* Expressive Visor Eyes */}
        {isHappy ? (
          /* Joyful ^ ^ eyes with glowing pink cheeks */
          <>
            <path d="M 8.5,15 Q 10.5,12 12.5,15" stroke="var(--nova-cyan)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <path d="M 15.5,15 Q 17.5,12 19.5,15" stroke="var(--nova-cyan)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <circle cx="8" cy="16.5" r="1.1" fill="#FDA4AF" />
            <circle cx="20" cy="16.5" r="1.1" fill="#FDA4AF" />
          </>
        ) : isBlinking ? (
          /* Blinking Eyelid Lines */
          <>
            <line x1="8.5" y1={eyeY} x2="12" y2={eyeY} stroke="var(--nova-cyan)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="15.5" y1={eyeY} x2="19" y2={eyeY} stroke="var(--nova-cyan)" strokeWidth="1.6" strokeLinecap="round" />
          </>
        ) : isWinking ? (
          /* Wink Expression */
          <>
            <path d="M 8.5,15 Q 10.5,12 12.5,15" stroke="var(--nova-cyan)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <circle cx="17" cy={eyeY} r="1.6" fill="var(--nova-cyan)" />
            <circle cx="17.4" cy={eyeY - 0.4} r="0.5" fill="#FFFFFF" />
          </>
        ) : (
          /* Natural Cyber LED Eyes with Pupil Glint & Looking Direction */
          <>
            <circle cx={leftEyeX} cy={eyeY} r="1.6" fill="var(--nova-cyan)" />
            <circle cx={leftEyeX + 0.4} cy={eyeY - 0.4} r="0.5" fill="#FFFFFF" />
            <circle cx={rightEyeX} cy={eyeY} r="1.6" fill="var(--nova-cyan)" />
            <circle cx={rightEyeX + 0.4} cy={eyeY - 0.4} r="0.5" fill="#FFFFFF" />
          </>
        )}

        {/* Ear Bolts with Subtle Glow */}
        <rect x="1.5" y="11" width="2.5" height="7" rx="1.2" fill="var(--nova-cyan)" />
        <rect x="24" y="11" width="2.5" height="7" rx="1.2" fill="var(--nova-cyan)" />
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
  const [timeWithSeconds, setTimeWithSeconds] = useState<string>('');
  const [dateAndClock, setDateAndClock] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setTimeWithSeconds(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      const day = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      setDateAndClock(`${day} • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
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

  // Format network speeds cleanly
  const netDown = metrics.networkDownloadKbps > 1024
    ? `${(metrics.networkDownloadKbps / 1024).toFixed(1)}M`
    : `${metrics.networkDownloadKbps}K`;
  const netUp = metrics.networkUploadKbps > 1024
    ? `${(metrics.networkUploadKbps / 1024).toFixed(1)}M`
    : `${metrics.networkUploadKbps}K`;

  // 1. Render Center Primary Focus Content
  const renderCenterContent = () => {
    if (isTimerRunning) {
      const displaySec = timerMode === 'stopwatch' ? stopwatchSeconds : secondsRemaining;
      const mins = String(Math.floor(displaySec / 60)).padStart(2, '0');
      const secs = String(displaySec % 60).padStart(2, '0');
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--nova-cyan)', letterSpacing: '0.04em' }}>
          <span>{timerMode === 'stopwatch' ? '⏱️' : '⏳'}</span>
          <span>{`${mins}:${secs}`}</span>
        </div>
      );
    }

    if (pillContentMode === 'media-priority' || (pillContentMode === 'smart-auto' && media.isPlaying)) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
          <Music size={11} style={{ color: 'var(--nova-blue)', flexShrink: 0 }} />
          <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--nova-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {media.title || 'YouTube Media'}
          </span>
        </div>
      );
    }

    if (pillContentMode === 'pomodoro-focus') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '10.5px', fontWeight: 600, color: 'var(--nova-text-primary)' }}>
          <span>🍅</span>
          <span>Focus Time</span>
        </div>
      );
    }

    if (pillContentMode === 'custom') {
      const centerOpt = settings.customPillCenter || 'clock';
      if (centerOpt === 'clock-seconds') {
        return (
          <span style={{ fontSize: isCompact ? '9.5px' : '10.5px', fontWeight: 600, color: 'var(--nova-text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
            {timeWithSeconds}
          </span>
        );
      }
      if (centerOpt === 'date-clock') {
        return (
          <span style={{ fontSize: isCompact ? '9px' : '10px', fontWeight: 600, color: 'var(--nova-text-primary)', fontFamily: 'var(--font-mono)' }}>
            {dateAndClock}
          </span>
        );
      }
      if (centerOpt === 'media-title') {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Music size={11} style={{ color: 'var(--nova-blue)', flexShrink: 0 }} />
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--nova-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {media.title || 'No Media'}
            </span>
          </div>
        );
      }
      if (centerOpt === 'network') {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--nova-cyan)' }}>↓ {netDown}</span>
            <span style={{ color: 'var(--nova-blue)' }}>↑ {netUp}</span>
          </div>
        );
      }
      if (centerOpt === 'weather') {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '10.5px', color: 'var(--nova-text-primary)' }}>
            <Sun size={11} style={{ color: '#FBBF24' }} />
            <span>22°C Clear</span>
          </div>
        );
      }
    }

    // Default for smart-auto, network-speed, telemetry, clock-weather, minimal-zen, crypto-stock, battery-power, dual-net-ping:
    return (
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
    );
  };

  // 2. Render Right Auxiliary Badge Content
  const renderRightContent = () => {
    // 5-bar live micro-audio visualizer
    const visualizer = (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
        <motion.span animate={{ height: ['3px', '11px', '4px'] }} transition={{ duration: 0.65, repeat: Infinity }} style={{ width: 2, backgroundColor: 'var(--nova-cyan)', borderRadius: 1 }} />
        <motion.span animate={{ height: ['9px', '3px', '12px'] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ width: 2, backgroundColor: 'var(--nova-blue)', borderRadius: 1 }} />
        <motion.span animate={{ height: ['4px', '13px', '5px'] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ width: 2, backgroundColor: 'var(--nova-violet)', borderRadius: 1 }} />
        <motion.span animate={{ height: ['11px', '4px', '8px'] }} transition={{ duration: 0.55, repeat: Infinity }} style={{ width: 2, backgroundColor: 'var(--nova-cyan)', borderRadius: 1 }} />
        <motion.span animate={{ height: ['4px', '9px', '3px'] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ width: 2, backgroundColor: 'var(--nova-blue)', borderRadius: 1 }} />
      </div>
    );

    // If media is playing and mode is smart-auto or media-priority:
    if (media.isPlaying && (pillContentMode === 'smart-auto' || pillContentMode === 'media-priority')) {
      return visualizer;
    }

    // Dedicated Network Speed Mode - Clean & Dedicated, NO CPU/RAM OVERLAY!
    if (pillContentMode === 'network-speed') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '9.5px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--nova-cyan)', display: 'flex', alignItems: 'center', gap: 2, fontWeight: 600 }}>
            ↓ {netDown}
          </span>
          <span style={{ color: 'var(--nova-blue)', display: 'flex', alignItems: 'center', gap: 2, fontWeight: 600 }}>
            ↑ {netUp}
          </span>
        </div>
      );
    }

    if (pillContentMode === 'clock-weather') {
      return (
        <span style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Sun size={11} style={{ color: '#FBBF24' }} />
          <span>22°C</span>
        </span>
      );
    }

    if (pillContentMode === 'crypto-stock') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '9.5px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#F59E0B', fontWeight: 600 }}>₿ 89.4K</span>
          <span style={{ color: 'var(--nova-success)', fontSize: '8.5px' }}>+3.2%</span>
        </div>
      );
    }

    if (pillContentMode === 'pomodoro-focus') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '9.5px', color: 'var(--nova-warning)' }}>
          <Flame size={11} style={{ color: '#EF4444' }} />
          <span style={{ fontWeight: 600 }}>Streak: 3</span>
        </div>
      );
    }

    if (pillContentMode === 'battery-power') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--nova-cyan)' }}>
          <Zap size={10} style={{ color: 'var(--nova-cyan)' }} />
          <span>94%</span>
        </div>
      );
    }

    if (pillContentMode === 'dual-net-ping') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '9.5px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--nova-cyan)' }}>↓ {netDown}</span>
          <span style={{ color: 'var(--nova-success)', fontSize: '8.5px' }}>18ms</span>
        </div>
      );
    }

    if (pillContentMode === 'minimal-zen') {
      return (
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'var(--nova-cyan)',
            boxShadow: '0 0 6px var(--nova-cyan)',
          }}
        />
      );
    }

    if (pillContentMode === 'custom') {
      const rightOpt = settings.customPillRight || 'telemetry';
      if (rightOpt === 'network') {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '9.5px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--nova-cyan)' }}>↓ {netDown}</span>
            <span style={{ color: 'var(--nova-blue)' }}>↑ {netUp}</span>
          </div>
        );
      }
      if (rightOpt === 'weather') {
        return (
          <span style={{ fontSize: '10px', color: 'var(--nova-text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Sun size={11} style={{ color: '#FBBF24' }} /> 22°C
          </span>
        );
      }
      if (rightOpt === 'visualizer') return visualizer;
      if (rightOpt === 'battery') {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--nova-cyan)' }}>
            <Battery size={11} style={{ color: 'var(--nova-cyan)' }} />
            <span>92%</span>
          </div>
        );
      }
      if (rightOpt === 'status-dot') {
        return (
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--nova-cyan)', boxShadow: '0 0 6px var(--nova-cyan)' }} />
        );
      }
      if (rightOpt === 'none') return null;
    }

    // Default Telemetry (for telemetry, smart-auto when not playing, etc.):
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: '9.5px',
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
      </div>
    );
  };

  // True Twin-Pod Split Capsule architecture
  if (isSplitCapsule) {
    const borderGlow = Math.max(0.05, ((settings.glassmorphismBorderGlow ?? 35) / 100) * 0.45);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: '100%' }}>
        {/* Left Pod: ALWAYS CONTINUOUS MASCOT POD */}
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
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderCenterContent()}
          </div>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            {renderRightContent()}
          </div>
        </div>
      </div>
    );
  }

  // Master Single Capsule Layout: 3-Zone Flex Grid (Collision-Proof)
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: isCompact ? '0 8px' : '0 12px',
        gap: 6,
        boxSizing: 'border-box',
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

      {/* ZONE 1 (LEFT): The Mascot is ALWAYS CONTINUOUSLY PRESENT in ALL MODES! */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', zIndex: 3, flexShrink: 0, lineHeight: 1 }}>
        <IslandBrandMascot isCompact={isCompact} type={settings.pillBrandBadge || 'robot'} isTimerRunning={isTimerRunning} />
      </div>

      {/* ZONE 2 (CENTER): Dedicated Focus Slot (Clock / Track / Timer / Custom) - CAN NEVER OVERLAP RIGHT! */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          zIndex: 2,
          lineHeight: 1,
          padding: '0 4px',
        }}
      >
        {renderCenterContent()}
      </div>

      {/* ZONE 3 (RIGHT): Contextual Telemetry, Equalizer, Network Speed, or Custom Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, zIndex: 3, flexShrink: 0, lineHeight: 1 }}>
        {renderRightContent()}
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
