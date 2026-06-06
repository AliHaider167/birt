import { useEffect, useState, useRef } from 'react';

const LINES = [
  "Happy Birthday to my amazing friend! 🎉",
  "You are a light in every moment of life…",
  "Your laughter is the music of the universe 🎵",
  "May every dream you hold bloom into reality ✨",
  "The world is infinitely more beautiful with you in it 🌸",
  "Here's to you — extraordinary, irreplaceable, loved 💖",
  "May this year bring you oceans of joy & mountains of love 🌊",
  "Wishing you magic in every breath you take… 🌙✨",
];

interface TypingLineProps {
  text: string;
  delay: number;
  speed?: number;
  isLast?: boolean;
}

function TypingLine({ text, delay, speed = 40, isLast = false }: TypingLineProps) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (indexRef.current >= text.length) { setDone(true); return; }
    const timer = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [started, text, speed]);

  if (!started) return null;

  return (
    <p
      className="text-white/90 leading-relaxed"
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
        opacity: started ? 1 : 0,
        transition: 'opacity 0.4s',
      }}
    >
      {displayed}
      {!done && <span className="typing-cursor text-pink-400 ml-0.5">|</span>}
      {done && isLast && <span className="ml-1">💝</span>}
    </p>
  );
}

export default function BirthdayMessage() {
  const [key, setKey] = useState(0);

  // Cumulative delay: each line starts after previous finishes
  const delays: number[] = [];
  let acc = 600;
  LINES.forEach((line) => {
    delays.push(acc);
    acc += line.length * 42 + 800; // typing time + pause
  });

  useEffect(() => {
    // Lines auto-appear via CSS animation delays
  }, [key]);

  const handleReplay = () => {
    setKey(k => k + 1);
  };

  return (
    <div className="w-full">
      {/* Decorative header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(244,114,182,0.5))' }} />
        <span className="text-pink-300 text-lg">✦ From My Heart ✦</span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(244,114,182,0.5), transparent)' }} />
      </div>

      {/* Message lines */}
      <div key={key} className="flex flex-col gap-4 mb-6">
        {LINES.map((line, i) => (
          <TypingLine
            key={`${key}-${i}`}
            text={line}
            delay={delays[i]}
            speed={38}
            isLast={i === LINES.length - 1}
          />
        ))}
      </div>

      {/* Signature */}
      <div
        className="mt-6 text-right"
        style={{ opacity: 0, animation: `fadeInUp 0.8s ease-out ${(acc / 1000).toFixed(1)}s forwards` }}
      >
        <p
          className="text-pink-300 text-xl"
          style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}
        >
          — With all my love & wishes 💌
        </p>
      </div>

      {/* Replay button */}
      <div
        className="mt-4 flex justify-center"
        style={{ opacity: 0, animation: `fadeInUp 0.8s ease-out ${((acc + 1200) / 1000).toFixed(1)}s forwards` }}
      >
        <button
          onClick={handleReplay}
          className="cursor-none text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-2 border border-white/10 px-4 py-2 rounded-full hover:border-pink-400/40"
        >
          ↺ Replay Message
        </button>
      </div>
    </div>
  );
}
