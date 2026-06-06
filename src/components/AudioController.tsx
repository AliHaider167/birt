import { useEffect, useRef } from 'react';

// Generate a simple birthday melody using Web Audio API
function createBirthdaySynth(audioCtx: AudioContext) {
  const master = audioCtx.createGain();
  master.gain.value = 0.18;
  master.connect(audioCtx.destination);

  // Reverb (convolver-like via delay)
  const delay = audioCtx.createDelay(0.5);
  delay.delayTime.value = 0.3;
  const delayGain = audioCtx.createGain();
  delayGain.gain.value = 0.25;
  master.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(master);

  const noteFreqs: Record<string, number> = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
    G5: 783.99, A5: 880.00,
    G3: 196.00, F3: 174.61,
  };

  // Happy Birthday melody notes [note, duration(s), delay(s)]
  const melody: [string, number, number][] = [
    ['G4', 0.4, 0],
    ['G4', 0.2, 0.45],
    ['A4', 0.5, 0.7],
    ['G4', 0.5, 1.25],
    ['C5', 0.5, 1.8],
    ['B4', 0.8, 2.35],
    ['G4', 0.4, 3.4],
    ['G4', 0.2, 3.85],
    ['A4', 0.5, 4.1],
    ['G4', 0.5, 4.65],
    ['D5', 0.5, 5.2],
    ['C5', 0.8, 5.75],
    ['G4', 0.4, 6.8],
    ['G4', 0.2, 7.25],
    ['G5', 0.5, 7.5],
    ['E5', 0.5, 8.05],
    ['C5', 0.5, 8.6],
    ['B4', 0.4, 9.1],
    ['A4', 0.7, 9.55],
    ['F5', 0.4, 10.5],
    ['F5', 0.2, 10.95],
    ['E5', 0.5, 11.2],
    ['C5', 0.5, 11.75],
    ['D5', 0.5, 12.3],
    ['C5', 1.0, 12.85],
  ];

  const LOOP_DURATION = 14.5;

  const playNote = (freq: number, startTime: number, duration: number) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    // Envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.6, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.3, startTime + duration * 0.6);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(master);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);

    // Harmonic overtone
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 2;
    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
    gain2.gain.linearRampToValueAtTime(0, startTime + duration);
    osc2.connect(gain2);
    gain2.connect(master);
    osc2.start(startTime);
    osc2.stop(startTime + duration + 0.1);
  };

  let loopTimer: ReturnType<typeof setInterval>;
  let running = false;

  const startLoop = () => {
    if (running) return;
    running = true;
    const play = () => {
      if (!running) return;
      const now = audioCtx.currentTime;
      melody.forEach(([note, dur, del]) => {
        playNote(noteFreqs[note], now + del, dur);
      });
    };
    play();
    loopTimer = setInterval(play, LOOP_DURATION * 1000);
  };

  const stopLoop = () => {
    running = false;
    clearInterval(loopTimer);
  };

  return { startLoop, stopLoop, master };
}

interface AudioControllerProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export default function AudioController({ isPlaying, onToggle }: AudioControllerProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthRef = useRef<ReturnType<typeof createBirthdaySynth> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!synthRef.current) {
        synthRef.current = createBirthdaySynth(audioCtxRef.current);
      }
      synthRef.current.startLoop();
    } else {
      synthRef.current?.stopLoop();
    }
    return () => {};
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      synthRef.current?.stopLoop();
      audioCtxRef.current?.close();
    };
  }, []);

  return (
    <button
      onClick={onToggle}
      className="cursor-none glass flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:border-pink-400/50 transition-all duration-300"
      style={{
        boxShadow: isPlaying ? '0 0 20px rgba(244,114,182,0.3)' : 'none',
      }}
      title={isPlaying ? 'Mute music' : 'Play music'}
    >
      <span className="text-lg">{isPlaying ? '🎵' : '🔇'}</span>
      <span className="text-white/70 text-xs hidden sm:block">
        {isPlaying ? 'Music On' : 'Music Off'}
      </span>
      {isPlaying && (
        <div className="flex items-end gap-0.5 h-4">
          {[1, 2, 3, 2, 1].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-pink-400"
              style={{
                height: `${h * 4}px`,
                animation: `floatY ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
}
