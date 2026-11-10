import React, { useState, useEffect } from 'react';
import {
  Smile,
  Heart,
  Sparkles,
  Coffee,
  Fish,
  Moon,
  Sun,
  Flame,
  Volume2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type PetSpecies = 'cat' | 'dog' | 'bunny' | 'fox';
type PetMood = 'happy' | 'vibing' | 'focused' | 'sleepy';

interface PetData {
  species: PetSpecies;
  name: string;
  mood: PetMood;
  pats: number;
  happiness: number;
  hunger: number;
}

const STORAGE_KEY = 'nova_pet_data_v2';

export const PetView: React.FC = () => {
  const [petData, setPetData] = useState<PetData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      species: 'cat',
      name: 'Mochi',
      mood: 'vibing',
      pats: 0,
      happiness: 85,
      hunger: 90,
    };
  });

  const [activeHeart, setActiveHeart] = useState<boolean>(false);
  const [treatAnimation, setTreatAnimation] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(petData));
    } catch (e) {
      console.error(e);
    }
  }, [petData]);

  // Handle patting: does NOT break the selected mood
  const handlePat = () => {
    setActiveHeart(true);
    setTimeout(() => setActiveHeart(false), 900);

    setPetData((prev) => ({
      ...prev,
      pats: prev.pats + 1,
      happiness: Math.min(100, prev.happiness + 5),
    }));
  };

  const handleFeed = () => {
    const foodIcon = petData.species === 'cat' ? '🍣' : petData.species === 'dog' ? '🍖' : petData.species === 'bunny' ? '🥕' : '🍇';
    setTreatAnimation(foodIcon);
    setTimeout(() => setTreatAnimation(null), 1200);

    setPetData((prev) => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + 20),
      happiness: Math.min(100, prev.happiness + 8),
    }));
  };

  const handlePlay = () => {
    setTreatAnimation('🎾');
    setTimeout(() => setTreatAnimation(null), 1000);

    setPetData((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
      hunger: Math.max(0, prev.hunger - 5),
    }));
  };

  const toggleNap = () => {
    setPetData((prev) => ({
      ...prev,
      mood: prev.mood === 'sleepy' ? 'vibing' : 'sleepy',
    }));
  };

  const getSpeechText = () => {
    if (petData.mood === 'sleepy') {
      return `zzZ... ${petData.name} is peacefully napping on your screen bezel...`;
    }
    if (petData.mood === 'focused') {
      return `"${petData.name} is laser-focused with you! Let's get work done!"`;
    }
    if (petData.mood === 'happy') {
      return `"${petData.name} loves your company! Total pats: ${petData.pats}"`;
    }
    return `"${petData.name} is happily vibing to your desktop rhythm ♫"`;
  };

  // Render Cute Animated SVG Pet Characters
  const renderPetSvg = () => {
    const isSleeping = petData.mood === 'sleepy';
    const isHappy = petData.mood === 'happy';
    const isFocused = petData.mood === 'focused';

    if (petData.species === 'cat') {
      return (
        <svg width="90" height="80" viewBox="0 0 90 80" fill="none">
          {/* Cat Ears */}
          <polygon points="18,32 10,8 34,22" fill="#F472B6" />
          <polygon points="20,29 15,14 30,22" fill="#FBCFE8" />
          <polygon points="72,32 80,8 56,22" fill="#F472B6" />
          <polygon points="70,29 75,14 60,22" fill="#FBCFE8" />
          {/* Head */}
          <ellipse cx="45" cy="45" rx="35" ry="28" fill="#FDF2F8" stroke="#F472B6" strokeWidth="2.5" />
          {/* Cheeks */}
          <circle cx="24" cy="52" r="5" fill="#FDA4AF" opacity="0.7" />
          <circle cx="66" cy="52" r="5" fill="#FDA4AF" opacity="0.7" />
          {/* Eyes */}
          {isSleeping ? (
            <>
              <path d="M26 44 Q33 50 40 44" stroke="#831843" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M50 44 Q57 50 64 44" stroke="#831843" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : isFocused ? (
            <>
              <ellipse cx="33" cy="43" rx="4" ry="5" fill="#1E293B" />
              <ellipse cx="57" cy="43" rx="4" ry="5" fill="#1E293B" />
              <line x1="25" y1="36" x2="38" y2="39" stroke="#831843" strokeWidth="2" strokeLinecap="round" />
              <line x1="65" y1="36" x2="52" y2="39" stroke="#831843" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="33" cy="43" r="5.5" fill="#831843" />
              <circle cx="35" cy="41" r="2" fill="#FFFFFF" />
              <circle cx="57" cy="43" r="5.5" fill="#831843" />
              <circle cx="59" cy="41" r="2" fill="#FFFFFF" />
            </>
          )}
          {/* Nose & Mouth */}
          <polygon points="45,49 42,46 48,46" fill="#F43F5E" />
          <path d="M42 51 Q45 54 48 51" stroke="#831843" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Whiskers */}
          <line x1="12" y1="46" x2="22" y2="48" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="52" x2="22" y2="52" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="78" y1="46" x2="68" y2="48" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="78" y1="52" x2="68" y2="52" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }

    if (petData.species === 'dog') {
      return (
        <svg width="90" height="80" viewBox="0 0 90 80" fill="none">
          {/* Shiba Ears */}
          <polygon points="16,30 14,10 34,22" fill="#F59E0B" />
          <polygon points="20,28 17,16 30,22" fill="#FEF3C7" />
          <polygon points="74,30 76,10 56,22" fill="#F59E0B" />
          <polygon points="70,28 73,16 60,22" fill="#FEF3C7" />
          {/* Head */}
          <ellipse cx="45" cy="46" rx="34" ry="28" fill="#FDE68A" stroke="#D97706" strokeWidth="2.5" />
          {/* White Shiba Muzzle */}
          <ellipse cx="45" cy="53" rx="18" ry="14" fill="#FFFFFF" />
          <circle cx="22" cy="50" r="5" fill="#FCA5A5" opacity="0.6" />
          <circle cx="68" cy="50" r="5" fill="#FCA5A5" opacity="0.6" />
          {/* Eyes */}
          {isSleeping ? (
            <>
              <path d="M26 43 Q32 48 38 43" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M52 43 Q58 48 64 43" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="32" cy="42" r="5" fill="#451A03" />
              <circle cx="34" cy="40" r="1.8" fill="#FFFFFF" />
              <circle cx="58" cy="42" r="5" fill="#451A03" />
              <circle cx="60" cy="40" r="1.8" fill="#FFFFFF" />
            </>
          )}
          {/* Dog Nose & Tongue */}
          <ellipse cx="45" cy="49" rx="4" ry="3" fill="#1C1917" />
          <path d="M42 53 Q45 56 48 53" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {isHappy && (
            <path d="M43 54 C43 59 47 59 47 54 Z" fill="#F43F5E" />
          )}
        </svg>
      );
    }

    if (petData.species === 'bunny') {
      return (
        <svg width="90" height="85" viewBox="0 0 90 85" fill="none">
          {/* Bunny Long Ears */}
          <ellipse cx="30" cy="18" rx="8" ry="18" fill="#E0E7FF" stroke="#818CF8" strokeWidth="2" />
          <ellipse cx="30" cy="18" rx="4" ry="12" fill="#EEF2FF" />
          <ellipse cx="60" cy="18" rx="8" ry="18" fill="#E0E7FF" stroke="#818CF8" strokeWidth="2" />
          <ellipse cx="60" cy="18" rx="4" ry="12" fill="#EEF2FF" />
          {/* Head */}
          <ellipse cx="45" cy="52" rx="33" ry="26" fill="#F8FAFC" stroke="#818CF8" strokeWidth="2.5" />
          {/* Cheeks */}
          <circle cx="23" cy="56" r="5" fill="#FDA4AF" opacity="0.8" />
          <circle cx="67" cy="56" r="5" fill="#FDA4AF" opacity="0.8" />
          {/* Eyes */}
          {isSleeping ? (
            <>
              <path d="M26 49 Q33 54 40 49" stroke="#3730A3" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M50 49 Q57 54 64 49" stroke="#3730A3" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="33" cy="49" rx="5" ry="6" fill="#4338CA" />
              <circle cx="35" cy="47" r="2" fill="#FFFFFF" />
              <ellipse cx="57" cy="49" rx="5" ry="6" fill="#4338CA" />
              <circle cx="59" cy="47" r="2" fill="#FFFFFF" />
            </>
          )}
          {/* Cute Nose */}
          <polygon points="45,54 42,51 48,51" fill="#F43F5E" />
          <path d="M42 56 Q45 59 48 56" stroke="#3730A3" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      );
    }

    // Fox species
    return (
      <svg width="90" height="80" viewBox="0 0 90 80" fill="none">
        {/* Fox Ears with dark tips */}
        <polygon points="14,34 8,8 32,24" fill="#EA580C" />
        <polygon points="8,8 14,14 18,12" fill="#1E293B" />
        <polygon points="18,30 14,16 28,24" fill="#FFEDD5" />
        <polygon points="76,34 82,8 58,24" fill="#EA580C" />
        <polygon points="82,8 76,14 72,12" fill="#1E293B" />
        <polygon points="72,30 76,16 62,24" fill="#FFEDD5" />
        {/* Head */}
        <ellipse cx="45" cy="46" rx="34" ry="27" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
        {/* White Fox Mask */}
        <path d="M18 48 Q30 64 45 62 Q60 64 72 48 Q45 52 18 48 Z" fill="#FFF7ED" />
        {/* Eyes */}
        {isSleeping ? (
          <>
            <path d="M25 44 Q33 49 40 44" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M50 44 Q57 49 65 44" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <path d="M27 44 Q34 40 40 44" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="34" cy="43" r="3.5" fill="#431407" />
            <circle cx="35" cy="42" r="1.2" fill="#FFFFFF" />
            <path d="M50 44 Q56 40 63 44" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="56" cy="43" r="3.5" fill="#431407" />
            <circle cx="57" cy="42" r="1.2" fill="#FFFFFF" />
          </>
        )}
        <ellipse cx="45" cy="55" rx="3.5" ry="2.5" fill="#0F172A" />
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, height: 320 }}>
      {/* Species Selector Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Smile size={13} style={{ color: 'var(--nova-warning)' }} />
          <span>NOVA DESKTOP MASCOT</span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {([
            { id: 'cat', label: '🐱 Cat' },
            { id: 'dog', label: '🐕 Dog' },
            { id: 'bunny', label: '🐰 Bunny' },
            { id: 'fox', label: '🦊 Fox' },
          ] as const).map((spec) => (
            <button
              key={spec.id}
              onClick={() => setPetData((prev) => ({ ...prev, species: spec.id }))}
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: 'var(--nova-radius-pill)',
                backgroundColor: petData.species === spec.id ? 'var(--nova-blue)' : 'var(--nova-surface)',
                color: petData.species === spec.id ? '#fff' : 'var(--nova-text-secondary)',
                border: '1px solid var(--nova-border)',
                cursor: 'pointer',
                fontWeight: petData.species === spec.id ? 600 : 400,
              }}
            >
              {spec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Mascot Pod */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={handlePat}
          animate={{
            y: petData.mood === 'sleepy' ? [0, 2, 0] : [0, -6, 0],
          }}
          transition={{ duration: petData.mood === 'sleepy' ? 3.5 : 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 140,
            height: 105,
            backgroundColor: 'var(--nova-surface)',
            border: '1px solid var(--nova-border)',
            borderRadius: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            position: 'relative',
          }}
        >
          {renderPetSvg()}

          {/* Floating Pat Heart Animation */}
          <AnimatePresence>
            {activeHeart && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -35, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  position: 'absolute',
                  top: 10,
                  color: '#F43F5E',
                  fontSize: '24px',
                  pointerEvents: 'none',
                }}
              >
                💕
              </motion.div>
            )}
          </AnimatePresence>

          {/* Food/Toy Treat Animation */}
          <AnimatePresence>
            {treatAnimation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3, y: 15 }}
                animate={{ opacity: 1, scale: 1.3, y: -20 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.9 }}
                style={{
                  position: 'absolute',
                  fontSize: '28px',
                  pointerEvents: 'none',
                }}
              >
                {treatAnimation}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Sleep Bubbles */}
          {petData.mood === 'sleepy' && (
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], y: [-2, -14, -2] }}
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

        {/* Speech Bubble / Status Line */}
        <div
          style={{
            fontSize: '11px',
            color: 'var(--nova-text-secondary)',
            textAlign: 'center',
            marginTop: 8,
            maxWidth: 320,
            lineHeight: 1.4,
          }}
        >
          {getSpeechText()}
        </div>
      </div>

      {/* Pet Status Meters (Happiness & Hunger) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 340 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--nova-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Heart size={10} style={{ color: '#F43F5E' }} /> Happiness
            </span>
            <span style={{ fontWeight: 600 }}>{petData.happiness}%</span>
          </div>
          <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${petData.happiness}%`, backgroundColor: '#F43F5E', borderRadius: 2 }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--nova-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Fish size={10} style={{ color: 'var(--nova-cyan)' }} /> Fullness
            </span>
            <span style={{ fontWeight: 600 }}>{petData.hunger}%</span>
          </div>
          <div style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${petData.hunger}%`, backgroundColor: 'var(--nova-cyan)', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* Interactive Care Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={handlePat}
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

        <button
          onClick={handleFeed}
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
          <Fish size={12} />
          <span>Feed 🍣</span>
        </button>

        <button
          onClick={handlePlay}
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
          <Sparkles size={12} />
          <span>Play 🎾</span>
        </button>

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
          <span>{petData.mood === 'sleepy' ? 'Wake Up' : 'Nap'}</span>
        </button>
      </div>

      {/* Mood Selector Buttons (Properly wired, no override!) */}
      <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
        {(['vibing', 'happy', 'focused'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setPetData((prev) => ({ ...prev, mood: m }))}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--nova-radius-pill)',
              backgroundColor: petData.mood === m ? 'var(--nova-blue)' : 'var(--nova-surface)',
              color: petData.mood === m ? '#fff' : 'var(--nova-text-secondary)',
              border: '1px solid var(--nova-border)',
              fontSize: '10px',
              fontWeight: petData.mood === m ? 600 : 400,
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};
