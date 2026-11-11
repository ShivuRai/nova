import React, { useRef, useEffect } from 'react';
import { AmbientParticleMode } from '../../types';

interface AmbientParticlesProps {
  mode?: AmbientParticleMode;
  width: number;
  height: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  rot: number;
  rotSpeed: number;
  pitch: number;
  pitchSpeed: number;
  color: string;
  char?: string;
  charTimer?: number;
  isSpecial?: boolean;
}

const MATRIX_CHARS = ['0', '1', 'λ', 'Ω', '§', '7', 'Z', '9', 'X', 'Ψ', '4', '8'];

export const AmbientParticles: React.FC<AmbientParticlesProps> = ({ mode = 'off', width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!mode || mode === 'off') {
      particlesRef.current = [];
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.max(10, width * dpr);
    canvas.height = Math.max(10, height * dpr);
    ctx.scale(dpr, dpr);

    // Initialize particles based on selected mode
    const count =
      mode === 'snow' ? 42 :
      mode === 'sakura' ? 32 :
      mode === 'stardust' ? 38 :
      mode === 'bubbles' ? 26 :
      mode === 'matrix' ? 30 :
      mode === 'fireflies' ? 32 :
      mode === 'embers' ? 38 : 0;

    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      if (mode === 'snow') {
        newParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: 0.4 + Math.random() * 0.9,
          size: 1.2 + Math.random() * 2.8,
          alpha: 0.4 + Math.random() * 0.55,
          baseAlpha: 0.4 + Math.random() * 0.55,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.015 + Math.random() * 0.025,
          rot: 0,
          rotSpeed: 0,
          pitch: 0,
          pitchSpeed: 0,
          color: '#FFFFFF',
          isSpecial: Math.random() > 0.75, // 6-branch mini crystal
        });
      } else if (mode === 'sakura') {
        const pinks = ['#F472B6', '#FBCFE8', '#FDA4AF', '#F43F5E'];
        newParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0.3 + Math.random() * 0.7,
          vy: 0.5 + Math.random() * 0.8,
          size: 4 + Math.random() * 4.5,
          alpha: 0.6 + Math.random() * 0.35,
          baseAlpha: 0.6 + Math.random() * 0.35,
          pulsePhase: 0,
          pulseSpeed: 0,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.02 + Math.random() * 0.03,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          pitch: Math.random() * Math.PI * 2,
          pitchSpeed: 0.03 + Math.random() * 0.04, // 3D tumbling flip
          color: pinks[Math.floor(Math.random() * pinks.length)],
        });
      } else if (mode === 'stardust') {
        const starColors = ['#FFFFFF', '#38BDF8', '#818CF8', '#E0F2FE'];
        newParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: 2.2 + Math.random() * 3.8,
          alpha: 0.3 + Math.random() * 0.7,
          baseAlpha: 0.3 + Math.random() * 0.7,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.03 + Math.random() * 0.05,
          swayPhase: 0,
          swaySpeed: 0,
          rot: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          pitch: 0,
          pitchSpeed: 0,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          isSpecial: Math.random() > 0.6,
        });
      } else if (mode === 'bubbles') {
        newParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(0.4 + Math.random() * 0.8), // float upward
          size: 3 + Math.random() * 6.5,
          alpha: 0.35 + Math.random() * 0.45,
          baseAlpha: 0.35 + Math.random() * 0.45,
          pulsePhase: 0,
          pulseSpeed: 0,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.02 + Math.random() * 0.03,
          rot: 0,
          rotSpeed: 0,
          pitch: 0,
          pitchSpeed: 0,
          color: '#38BDF8',
        });
      } else if (mode === 'matrix') {
        newParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0,
          vy: 0.8 + Math.random() * 1.5,
          size: 8.5 + Math.random() * 2,
          alpha: 0.5 + Math.random() * 0.5,
          baseAlpha: 0.5 + Math.random() * 0.5,
          pulsePhase: 0,
          pulseSpeed: 0,
          swayPhase: 0,
          swaySpeed: 0,
          rot: 0,
          rotSpeed: 0,
          pitch: 0,
          pitchSpeed: 0,
          color: Math.random() > 0.85 ? '#86EFAC' : '#22C55E',
          char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
          charTimer: 0,
        });
      } else if (mode === 'fireflies') {
        newParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: 2.2 + Math.random() * 2.5,
          alpha: 0.2,
          baseAlpha: 0.8,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.025 + Math.random() * 0.035,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.02,
          rot: 0,
          rotSpeed: 0,
          pitch: 0,
          pitchSpeed: 0,
          color: '#FEF08A',
        });
      } else if (mode === 'embers') {
        const emberColors = ['#FBBF24', '#F97316', '#EF4444', '#F59E0B'];
        newParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(0.6 + Math.random() * 1.6), // buoyant rise
          size: 1.5 + Math.random() * 2.5,
          alpha: 0.5 + Math.random() * 0.5,
          baseAlpha: 0.5 + Math.random() * 0.5,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.05 + Math.random() * 0.05,
          swayPhase: Math.random() * Math.PI * 2,
          swaySpeed: 0.03 + Math.random() * 0.04,
          rot: 0,
          rotSpeed: 0,
          pitch: 0,
          pitchSpeed: 0,
          color: emberColors[Math.floor(Math.random() * emberColors.length)],
        });
      }
    }

    particlesRef.current = newParticles;

    // 60FPS Physics and Organic Render Loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (mode === 'snow') {
          p.swayPhase += p.swaySpeed;
          p.x += p.vx + Math.sin(p.swayPhase) * 0.45;
          p.y += p.vy;

          if (p.y > height + 8) {
            p.y = -8;
            p.x = Math.random() * width;
          }
          if (p.x < -8) p.x = width + 8;
          if (p.x > width + 8) p.x = -8;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          if (p.isSpecial) {
            // Detailed 6-branch crystalline snowflake
            ctx.translate(p.x, p.y);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            for (let b = 0; b < 6; b++) {
              const ang = (b * Math.PI) / 3;
              ctx.moveTo(0, 0);
              ctx.lineTo(Math.cos(ang) * p.size, Math.sin(ang) * p.size);
            }
            ctx.stroke();
          } else {
            // Soft glowing snow drop
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else if (mode === 'sakura') {
          p.swayPhase += p.swaySpeed;
          p.x += p.vx + Math.sin(p.swayPhase) * 0.6;
          p.y += p.vy;
          p.rot += p.rotSpeed;
          p.pitch += p.pitchSpeed;

          if (p.y > height + 12) {
            p.y = -12;
            p.x = Math.random() * width;
          }
          if (p.x > width + 12) p.x = -12;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(1, Math.abs(Math.cos(p.pitch))); // 3D tumbling flutter
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;

          // Cute natural petal curve
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.8, -p.size * 0.3, p.size * 0.5, p.size * 0.8);
          ctx.quadraticCurveTo(0, p.size * 0.5, -p.size * 0.5, p.size * 0.8);
          ctx.quadraticCurveTo(-p.size * 0.8, -p.size * 0.3, 0, -p.size);
          ctx.fill();
          ctx.restore();
        } else if (mode === 'stardust') {
          p.pulsePhase += p.pulseSpeed;
          p.rot += p.rotSpeed;
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;

          const currentAlpha = Math.max(0.1, p.baseAlpha * (0.4 + 0.6 * Math.sin(p.pulsePhase)));
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = currentAlpha;
          ctx.fillStyle = p.color;

          // 4-point radiant starburst
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();

          // Soft core center
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (mode === 'bubbles') {
          p.swayPhase += p.swaySpeed;
          p.x += p.vx + Math.sin(p.swayPhase) * 0.35;
          p.y += p.vy;

          if (p.y < -15) {
            p.y = height + 15;
            p.x = Math.random() * width;
          }
          if (p.x < -15) p.x = width + 15;
          if (p.x > width + 15) p.x = -15;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          // Soap bubble translucent orb
          ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Thin refractive rim
          ctx.strokeStyle = 'rgba(125, 211, 252, 0.55)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Top-left specular shine
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.35, p.y - p.size * 0.35, p.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (mode === 'matrix') {
          p.y += p.vy;
          if (p.charTimer !== undefined) {
            p.charTimer++;
            if (p.charTimer > 18) {
              p.char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
              p.charTimer = 0;
            }
          }

          if (p.y > height + 14) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.font = `bold ${Math.round(p.size)}px monospace`;
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#22C55E';
          ctx.shadowBlur = 4;
          ctx.fillText(p.char || '1', p.x, p.y);
          ctx.restore();
        } else if (mode === 'fireflies') {
          p.pulsePhase += p.pulseSpeed;
          p.swayPhase += p.swaySpeed;

          p.x += p.vx + Math.sin(p.swayPhase) * 0.3;
          p.y += p.vy + Math.cos(p.swayPhase * 0.8) * 0.3;

          // Soft boundary bounce
          if (p.x < 5 || p.x > width - 5) p.vx *= -1;
          if (p.y < 5 || p.y > height - 5) p.vy *= -1;

          const currentAlpha = 0.15 + 0.85 * Math.pow(Math.sin(p.pulsePhase), 2);

          ctx.save();
          ctx.globalAlpha = currentAlpha;

          // Warm ambient aura halo
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
          grad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
          grad.addColorStop(0.3, 'rgba(245, 158, 11, 0.45)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Bright center core
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (mode === 'embers') {
          p.swayPhase += p.swaySpeed;
          p.pulsePhase += p.pulseSpeed;
          p.x += p.vx + Math.sin(p.swayPhase) * 0.4;
          p.y += p.vy;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
            p.alpha = p.baseAlpha;
          }

          const currentAlpha = Math.max(0.1, p.alpha * (0.6 + 0.4 * Math.sin(p.pulsePhase)));

          ctx.save();
          ctx.globalAlpha = currentAlpha;
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#F97316';
          ctx.shadowBlur = 5;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [mode, width, height]);

  if (!mode || mode === 'off') return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
};
