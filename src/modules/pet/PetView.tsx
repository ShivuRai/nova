import React, { useState } from 'react';
import { Smile, Heart, Sparkles, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

export const PetView: React.FC = () => {
  const [mood, setMood] = useState<'happy' | 'vibing' | 'focused' | 'sleepy'>('vibing');
  const [petClicks, setPetClicks] = useState(0);

  const getPetFace = () => {
    switch (mood) {
      case 'happy':
        return '( ˶ᵔ ᵕ ᵔ˶ )';
      case 'vibing':
        return '( ˘▽˘)っ♫';
      case 'focused':
        return '( •̀_•́ )';
      case 'sleepy':
        return '( -ω- )zzZ';
    }
  };

  const getMoodDescription = () => {
    switch (mood) {
      case 'happy':
        return 'Nova is cheerful! You are being productive.';
      case 'vibing':
        return 'Vibing to your background music playback.';
      case 'focused':
        return 'Focus mode active! Keeping you on task.';
      case 'sleepy':
        return 'Taking a low-CPU power nap on your top bezel.';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, height: 320 }}>
      <div style={{ fontSize: '11px', color: 'var(--nova-text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Smile size={13} style={{ color: 'var(--nova-warning)' }} />
        <span>NOVA DESKTOP MASCOT & MOOD COMPANION</span>
      </div>

      {/* Pet Interactive Canvas */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setPetClicks((c) => c + 1);
          setMood('happy');
        }}
        style={{
          width: 140,
          height: 100,
          backgroundColor: 'var(--nova-surface)',
          border: '1px solid var(--nova-border)',
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontSize: '22px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--nova-cyan)',
          }}
        >
          {getPetFace()}
        </motion.div>
        <span style={{ fontSize: '10px', color: 'var(--nova-text-muted)', marginTop: 4 }}>
          Pats: {petClicks}
        </span>
      </motion.div>

      <div style={{ fontSize: '12px', color: 'var(--nova-text-secondary)', textAlign: 'center' }}>
        {getMoodDescription()}
      </div>

      {/* Mood Selector Buttons */}
      <div style={{ display: 'flex', gap: 6 }}>
        {(['vibing', 'happy', 'focused', 'sleepy'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--nova-radius-pill)',
              backgroundColor: mood === m ? 'var(--nova-blue)' : 'var(--nova-surface)',
              color: mood === m ? '#fff' : 'var(--nova-text-secondary)',
              border: '1px solid var(--nova-border)',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Low-CPU Guarantee */}
      <div style={{ marginTop: 'auto', fontSize: '10px', color: 'var(--nova-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Sparkles size={11} style={{ color: 'var(--nova-warning)' }} />
        <span>Optimized CSS transforms • 0% CPU consumption when idle</span>
      </div>
    </div>
  );
};
