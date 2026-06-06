import { useState, useEffect, useRef, useCallback } from "react";
import ThreeScene from "./components/ThreeScene";
import ParticleCanvas from "./components/ParticleCanvas";
import CSSTree from "./components/CSSTree";
import PhotoCollage from "./components/PhotoCollage";
import BirthdayMessage from "./components/BirthdayMessage";
import AudioController from "./components/AudioController";
import LoadingScreen from "./components/LoadingScreen";

// Floating emoji elements
const FLOATERS = [
  "🌸",
  "💖",
  "✨",
  "🌟",
  "💫",
  "🎀",
  "🌺",
  "💝",
  "⭐",
  "🦋",
  "🌙",
  "💎",
];

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorExpanded, setCursorExpanded] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [celebrateCount, setCelebrateCount] = useState(0);
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  // Mouse tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      setMousePos({ x: nx, y: ny });
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Click handler
  const handleClick = useCallback((e: React.MouseEvent) => {
    setClickPos({ x: e.clientX, y: e.clientY });
    setTimeout(() => setClickPos(null), 100);
  }, []);

  // Scroll parallax
  const handleScroll = useCallback(() => {
    if (scrollRef.current) setScrollY(scrollRef.current.scrollTop);
  }, []);

  // Keyboard celebrate on spacebar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleCelebrate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPlaying]); // eslint-disable-line

  // Cursor expand on interactive elements
  const expandCursor = () => setCursorExpanded(true);
  const shrinkCursor = () => setCursorExpanded(false);

  const handleCelebrate = () => {
    setCelebrateCount((c) => c + 1);
    // Auto-start music
    if (!isPlaying) setIsPlaying(true);
  };

  // Parallax offset for content layers
  const parallaxY = scrollY * 0.3;

  return (
    <div
      className={`w-full h-screen relative overflow-hidden ${isNight ? "night-mode" : ""}`}
      onClick={handleClick}
    >
      {/* Loading Screen */}
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
      {/* Custom Cursor */}
      <div
        className={`cursor ${cursorExpanded ? "expanded" : ""}`}
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />
      <div
        className="cursor-dot"
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* === Background Gradient === */}
      <div
        className="fixed inset-0"
        style={{
          background: isNight
            ? "radial-gradient(ellipse at 20% 20%, #1a0533 0%, #0d0621 40%, #070310 100%)"
            : "radial-gradient(ellipse at 30% 10%, #3b0764 0%, #1e0b3d 30%, #0a0010 70%, #04000a 100%)",
          zIndex: 0,
        }}
      />

      {/* Gradient orbs for depth */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 0, pointerEvents: "none" }}
      >
        {/* Pink orb */}
        <div
          className="absolute rounded-full animate-pulse-glow"
          style={{
            width: "50vw",
            height: "50vw",
            background:
              "radial-gradient(circle, rgba(244,114,182,0.18) 0%, transparent 70%)",
            top: "-10vw",
            left: "-10vw",
            transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
            transition: "transform 0.5s ease-out",
          }}
        />
        {/* Purple orb */}
        <div
          className="absolute rounded-full animate-pulse-glow"
          style={{
            width: "45vw",
            height: "45vw",
            background:
              "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)",
            bottom: "-5vw",
            right: "-5vw",
            animationDelay: "1s",
            transform: `translate(${-mousePos.x * 15}px, ${-mousePos.y * 15}px)`,
            transition: "transform 0.5s ease-out",
          }}
        />
        {/* Gold orb center */}
        <div
          className="absolute rounded-full animate-pulse-glow"
          style={{
            width: "30vw",
            height: "30vw",
            background:
              "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)",
            top: "30%",
            left: "35%",
            animationDelay: "0.5s",
          }}
        />
        {/* Blue orb */}
        <div
          className="absolute rounded-full"
          style={{
            width: "35vw",
            height: "35vw",
            background:
              "radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)",
            top: "50%",
            right: "10%",
            transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`,
            transition: "transform 0.6s ease-out",
          }}
        />
      </div>

      {/* Three.js 3D Scene */}
      <ThreeScene mousePos={mousePos} isNight={isNight} />

      {/* Particle canvas */}
      <ParticleCanvas celebrateCount={celebrateCount} clickPos={clickPos} />

      {/* CSS Trees (foreground layer) */}
      <CSSTree side="left" />
      <CSSTree side="right" />

      {/* Floating emoji layer */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 12 }}>
        {FLOATERS.map((emoji, i) => (
          <div
            key={i}
            className="absolute text-2xl"
            style={{
              left: `${(i / FLOATERS.length) * 100}%`,
              top: `${10 + (i % 5) * 15}%`,
              opacity: 0.35 + (i % 3) * 0.1,
              fontSize: `${1 + (i % 3) * 0.5}rem`,
              animation: `floatY ${3 + (i % 3)}s ease-in-out ${i * 0.4}s infinite`,
              transform: `translateX(${mousePos.x * (5 + i * 1.5)}px) translateY(${mousePos.y * (3 + i)}px)`,
              transition: "transform 0.4s ease-out",
              filter: "drop-shadow(0 0 6px rgba(244,114,182,0.4))",
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* ===== Main Scrollable Content ===== */}
      <div
        ref={scrollRef}
        className="scroll-container content-layer"
        onScroll={handleScroll}
        style={{ position: "relative", zIndex: 20 }}
      >
        {/* ===== HERO SECTION ===== */}
        <section
          className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative"
          style={{ transform: `translateY(${-parallaxY * 0.1}px)` }}
        >
          {/* Top Controls Bar */}
          <div
            className="fixed top-4 right-4 flex gap-3 items-center"
            style={{ zIndex: 50 }}
          >
            <AudioController
              isPlaying={isPlaying}
              onToggle={() => setIsPlaying((p) => !p)}
            />
            <button
              onClick={() => setIsNight((n) => !n)}
              onMouseEnter={expandCursor}
              onMouseLeave={shrinkCursor}
              className="cursor-none glass flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:border-yellow-400/50 transition-all duration-300 text-sm text-white/70"
              style={{
                boxShadow: isNight ? "0 0 20px rgba(251,191,36,0.2)" : "none",
              }}
            >
              <span className="text-lg">{isNight ? "☀️" : "🌙"}</span>
              <span className="hidden sm:block">
                {isNight ? "Day" : "Night"}
              </span>
            </button>
          </div>

          {/* MAIN HERO CARD */}
          <div
            className="w-full max-w-3xl mx-auto animate-scaleIn"
            style={{ opacity: 0 }}
          >
            {/* Title Badge */}
            <div className="flex justify-center mb-6">
              <div
                className="glass rounded-full px-6 py-2 border border-pink-400/30"
                style={{ boxShadow: "0 0 30px rgba(244,114,182,0.2)" }}
              >
                <span
                  className="shimmer-text font-medium tracking-widest text-sm uppercase"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  ✦ A Special Day ✦
                </span>
              </div>
            </div>

            {/* Big Title */}
            <div className="text-center mb-8">
              <h1
                className="font-playfair font-bold leading-tight mb-2"
                style={{
                  fontSize: "clamp(2.5rem, 8vw, 6rem)",
                  fontStyle: "italic",
                }}
              >
                <span className="shimmer-text">Happy</span>
                <br />
                <span
                  className="text-white"
                  style={{
                    textShadow: "0 0 40px rgba(255,255,255,0.2)",
                  }}
                >
                  Birthday
                </span>
              </h1>
              <p
                className="font-dancing text-pink-300 text-glow-pink"
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  fontFamily: "'Dancing Script', cursive",
                }}
              >
                Noor-ul-Ain Ilyas 💖
              </p>
            </div>

            {/* Hero Glass Card */}
            <div
              className="glass-strong rounded-3xl px-6 py-16 md:px-10 md:py-20 glow-purple relative overflow-hidden animate-fadeInUp"
              style={{
                opacity: 0,
                animationDelay: "0.4s",
                transform: `perspective(1200px) rotateX(${mousePos.y * 2}deg) rotateY(${mousePos.x * 2}deg)`,
                transition: "transform 0.2s ease-out",
              }}
            >
              {/* Inner glow accent */}
              <div
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(244,114,182,0.06) 0%, rgba(167,139,250,0.06) 50%, rgba(96,165,250,0.06) 100%)",
                }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(244,114,182,0.5), rgba(167,139,250,0.5), transparent)",
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(96,165,250,0.3), transparent)",
                }}
              />

              {/* Birthday date ring */}
              <div className="flex justify-center mb-6  py-5">
                <div className="relative">
                  <div
                    className="w-24 h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(244,114,182,0.2), rgba(167,139,250,0.2))",
                      border: "2px solid rgba(244,114,182,0.4)",
                      boxShadow:
                        "0 0 30px rgba(244,114,182,0.3), inset 0 0 20px rgba(167,139,250,0.1)",
                    }}
                  >
                    <span className="text-3xl animate-heartbeat">🎂</span>
                    <span className="text-white/60 text-xs mt-1 tracking-widest">
                      TODAY
                    </span>
                  </div>
                  {/* Orbit ring */}
                  <div
                    className="absolute inset-0 rounded-full animate-spin-slow"
                    style={{
                      border: "1px dashed rgba(251,191,36,0.3)",
                      transform: "scale(1.3)",
                    }}
                  />
                </div>
              </div>

              {/* Sub text */}
              <div className="text-center mb-4">
                <p
                  className="text-white/50 text-sm tracking-widest uppercase"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Celebrating you today & always
                </p>
              </div>

              {/* Celebrate Button */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCelebrate();
                  }}
                  onMouseEnter={expandCursor}
                  onMouseLeave={shrinkCursor}
                  className="btn-celebrate cursor-none text-white font-semibold px-8 py-4 rounded-2xl text-base tracking-wide"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                >
                  🎉 Celebrate! 🎉
                </button>
              </div>

              {/* Corner decorations */}
              {[
                "top-3 left-4",
                "top-3 right-4",
                "bottom-3 left-4",
                "bottom-3 right-4",
              ].map((pos, i) => (
                <span
                  key={i}
                  className={`absolute ${pos} text-pink-400/40 text-sm animate-pulse-glow`}
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  ✦
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PHOTO COLLAGE SECTION ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-3xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-10">
              <h2
                className="font-playfair text-white font-semibold mb-2"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  textShadow: "0 0 30px rgba(167,139,250,0.4)",
                }}
              >
                Precious Moments
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div
                  className="h-px w-20"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(167,139,250,0.5))",
                  }}
                />
                <span className="text-purple-300 text-sm tracking-widest">
                  ✦ A MEMORY COLLAGE ✦
                </span>
                <div
                  className="h-px w-20"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(167,139,250,0.5), transparent)",
                  }}
                />
              </div>
            </div>

            <PhotoCollage />
          </div>
        </section>

        {/* ===== BIRTHDAY MESSAGE SECTION ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-2xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-10">
              <h2
                className="font-playfair text-white font-semibold mb-2"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  textShadow: "0 0 30px rgba(244,114,182,0.4)",
                }}
              >
                From the Heart
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div
                  className="h-px w-20"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(244,114,182,0.5))",
                  }}
                />
                <span className="text-pink-300 text-sm tracking-widest">
                  ✦ BIRTHDAY WISHES ✦
                </span>
                <div
                  className="h-px w-20"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(244,114,182,0.5), transparent)",
                  }}
                />
              </div>
            </div>

            {/* Message Card */}
            <div
              className="glass-strong rounded-3xl p-8 md:p-12 glow-pink relative overflow-hidden"
              style={{
                transform: `perspective(1000px) rotateX(${mousePos.y * 1.5}deg) rotateY(${mousePos.x * 1.5}deg)`,
                transition: "transform 0.3s ease-out",
              }}
            >
              {/* Decorative gradient */}
              <div
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(244,114,182,0.07) 0%, rgba(167,139,250,0.05) 100%)",
                }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(244,114,182,0.6), rgba(251,191,36,0.4), transparent)",
                }}
              />

              {/* Quote mark decoration */}
              <div
                className="absolute top-4 left-6 text-6xl font-playfair text-pink-400/15 font-bold leading-none select-none"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                "
              </div>
              <div
                className="absolute bottom-4 right-6 text-6xl font-playfair text-pink-400/15 font-bold leading-none select-none rotate-180"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                "
              </div>

              <div className="relative">
                <BirthdayMessage />
              </div>
            </div>
          </div>
        </section>

        {/* ===== FINAL SECTION ===== */}
        <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
          <div className="max-w-lg mx-auto">
            {/* Animated ring decoration */}
            <div className="relative flex justify-center mb-8">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle, rgba(244,114,182,0.15), rgba(167,139,250,0.1))",
                  border: "1px solid rgba(244,114,182,0.3)",
                  boxShadow: "0 0 40px rgba(244,114,182,0.2)",
                }}
              >
                <span className="text-5xl animate-heartbeat">💖</span>
              </div>
              <div
                className="absolute inset-0 m-auto w-44 h-44 rounded-full animate-spin-slow"
                style={{ border: "1px dashed rgba(244,114,182,0.2)" }}
              />
              <div
                className="absolute inset-0 m-auto w-56 h-56 rounded-full animate-spin-slow"
                style={{
                  border: "1px dashed rgba(167,139,250,0.15)",
                  animationDirection: "reverse",
                }}
              />
            </div>

            <h3
              className="font-dancing text-3xl text-white/90 mb-3"
              style={{
                fontFamily: "'Dancing Script', cursive",
                textShadow: "0 0 20px rgba(244,114,182,0.4)",
              }}
            >
              You make the world brighter ✨
            </h3>
            <p
              className="text-white/50 text-sm tracking-wide mb-8"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Every moment with you is a gift. Here's to many more adventures
              together.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                "🌸 Always Loved",
                "✨ Forever Cherished",
                "💫 Truly Special",
                "🎉 So Celebrated",
              ].map((tag, i) => (
                <span
                  key={i}
                  className="glass px-4 py-2 rounded-full text-white/60 text-xs border border-white/10 animate-fadeInUp"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Final celebrate */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCelebrate();
              }}
              onMouseEnter={expandCursor}
              onMouseLeave={shrinkCursor}
              className="btn-celebrate cursor-none text-white font-semibold px-10 py-4 rounded-2xl text-lg tracking-wide"
              style={{
                fontFamily: "Inter, sans-serif",
                textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            >
              🎊 One More Celebration! 🎊
            </button>

            <p
              className="text-white/20 text-xs mt-12 tracking-widest"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Made with 💖 just for you
            </p>
          </div>
        </section>
      </div>

      {/* Vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 18,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
  );
}
