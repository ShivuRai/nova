import React from 'react';
import { motion } from 'framer-motion';
import { AmbientParticleMode } from '../../types';

interface AmbientParticlesProps {
  mode?: AmbientParticleMode;
  width: number;
  height: number;
}

export const AmbientParticles: React.FC<AmbientParticlesProps> = ({ mode = 'off', width, height }) => {
  if (mode === 'off' || !mode) return null;

  // Generate deterministic pseudo-random particle items
  const particleCount = 18;
  const items = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: ((i * 37) % 100), // percentage horizontally
    delay: (i * 0.35) % 4,
    duration: 3 + ((i * 1.7) % 3),
    size: 3 + (i % 4),
  }));

  if (mode === 'snow') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: -40,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -10, x: `${item.x}%` }}
            animate={{
              opacity: [0, 0.8, 0.8, 0],
              y: [0, height + 80],
              x: [`${item.x}%`, `${item.x + (item.id % 2 === 0 ? 4 : -4)}%`],
            }}
            transition={{
              duration: item.duration + 1,
              repeat: Infinity,
              delay: item.delay,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              top: 0,
              width: item.size,
              height: item.size,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 4px rgba(255,255,255,0.8)',
            }}
          />
        ))}
      </div>
    );
  }

  if (mode === 'sakura') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: -40,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -10, rotate: 0 }}
            animate={{
              opacity: [0, 0.9, 0.9, 0],
              y: [0, height + 90],
              x: [`${item.x}%`, `${item.x + (item.id % 2 === 0 ? 8 : -8)}%`],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: item.duration + 2,
              repeat: Infinity,
              delay: item.delay,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: 0,
              width: item.size + 3,
              height: (item.size + 3) * 1.4,
              borderRadius: '50% 50% 50% 10%',
              backgroundColor: item.id % 2 === 0 ? '#F472B6' : '#FBCFE8',
              boxShadow: '0 0 6px rgba(244,114,182,0.6)',
            }}
          />
        ))}
      </div>
    );
  }

  if (mode === 'stardust') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: -20,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            animate={{
              scale: [0.6, 1.4, 0.6],
              opacity: [0.2, 0.95, 0.2],
            }}
            transition={{
              duration: item.duration * 0.8,
              repeat: Infinity,
              delay: item.delay,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: `${(item.id * 17) % 90}%`,
              left: `${item.x}%`,
              width: item.size + 1,
              height: item.size + 1,
              borderRadius: '50%',
              backgroundColor: item.id % 3 === 0 ? 'var(--nova-cyan)' : item.id % 3 === 1 ? 'var(--nova-blue)' : '#FFFFFF',
              boxShadow: '0 0 8px currentColor',
            }}
          />
        ))}
      </div>
    );
  }

  if (mode === 'bubbles') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: -30,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: height + 30 }}
            animate={{
              opacity: [0, 0.7, 0.7, 0],
              y: [height + 30, -30],
              x: [`${item.x}%`, `${item.x + (item.id % 2 === 0 ? 5 : -5)}%`],
            }}
            transition={{
              duration: item.duration + 1.5,
              repeat: Infinity,
              delay: item.delay,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: item.size * 2,
              height: item.size * 2,
              borderRadius: '50%',
              border: '1px solid rgba(56, 189, 248, 0.6)',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              boxShadow: '0 0 6px rgba(56,189,248,0.4)',
            }}
          />
        ))}
      </div>
    );
  }

  if (mode === 'matrix') {
    return (
      <div
        style={{
          position: 'absolute',
          inset: -30,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: [0, 0.9, 0],
              y: [0, height + 60],
            }}
            transition={{
              duration: item.duration * 0.7,
              repeat: Infinity,
              delay: item.delay * 0.7,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: `${item.x}%`,
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: '#4ADE80',
              textShadow: '0 0 5px #22C55E',
              lineHeight: 1,
            }}
          >
            {item.id % 2 === 0 ? '1' : '0'}
          </motion.div>
        ))}
      </div>
    );
  }

  return null;
};

