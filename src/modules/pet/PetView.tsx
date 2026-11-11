import React, { useState, useEffect } from 'react';
import {
  Smile,
  Heart,
  Sparkles,
  Fish,
  Moon,
  Flame,
  Zap,
  Award,
  Gamepad2,
  Apple,
  Coffee,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../stores/useThemeStore';
import { playSound, playPetSound } from '../../services/soundService';
import { PillBrandBadge } from '../../types';

type PetMood = 'happy' | 'vibing' | 'focused' | 'sleepy' | 'eating' | 'playing';

interface PetData {
  companion: PillBrandBadge;
  name: string;
  mood: PetMood;
  pats: number;
  happiness: number;
  hunger: number;
  energy: number;
  xp: number;
  level: number;
}

const STORAGE_KEY = 'nova_pet_data_v3';

interface CompanionMeta {
  id: PillBrandBadge;
  name: string;
  title: string;
  emoji: string;
  favoriteSnack: string;
  snackEmoji: string;
  quotes: {
    happy: string;
    vibing: string;
    focused: string;
    sleepy: string;
    playing: string;
  };
}

const COMPANIONS: CompanionMeta[] = [
  {
    id: 'robot',
    name: 'Astro',
    title: 'Cybernetic Mini-Bot',
    emoji: '🤖',
    favoriteSnack: 'Star Battery',
    snackEmoji: '⚡',
    quotes: {
      happy: 'All optical sensors at 100%! Thank you for the diagnostic love!',
      vibing: 'Computing optimal desktop workflow algorithms... ♫',
      focused: 'Laser focus subroutine initialized. Let us achieve zero bugs!',
      sleepy: 'Entering low-power sleep mode... zzZ 01000001...',
      playing: 'BEEP BOOP! Laser chase calculations verified at 99.9%!',
    },
  },
  {
    id: 'cat',
    name: 'Mochi',
    title: 'Calico Desktop Kitten',
    emoji: '🐱',
    favoriteSnack: 'Fresh Salmon',
    snackEmoji: '🐟',
    quotes: {
      happy: 'Purrr... warmest spot on your screen! Scratches make me purr!',
      vibing: 'Happily kneading invisible biscuits on your taskbar ♫',
      focused: 'Sitting quietly next to your code so you stay productive!',
      sleepy: 'Curled up right on your bezel for a cozy catnap... zzZ',
      playing: 'Pounce! Paw attack on the laser dot!',
    },
  },
  {
    id: 'fox',
    name: 'Kitsune',
    title: 'Mystic Spirit Fox',
    emoji: '🦊',
    favoriteSnack: 'Sweet Berry',
    snackEmoji: '🍇',
    quotes: {
      happy: 'May good fortune and clean code bless your journey today!',
      vibing: 'My twin tails sway with the digital auroras above ♫',
      focused: 'Ancient wisdom whispers: take it one function at a time.',
      sleepy: 'Curled under my warm bushy tails... resting my magic... zzZ',
      playing: 'Leaping through spirit fire portals! Catch me if you can!',
    },
  },
  {
    id: 'dragon',
    name: 'Draco',
    title: 'Legendary Ember Drake',
    emoji: '🐲',
    favoriteSnack: 'Volcano Pepper',
    snackEmoji: '🌶️',
    quotes: {
      happy: 'A tiny puff of warm flame! We are unstoppable together!',
      vibing: 'Hovering on tiny wings, guarding your precious files ♫',
      focused: 'Nothing can defeat our combined firepower on this project!',
      sleepy: 'Resting on a pile of glowing warm embers... zzZ',
      playing: 'Flapping my mini wings doing barrel rolls in the air!',
    },
  },
  {
    id: 'panda',
    name: 'Bao',
    title: 'Zen Bamboo Panda',
    emoji: '🐼',
    favoriteSnack: 'Crisp Bamboo',
    snackEmoji: '🎋',
    quotes: {
      happy: 'Crunch crunch! Nothing brings joy like good food and your company!',
      vibing: 'Peaceful minds create brilliant things. Taking it chill ♫',
      focused: 'Breathe in... breathe out... focus on this one goal.',
      sleepy: 'Fell asleep clutching my favorite bamboo stalk... zzZ',
      playing: 'Somersaulting across your screen! Rolling is so much fun!',
    },
  },
  {
    id: 'penguin',
    name: 'Pippin',
    title: 'Arctic Frost Penguin',
    emoji: '🐧',
    favoriteSnack: 'Silver Sardine',
    snackEmoji: '🐟',
    quotes: {
      happy: 'Flapping flippers with joy! Keeping your CPU ice cold!',
      vibing: 'Waddling to the beat of your keystrokes ♫',
      focused: 'Goggles down! Diving deep into the data ocean!',
      sleepy: 'Tucked inside my warm red knitted scarf... zzZ',
      playing: 'Belly-sliding across your status bar at high speed!',
    },
  },
  {
    id: 'ghost',
    name: 'Spooky',
    title: 'Guardian Phantom',
    emoji: '👻',
    favoriteSnack: 'Spirit Candy',
    snackEmoji: '🍬',
    quotes: {
      happy: 'Boo! Hehe, didn\'t scare you? You\'re my favorite mortal!',
      vibing: 'Phasing through windows and hovering weightlessly ♫',
      focused: 'I will haunt all runtime errors away from your code!',
      sleepy: 'Floating into the ethereal dream realm... zzZ',
      playing: 'Playing hide and seek between your open apps!',
    },
  },
  {
    id: 'owl',
    name: 'Hoot',
    title: 'Sage Night Watcher',
    emoji: '🦉',
    favoriteSnack: 'Golden Acorn',
    snackEmoji: '🌰',
    quotes: {
      happy: 'Whoo-whoo! Your curiosity and diligence inspire me!',
      vibing: 'Observing the cosmos from my wooden perch ♫',
      focused: 'Patience and deep study unlock all technological secrets.',
      sleepy: 'Closing my large amber eyes under the starry sky... zzZ',
      playing: 'Spreading wide wings and swooping silently in circles!',
    },
  },
  {
    id: 'quantum',
    name: 'Quantum',
    title: 'Gyroscopic Singularity',
    emoji: '⚡',
    favoriteSnack: 'Photon Core',
    snackEmoji: '⭐',
    quotes: {
      happy: 'Resonance coherence locked at 100%! Gravitational happiness maxed!',
      vibing: 'Orbital energy rings spinning in perfect harmony ♫',
      focused: 'Compressing complexity. Maximum computational throughput!',
      sleepy: 'Damping core frequency to background cosmic radiation... zzZ',
      playing: 'Accelerating electrons in high-speed harmonic orbits!',
    },
  },
  {
    id: 'pixel-alien',
    name: 'Byte',
    title: '8-Bit Arcade Invader',
    emoji: '👾',
    favoriteSnack: 'Power Pellet',
    snackEmoji: '🍒',
    quotes: {
      happy: '1-UP! High score recorded in the desktop hall of fame!',
      vibing: 'Chiptune arpeggios pulsing through the silicon bus ♫',
      focused: 'LEVEL BOSS DETECTED. Executing perfect combo attack!',
      sleepy: 'GAME PAUSED. Entering energy conservation state... zzZ',
      playing: 'Zig-zagging across the grid dodging pixel asteroids!',
    },
  },
];

export const PetView: React.FC = () => {
  const { settings, updateSettings } = useThemeStore();

  const [petData, setPetData] = useState<PetData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      companion: (settings.pillBrandBadge && settings.pillBrandBadge !== 'text' ? settings.pillBrandBadge : 'robot') as PillBrandBadge,
      name: 'Astro',
      mood: 'vibing',
      pats: 12,
      happiness: 90,
      hunger: 85,
      energy: 95,
      xp: 140,
      level: 3,
    };
  });

  const [activeHeart, setActiveHeart] = useState<boolean>(false);
  const [activeSnackAnim, setActiveSnackAnim] = useState<string | null>(null);
  const [activePlayAnim, setActivePlayAnim] = useState<boolean>(false);
  const [levelUpBurst, setLevelUpBurst] = useState<boolean>(false);

  // Sync companion with settings badge if user selected one in RGB studio
  useEffect(() => {
    if (settings.pillBrandBadge && settings.pillBrandBadge !== 'text' && settings.pillBrandBadge !== petData.companion) {
      const meta = COMPANIONS.find((c) => c.id === settings.pillBrandBadge);
      if (meta) {
        setPetData((prev) => ({
          ...prev,
          companion: meta.id,
          name: meta.name,
        }));
      }
    }
  }, [settings.pillBrandBadge]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(petData));
    } catch (e) {}
  }, [petData]);

  // Current active companion metadata
  const currentCompanion = COMPANIONS.find((c) => c.id === petData.companion) || COMPANIONS[0];

  // XP & Level calculations: 100 XP per level
  const xpNeeded = petData.level * 100;
  const xpPercent = Math.min(100, Math.round((petData.xp / xpNeeded) * 100));

  const addXp = (amount: number) => {
    setPetData((prev) => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      const target = newLevel * 100;

      if (newXp >= target) {
        newXp -= target;
        newLevel += 1;
        setLevelUpBurst(true);
        setTimeout(() => setLevelUpBurst(false), 2000);
        playSound('action');
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
      };
    });
  };

  const handlePet = () => {
    playPetSound();
    setActiveHeart(true);
    setTimeout(() => setActiveHeart(false), 900);

    setPetData((prev) => ({
      ...prev,
      pats: prev.pats + 1,
      happiness: Math.min(100, prev.happiness + 6),
      mood: 'happy',
    }));
    addXp(12);
  };

  const handleFeed = (snackEmoji: string, snackName: string, hungerBoost: number, xpBoost: number) => {
    playSound('action');
    setActiveSnackAnim(snackEmoji);
    setTimeout(() => setActiveSnackAnim(null), 1200);

    setPetData((prev) => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + hungerBoost),
      happiness: Math.min(100, prev.happiness + 8),
      mood: 'eating',
    }));
    addXp(xpBoost);

    setTimeout(() => {
      setPetData((prev) => ({ ...prev, mood: 'happy' }));
    }, 1500);
  };

  const handlePlayMiniGame = () => {
    playSound('action');
    setActivePlayAnim(true);
    setPetData((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 18),
      hunger: Math.max(10, prev.hunger - 8),
      energy: Math.max(10, prev.energy - 12),
      mood: 'playing',
    }));
    addXp(35);

    setTimeout(() => {
      setActivePlayAnim(false);
      setPetData((prev) => ({ ...prev, mood: 'happy' }));
    }, 2200);
  };

  const toggleNap = () => {
    playSound('action');
    setPetData((prev) => {
      const isSleeping = prev.mood === 'sleepy';
      return {
        ...prev,
        mood: isSleeping ? 'vibing' : 'sleepy',
        energy: isSleeping ? prev.energy : Math.min(100, prev.energy + 25),
      };
    });
  };

  const selectCompanion = (comp: CompanionMeta) => {
    playSound('action');
    setPetData((prev) => ({
      ...prev,
      companion: comp.id,
      name: comp.name,
      mood: 'happy',
    }));
    // Sync to notch pill badge as well
    updateSettings({ pillBrandBadge: comp.id });
  };

  const getSpeechText = () => {
    const quotes = currentCompanion.quotes;
    if (petData.mood === 'sleepy') return `"${quotes.sleepy}"`;
    if (petData.mood === 'playing') return `"${quotes.playing}"`;
    if (petData.mood === 'eating') return `"${currentCompanion.name} munches on tasty treats! Yummy!"`;
    if (petData.mood === 'focused') return `"${quotes.focused}"`;
    if (petData.mood === 'happy') return `"${quotes.happy}"`;
    return `"${quotes.vibing}"`;
  };

  // High-fidelity SVG renderers for each companion
  const renderCompanionSvg = () => {
    const isSleeping = petData.mood === 'sleepy';
    const isPlaying = petData.mood === 'playing';

    if (petData.companion === 'robot') {
      return (
        <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
          {/* Antenna with pulsing orb */}
          <line x1="50" y1="20" x2="50" y2="8" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="7" r="4.5" fill="#38BDF8" />
          {/* Robot Head */}
          <rect x="22" y="20" width="56" height="42" rx="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="2.2" />
          {/* Visor Screen */}
          <rect x="28" y="27" width="44" height="24" rx="8" fill="#1E293B" />
          {/* Eyes / Visor Display */}
          {isSleeping ? (
            <>
              <line x1="34" y1="39" x2="44" y2="39" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="56" y1="39" x2="66" y2="39" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : isPlaying ? (
            <>
              <circle cx="39" cy="38" r="4.5" fill="#34D399" />
              <circle cx="61" cy="38" r="4.5" fill="#34D399" />
              <path d="M46 44 Q50 47 54 44" stroke="#34D399" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="39" cy="39" r="4" fill="#38BDF8" />
              <circle cx="40.5" cy="37.5" r="1.5" fill="#FFFFFF" />
              <circle cx="61" cy="39" r="4" fill="#38BDF8" />
              <circle cx="62.5" cy="37.5" r="1.5" fill="#FFFFFF" />
              <line x1="47" y1="44" x2="53" y2="44" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
            </>
          )}
          {/* Side Audio Earmuffs */}
          <rect x="16" y="32" width="6" height="18" rx="3" fill="#38BDF8" />
          <rect x="78" y="32" width="6" height="18" rx="3" fill="#38BDF8" />
          {/* Cute Body & Collar */}
          <path d="M35 62 L65 62 L70 82 L30 82 Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.8" />
          <circle cx="50" cy="72" r="3.5" fill="#38BDF8" />
        </svg>
      );
    }

    if (petData.companion === 'cat') {
      return (
        <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
          {/* Cat Ears */}
          <polygon points="20,34 12,8 38,24" fill="#F472B6" />
          <polygon points="22,31 16,14 34,24" fill="#FCE7F3" />
          <polygon points="80,34 88,8 62,24" fill="#F472B6" />
          <polygon points="78,31 84,14 66,24" fill="#FCE7F3" />
          {/* Head */}
          <ellipse cx="50" cy="48" rx="38" ry="30" fill="#FFF1F2" stroke="#F472B6" strokeWidth="2.5" />
          {/* Cheeks */}
          <circle cx="27" cy="56" r="6" fill="#FDA4AF" opacity="0.8" />
          <circle cx="73" cy="56" r="6" fill="#FDA4AF" opacity="0.8" />
          {/* Eyes */}
          {isSleeping ? (
            <>
              <path d="M28 47 Q36 53 44 47" stroke="#9F1239" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M56 47 Q64 53 72 47" stroke="#9F1239" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="36" cy="46" r="6" fill="#881337" />
              <circle cx="38" cy="43.5" r="2.2" fill="#FFFFFF" />
              <circle cx="64" cy="46" r="6" fill="#881337" />
              <circle cx="66" cy="43.5" r="2.2" fill="#FFFFFF" />
            </>
          )}
          {/* Nose & Mouth */}
          <polygon points="50,53 47,50 53,50" fill="#F43F5E" />
          <path d="M47 55 Q50 58 53 55" stroke="#881337" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Whiskers */}
          <line x1="14" y1="49" x2="25" y2="51" stroke="#F472B6" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="14" y1="56" x2="25" y2="56" stroke="#F472B6" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="86" y1="49" x2="75" y2="51" stroke="#F472B6" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="86" y1="56" x2="75" y2="56" stroke="#F472B6" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    if (petData.companion === 'fox') {
      return (
        <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
          {/* Fox Ears with Black Tips */}
          <polygon points="16,36 8,8 36,24" fill="#EA580C" />
          <polygon points="8,8 16,16 22,14" fill="#0F172A" />
          <polygon points="20,32 16,18 32,25" fill="#FFEDD5" />
          <polygon points="84,36 92,8 64,24" fill="#EA580C" />
          <polygon points="92,8 84,16 78,14" fill="#0F172A" />
          <polygon points="80,32 84,18 68,25" fill="#FFEDD5" />
          {/* Head */}
          <ellipse cx="50" cy="50" rx="38" ry="30" fill="#F97316" stroke="#C2410C" strokeWidth="2.2" />
          {/* White Mask */}
          <path d="M20 52 Q35 70 50 68 Q65 70 80 52 Q50 56 20 52 Z" fill="#FFF7ED" />
          {/* Eyes */}
          {isSleeping ? (
            <>
              <path d="M28 47 Q37 53 45 47" stroke="#7C2D12" strokeWidth="2.6" strokeLinecap="round" fill="none" />
              <path d="M55 47 Q63 53 72 47" stroke="#7C2D12" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="37" cy="46" rx="4.5" ry="5.5" fill="#431407" />
              <circle cx="38.5" cy="44" r="1.8" fill="#FFFFFF" />
              <ellipse cx="63" cy="46" rx="4.5" ry="5.5" fill="#431407" />
              <circle cx="64.5" cy="44" r="1.8" fill="#FFFFFF" />
            </>
          )}
          <ellipse cx="50" cy="60" rx="4" ry="2.8" fill="#0F172A" />
        </svg>
      );
    }

    if (petData.companion === 'dragon') {
      return (
        <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
          {/* Amber Horns */}
          <path d="M30 26 Q24 6 12 12 Q20 22 28 28 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          <path d="M70 26 Q76 6 88 12 Q80 22 72 28 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          {/* Wings */}
          <path d="M12 40 Q4 24 16 28 Q18 42 24 50 Z" fill="#059669" />
          <path d="M88 40 Q96 24 84 28 Q82 42 76 50 Z" fill="#059669" />
          {/* Head */}
          <ellipse cx="50" cy="50" rx="36" ry="28" fill="#10B981" stroke="#047857" strokeWidth="2.2" />
          {/* Scales Crest */}
          <polygon points="50,18 45,26 55,26" fill="#059669" />
          {/* Amber Eyes */}
          {isSleeping ? (
            <>
              <path d="M30 48 Q38 54 46 48" stroke="#064E3B" strokeWidth="2.6" strokeLinecap="round" fill="none" />
              <path d="M54 48 Q62 54 70 48" stroke="#064E3B" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="38" cy="47" r="5.5" fill="#F59E0B" />
              <circle cx="38" cy="47" r="2.2" fill="#78350F" />
              <circle cx="62" cy="47" r="5.5" fill="#F59E0B" />
              <circle cx="62" cy="47" r="2.2" fill="#78350F" />
            </>
          )}
          {/* Nostrils & Friendly Smoke Wisp */}
          <circle cx="44" cy="58" r="2" fill="#065F46" />
          <circle cx="56" cy="58" r="2" fill="#065F46" />
          {isPlaying && (
            <path d="M48 62 Q50 67 52 62" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" fill="none" />
          )}
        </svg>
      );
    }

    if (petData.companion === 'panda') {
      return (
        <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
          {/* Black Ears */}
          <circle cx="22" cy="24" r="13" fill="#1E293B" />
          <circle cx="78" cy="24" r="13" fill="#1E293B" />
          {/* White Head */}
          <ellipse cx="50" cy="50" rx="38" ry="31" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
          {/* Black Eye Patches */}
          <ellipse cx="34" cy="47" rx="10" ry="12" fill="#1E293B" transform="rotate(-15 34 47)" />
          <ellipse cx="66" cy="47" rx="10" ry="12" fill="#1E293B" transform="rotate(15 66 47)" />
          {/* Eyes */}
          {isSleeping ? (
            <>
              <path d="M28 47 Q34 51 40 47" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M60 47 Q66 51 72 47" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="34" cy="47" r="3.8" fill="#FFFFFF" />
              <circle cx="35" cy="46" r="1.5" fill="#000000" />
              <circle cx="66" cy="47" r="3.8" fill="#FFFFFF" />
              <circle cx="67" cy="46" r="1.5" fill="#000000" />
            </>
          )}
          {/* Nose & Mouth */}
          <ellipse cx="50" cy="57" rx="4.5" ry="3" fill="#0F172A" />
          <path d="M46 62 Q50 65 54 62" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Bamboo Stalk in Mouth */}
          <line x1="53" y1="62" x2="68" y2="70" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    }

    if (petData.companion === 'penguin') {
      return (
        <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
          {/* Body */}
          <ellipse cx="50" cy="48" rx="36" ry="32" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          {/* White Chest Face */}
          <ellipse cx="50" cy="50" rx="24" ry="24" fill="#FFFFFF" />
          {/* Eyes */}
          {isSleeping ? (
            <>
              <path d="M38 43 Q43 47 48 43" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M52 43 Q57 47 62 43" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="42" cy="42" r="4.2" fill="#0F172A" />
              <circle cx="43.5" cy="40.5" r="1.5" fill="#FFFFFF" />
              <circle cx="58" cy="42" r="4.2" fill="#0F172A" />
              <circle cx="59.5" cy="40.5" r="1.5" fill="#FFFFFF" />
            </>
          )}
          {/* Orange Beak */}
          <polygon points="50,47 44,52 56,52" fill="#F97316" />
          {/* Cozy Knitted Red Scarf */}
          <path d="M28 66 Q50 74 72 66 L74 74 Q50 82 26 74 Z" fill="#EF4444" />
          <rect x="62" y="70" width="10" height="15" rx="3" fill="#DC2626" />
        </svg>
      );
    }

    if (petData.companion === 'ghost') {
      return (
        <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
          {/* Phantom Body */}
          <path
            d="M24 50 C24 24 76 24 76 50 C76 72 70 78 64 74 C58 70 54 78 50 74 C46 70 42 78 36 74 C30 70 24 76 24 50 Z"
            fill="#EDE9FE"
            stroke="#A78BFA"
            strokeWidth="2.2"
            opacity="0.95"
          />
          {/* Cheeks */}
          <circle cx="34" cy="54" r="5" fill="#F472B6" opacity="0.6" />
          <circle cx="66" cy="54" r="5" fill="#F472B6" opacity="0.6" />
          {/* Eyes */}
          {isSleeping ? (
            <>
              <path d="M34 44 Q40 48 46 44" stroke="#5B21B6" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M54 44 Q60 48 66 44" stroke="#5B21B6" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="40" cy="43" rx="4.5" ry="5.5" fill="#4C1D95" />
              <circle cx="41.5" cy="41" r="1.8" fill="#FFFFFF" />
              <ellipse cx="60" cy="43" rx="4.5" ry="5.5" fill="#4C1D95" />
              <circle cx="61.5" cy="41" r="1.8" fill="#FFFFFF" />
              {/* Cute O Mouth */}
              <ellipse cx="50" cy="52" rx="3.5" ry="4.5" fill="#6D28D9" />
            </>
          )}
        </svg>
      );
    }

    if (petData.companion === 'owl') {
      return (
        <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
          {/* Feather Ear Tufts */}
          <polygon points="26,30 20,10 40,24" fill="#78350F" />
          <polygon points="74,30 80,10 60,24" fill="#78350F" />
          {/* Head & Body */}
          <ellipse cx="50" cy="50" rx="36" ry="30" fill="#92400E" stroke="#78350F" strokeWidth="2.2" />
          {/* Large Amber Eye Discs */}
          <circle cx="36" cy="46" r="13" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.8" />
          <circle cx="64" cy="46" r="13" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.8" />
          {isSleeping ? (
            <>
              <path d="M28 46 Q36 51 44 46" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M56 46 Q64 51 72 46" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="36" cy="46" r="6" fill="#451A03" />
              <circle cx="38" cy="44" r="2" fill="#FFFFFF" />
              <circle cx="64" cy="46" r="6" fill="#451A03" />
              <circle cx="66" cy="44" r="2" fill="#FFFFFF" />
            </>
          )}
          {/* Beak */}
          <polygon points="50,48 45,55 55,55" fill="#F59E0B" />
        </svg>
      );
    }

    if (petData.companion === 'quantum') {
      return (
        <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
          {/* Orbit Ring 1 */}
          <ellipse cx="50" cy="45" rx="38" ry="16" stroke="#38BDF8" strokeWidth="2" transform="rotate(-25 50 45)" strokeDasharray="6 3" />
          {/* Orbit Ring 2 */}
          <ellipse cx="50" cy="45" rx="38" ry="16" stroke="#818CF8" strokeWidth="2" transform="rotate(35 50 45)" strokeDasharray="6 3" />
          {/* Core Energy Singularity */}
          <circle cx="50" cy="45" r="16" fill="#0284C7" stroke="#38BDF8" strokeWidth="2.5" />
          <circle cx="50" cy="45" r="10" fill="#E0F2FE" />
          {/* Quantum Face */}
          <circle cx="45" cy="43" r="2" fill="#0369A1" />
          <circle cx="55" cy="43" r="2" fill="#0369A1" />
          <path d="M47 48 Q50 51 53 48" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      );
    }

    // Default Pixel Byte
    return (
      <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
        {/* 8-bit Invader Grid */}
        <rect x="36" y="16" width="28" height="6" fill="#4ADE80" />
        <rect x="24" y="22" width="52" height="6" fill="#4ADE80" />
        <rect x="18" y="28" width="64" height="18" fill="#4ADE80" />
        {/* Pixel Eyes */}
        <rect x="30" y="32" width="8" height="8" fill="#0F172A" />
        <rect x="62" y="32" width="8" height="8" fill="#0F172A" />
        {isSleeping ? (
          <>
            <rect x="30" y="36" width="8" height="3" fill="#22C55E" />
            <rect x="62" y="36" width="8" height="3" fill="#22C55E" />
          </>
        ) : (
          <>
            <rect x="34" y="34" width="3" height="3" fill="#FFFFFF" />
            <rect x="66" y="34" width="3" height="3" fill="#FFFFFF" />
          </>
        )}
        <rect x="24" y="46" width="52" height="12" fill="#4ADE80" />
        <rect x="18" y="58" width="12" height="12" fill="#4ADE80" />
        <rect x="70" y="58" width="12" height="12" fill="#4ADE80" />
        <rect x="36" y="58" width="28" height="6" fill="#4ADE80" />
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, height: 350, overflowY: 'auto', paddingRight: 4 }}>
      {/* Top Header: Companion Selector Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Smile size={13} style={{ color: 'var(--nova-warning)' }} />
          <span>DESKTOP COMPANION PET</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '10px', color: 'var(--nova-cyan)', fontWeight: 700 }}>
            <Award size={12} />
            <span>LVL {petData.level}</span>
          </div>
          <span style={{ fontSize: '9px', color: 'var(--nova-text-muted)' }}>({petData.xp}/{xpNeeded} XP)</span>
        </div>
      </div>

      {/* Companion Horizontal Switcher */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          overflowX: 'auto',
          width: '100%',
          paddingBottom: 2,
          scrollbarWidth: 'none',
        }}
      >
        {COMPANIONS.map((comp) => {
          const isSelected = petData.companion === comp.id;
          return (
            <button
              key={comp.id}
              onClick={() => selectCompanion(comp)}
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: 'var(--nova-radius-pill)',
                backgroundColor: isSelected ? 'var(--nova-blue)' : 'var(--nova-surface)',
                color: isSelected ? '#fff' : 'var(--nova-text-secondary)',
                border: isSelected ? '1px solid var(--nova-cyan)' : '1px solid var(--nova-border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              <span>{comp.emoji}</span>
              <span>{comp.name}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Mascot Pod */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={handlePet}
          animate={{
            y: petData.mood === 'sleepy' ? [0, 2, 0] : activePlayAnim ? [-8, 8, -8] : [0, -6, 0],
            rotate: activePlayAnim ? [-4, 4, -4] : 0,
          }}
          transition={{
            duration: petData.mood === 'sleepy' ? 3.5 : activePlayAnim ? 0.35 : 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: 155,
            height: 110,
            backgroundColor: 'var(--nova-surface)',
            border: '1.5px solid var(--nova-border)',
            borderRadius: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            position: 'relative',
          }}
        >
          {renderCompanionSvg()}

          {/* Floating Pat Heart Animation */}
          <AnimatePresence>
            {activeHeart && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -45, scale: 1.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  position: 'absolute',
                  top: 10,
                  fontSize: '26px',
                  pointerEvents: 'none',
                }}
              >
                💕
              </motion.div>
            )}
          </AnimatePresence>

          {/* Food/Toy Treat Animation */}
          <AnimatePresence>
            {activeSnackAnim && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1.4, y: -25 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.9 }}
                style={{
                  position: 'absolute',
                  fontSize: '32px',
                  pointerEvents: 'none',
                }}
              >
                {activeSnackAnim}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level Up Confetti Burst */}
          <AnimatePresence>
            {levelUpBurst && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -10 }}
                animate={{ opacity: 1, scale: 1.2, y: -40 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#FBBF24',
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  padding: '3px 8px',
                  borderRadius: 12,
                  border: '1px solid #F59E0B',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                ⭐ LEVEL UP! LVL {petData.level} ⭐
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Sleep Bubbles */}
          {petData.mood === 'sleepy' && (
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], y: [-2, -16, -2] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: 4,
                right: 14,
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--nova-cyan)',
              }}
            >
              zzZ
            </motion.div>
          )}
        </motion.div>

        {/* Speech Bubble / Personality Status */}
        <div
          style={{
            fontSize: '10.5px',
            color: 'var(--nova-text-secondary)',
            textAlign: 'center',
            marginTop: 6,
            maxWidth: 340,
            lineHeight: 1.35,
            minHeight: 28,
          }}
        >
          {getSpeechText()}
        </div>
      </div>

      {/* Pet Status Meters (Happiness, Hunger, Energy, XP) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 360 }}>
        {/* Happiness */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--nova-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Heart size={10} style={{ color: '#F43F5E' }} /> Happiness
            </span>
            <span style={{ fontWeight: 600 }}>{petData.happiness}%</span>
          </div>
          <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${petData.happiness}%`, backgroundColor: '#F43F5E', borderRadius: 2 }} />
          </div>
        </div>

        {/* Fullness (Hunger) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--nova-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Fish size={10} style={{ color: 'var(--nova-cyan)' }} /> Fullness
            </span>
            <span style={{ fontWeight: 600 }}>{petData.hunger}%</span>
          </div>
          <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${petData.hunger}%`, backgroundColor: 'var(--nova-cyan)', borderRadius: 2 }} />
          </div>
        </div>

        {/* Energy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--nova-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Zap size={10} style={{ color: '#FBBF24' }} /> Energy
            </span>
            <span style={{ fontWeight: 600 }}>{petData.energy}%</span>
          </div>
          <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${petData.energy}%`, backgroundColor: '#FBBF24', borderRadius: 2 }} />
          </div>
        </div>

        {/* Level XP Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--nova-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Award size={10} style={{ color: '#A78BFA' }} /> Level Progress
            </span>
            <span style={{ fontWeight: 600 }}>{xpPercent}%</span>
          </div>
          <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${xpPercent}%`, backgroundColor: '#A78BFA', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* Interactive Action Controls */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handlePet}
          style={{
            padding: '5px 10px',
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--nova-radius-pill)',
            color: '#FDA4AF',
            fontSize: '11px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
        >
          <Heart size={12} />
          <span>Pet ({petData.pats})</span>
        </button>

        {/* Favorite Snack */}
        <button
          onClick={() => handleFeed(currentCompanion.snackEmoji, currentCompanion.favoriteSnack, 20, 15)}
          style={{
            padding: '5px 10px',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 'var(--nova-radius-pill)',
            color: 'var(--nova-cyan)',
            fontSize: '11px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
        >
          <span>{currentCompanion.snackEmoji}</span>
          <span>Feed {currentCompanion.favoriteSnack}</span>
        </button>

        {/* Mini Game Action */}
        <button
          onClick={handlePlayMiniGame}
          style={{
            padding: '5px 10px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--nova-radius-pill)',
            color: 'var(--nova-warning)',
            fontSize: '11px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
        >
          <Gamepad2 size={12} />
          <span>Laser Play 🎾</span>
        </button>

        {/* Nap / Sleep */}
        <button
          onClick={toggleNap}
          style={{
            padding: '5px 10px',
            backgroundColor: petData.mood === 'sleepy' ? 'var(--nova-blue)' : 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 'var(--nova-radius-pill)',
            color: petData.mood === 'sleepy' ? '#fff' : 'var(--nova-text-secondary)',
            fontSize: '11px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
        >
          <Moon size={12} />
          <span>{petData.mood === 'sleepy' ? 'Wake Up' : 'Rest Nap'}</span>
        </button>
      </div>

      {/* Sync with Notch Pill Button */}
      <button
        onClick={() => {
          updateSettings({ pillBrandBadge: petData.companion });
          playSound('action');
        }}
        style={{
          fontSize: '9.5px',
          color: settings.pillBrandBadge === petData.companion ? 'var(--nova-cyan)' : 'var(--nova-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 8px',
        }}
      >
        <Check size={11} />
        <span>
          {settings.pillBrandBadge === petData.companion
            ? `Active on Notch Bezel (${currentCompanion.name})`
            : `Set ${currentCompanion.name} as Notch Bezel Mascot`}
        </span>
      </button>
    </div>
  );
};
