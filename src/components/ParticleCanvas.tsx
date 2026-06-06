import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'star' | 'heart' | 'sparkle' | 'circle';
  depth: number; // 0=far, 1=near
  spin: number;
  spinSpeed: number;
}

interface ParticleCanvasProps {
  celebrateCount: number;
  clickPos: { x: number; y: number } | null;
}

const COLORS = ['#f472b6', '#fbbf24', '#a78bfa', '#60a5fa', '#fb7185', '#fde68a', '#c4b5fd', '#ffffff'];

const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  const s = size * 0.5;
  ctx.moveTo(0, -s * 0.3);
  ctx.bezierCurveTo(s, -s, s * 1.5, s * 0.5, 0, s);
  ctx.bezierCurveTo(-s * 1.5, s * 0.5, -s, -s, 0, -s * 0.3);
  ctx.closePath();
  ctx.restore();
};

const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, spin: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(spin);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const ix = Math.cos(angle) * size;
    const iy = Math.sin(angle) * size;
    const ox = Math.cos(angle + Math.PI / 4) * size * 0.3;
    const oy = Math.sin(angle + Math.PI / 4) * size * 0.3;
    if (i === 0) ctx.moveTo(ix, iy);
    else ctx.lineTo(ix, iy);
    ctx.lineTo(ox, oy);
  }
  ctx.closePath();
  ctx.restore();
};

export default function ParticleCanvas({ celebrateCount, clickPos }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef(0);
  const prevCelebrate = useRef(0);
  const prevClick = useRef<{ x: number; y: number } | null>(null);

  const spawnAmbient = useCallback(() => {
    const p: Particle = {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.2 + window.innerHeight * 0.8,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(Math.random() * 1.5 + 0.5),
      size: Math.random() * 4 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0,
      life: 0,
      maxLife: 120 + Math.random() * 80,
      type: Math.random() > 0.6 ? 'sparkle' : 'circle',
      depth: Math.random(),
      spin: 0,
      spinSpeed: (Math.random() - 0.5) * 0.1,
    };
    particlesRef.current.push(p);
  }, []);

  const spawnCelebrate = useCallback((cx: number, cy: number, count = 80) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 12 + 3;
      const types: Particle['type'][] = ['heart', 'sparkle', 'star', 'circle'];
      particlesRef.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 10 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 1,
        life: 0,
        maxLife: 80 + Math.random() * 60,
        type: types[Math.floor(Math.random() * types.length)],
        depth: Math.random(),
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.2,
      });
    }
  }, []);

  const spawnClick = useCallback((cx: number, cy: number) => {
    for (let i = 0; i < 20; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 6 + 1;
      particlesRef.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 8 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 1,
        life: 0,
        maxLife: 50 + Math.random() * 30,
        type: Math.random() > 0.5 ? 'heart' : 'sparkle',
        depth: 1,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.15,
      });
    }
  }, []);

  useEffect(() => {
    if (celebrateCount !== prevCelebrate.current) {
      prevCelebrate.current = celebrateCount;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      spawnCelebrate(cx, cy, 120);
      // Also fire from corners
      setTimeout(() => spawnCelebrate(0, window.innerHeight, 60), 200);
      setTimeout(() => spawnCelebrate(window.innerWidth, window.innerHeight, 60), 400);
      setTimeout(() => spawnCelebrate(cx, 0, 60), 600);
    }
  }, [celebrateCount, spawnCelebrate]);

  useEffect(() => {
    if (clickPos && clickPos !== prevClick.current) {
      prevClick.current = clickPos;
      spawnClick(clickPos.x, clickPos.y);
    }
  }, [clickPos, spawnClick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let frame = 0;

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn ambient particles
      if (frame % 4 === 0 && particlesRef.current.length < 200) {
        spawnAmbient();
      }

      // Draw & update
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life++;
        const prog = p.life / p.maxLife;

        // Physics
        p.x += p.vx * (0.6 + p.depth * 0.4);
        p.y += p.vy * (0.6 + p.depth * 0.4);
        p.vy += 0.08; // gravity
        p.vx *= 0.99;
        p.spin += p.spinSpeed;

        // Alpha
        if (prog < 0.15) {
          p.alpha = prog / 0.15;
        } else if (prog > 0.7) {
          p.alpha = (1 - prog) / 0.3;
        } else {
          p.alpha = 1;
        }
        p.alpha = Math.max(0, Math.min(1, p.alpha));

        // Draw
        ctx.save();
        ctx.globalAlpha = p.alpha * (0.6 + p.depth * 0.4);

        // Glow
        ctx.shadowBlur = 12 + p.depth * 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        if (p.type === 'circle' || p.type === 'star') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - prog * 0.3), 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'heart') {
          drawHeart(ctx, p.x, p.y, p.size * 2);
          ctx.fill();
        } else if (p.type === 'sparkle') {
          drawSparkle(ctx, p.x, p.y, p.size, p.spin);
          ctx.fill();
        }

        ctx.restore();

        if (p.life >= p.maxLife || p.y < -50 || p.x < -50 || p.x > canvas.width + 50) {
          particlesRef.current.splice(i, 1);
        }
      }
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [spawnAmbient]);

  return <canvas ref={canvasRef} id="particle-canvas" />;
}
