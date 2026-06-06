import { useEffect, useState } from 'react';

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onDone, 800);
          }, 400);
          return 100;
        }
        // Non-linear progress (fast start, slow end)
        const increment = p < 60 ? 3 : p < 85 ? 1.5 : 0.8;
        return Math.min(100, p + increment);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        zIndex: 1000,
        background: 'radial-gradient(ellipse at center, #1e0b3d 0%, #0a0010 100%)',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.8s ease-out',
        pointerEvents: fadeOut ? 'none' : 'auto',
      }}
    >
      {/* Animated cake */}
      <div
        className="text-7xl mb-8 animate-heartbeat"
        style={{ filter: 'drop-shadow(0 0 20px rgba(244,114,182,0.6))' }}
      >
        🎂
      </div>

      {/* Title */}
      <h2
        className="font-playfair text-white/90 text-2xl mb-2 tracking-wide"
        style={{
          fontFamily: "'Playfair Display', serif",
          textShadow: '0 0 20px rgba(244,114,182,0.5)',
        }}
      >
        Preparing Your Surprise...
      </h2>
      <p className="text-white/40 text-sm mb-8 tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>
        ✦ A magical moment awaits ✦
      </p>

      {/* Progress bar */}
      <div className="w-64 relative">
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #f472b6, #a78bfa, #60a5fa)',
              boxShadow: '0 0 10px rgba(244,114,182,0.6)',
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-white/30 text-xs" style={{ fontFamily: 'Inter' }}>Loading magic</span>
          <span className="text-pink-400/70 text-xs" style={{ fontFamily: 'Inter' }}>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Orbiting particles */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#f472b6', '#fbbf24', '#a78bfa', '#60a5fa', '#fb7185', '#fde68a'][i],
            animation: `spin-slow ${2 + i * 0.3}s linear infinite`,
            transformOrigin: `${50 + 60 * Math.cos((i / 6) * Math.PI * 2)}px ${50 + 60 * Math.sin((i / 6) * Math.PI * 2)}px`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}
