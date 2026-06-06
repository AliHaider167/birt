import { useRef, useState } from "react";
import pic1 from "../pics/pic1.jpeg";
import pic2 from "../pics/pic2.jpeg";
import pic3 from "../pics/pic3.jpeg";
import pic4 from "../pics/pic4.jpeg";
import pic5 from "../pics/pic5.jpeg";
import pic6 from "../pics/pic6.jpeg";

// Procedurally generated "photo" canvases with pastel gradients
const PHOTO_THEMES = [
  { bg: ["#f472b6", "#a78bfa"], image: pic1, label: "Sweet Memories" },
  { bg: ["#fbbf24", "#f87171"], image: pic2, label: "Birthday Joy" },
  { bg: ["#60a5fa", "#a78bfa"], image: pic3, label: "Magical Moments", position: "object-top" },
  { bg: ["#34d399", "#60a5fa"], image: pic4, label: "Nature & Love" },
  { bg: ["#fb7185", "#fbbf24"], image: pic5, label: "Golden Days" },
  { bg: ["#c4b5fd", "#f472b6"], image: pic6, label: "Dreamy Nights" },
];

interface FrameProps {
  theme: (typeof PHOTO_THEMES)[0];
  delay: number;
  index: number;
}

function PhotoFrame({ theme, delay, index }: FrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -12, y: dx * 12 });
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (touch.clientX - cx) / (rect.width / 2);
    const dy = (touch.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -8, y: dx * 8 });
  };

  return (
    <div
      ref={frameRef}
      className="photo-frame relative cursor-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setTilt({ x: 0, y: 0 });
        setHovered(false);
      }}
      onMouseEnter={() => setHovered(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? 1.06 : 1})`,
        transition: hovered
          ? "transform 0.1s ease-out"
          : "transform 0.5s ease-out",
        animationDelay: `${delay}s`,
        opacity: 0,
        animation: `fadeInUp 0.7s ease-out ${delay}s forwards`,
      }}
    >
      {/* Outer glow frame */}
      <div
        className="rounded-2xl p-[2px] relative"
        style={{
          background: `linear-gradient(135deg, ${theme.bg[0]}, ${theme.bg[1]}, ${theme.bg[0]})`,
          boxShadow: hovered
            ? `0 0 30px ${theme.bg[0]}88, 0 0 60px ${theme.bg[1]}44, 0 20px 40px rgba(0,0,0,0.4)`
            : `0 0 15px ${theme.bg[0]}44, 0 10px 30px rgba(0,0,0,0.3)`,
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Inner card */}
        <div
          className="glass rounded-2xl overflow-hidden relative"
          style={{ minHeight: 160 }}
        >
          {/* Gradient bg */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.bg[0]}33, ${theme.bg[1]}22)`,
            }}
          />
          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Photo content */}
          <div
            className="relative p-2 flex flex-col items-center gap-2"
            style={{ minHeight: 180 }}
          >
            {/* Image display */}
            <div className="w-full aspect-square relative rounded-xl overflow-hidden shadow-inner">
              <img
                src={theme.image}
                alt={theme.label}
                className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${theme.position || "object-center"}`}
              />
            </div>

            {/* Label */}
            <p
              className="text-xs font-bold mt-1 text-white/90 tracking-wider uppercase drop-shadow-md"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {theme.label}
            </p>

            {/* Sparkle corners */}
            {[
              "top-2 left-2",
              "top-2 right-2",
              "bottom-2 left-2",
              "bottom-2 right-2",
            ].map((pos, j) => (
              <span
                key={j}
                className={`absolute ${pos} text-xs opacity-60`}
                style={{ animationDelay: `${j * 0.4}s` }}
              >
                ✦
              </span>
            ))}
          </div>

          {/* Hover shine sweep */}
          {hovered && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
                animation: "shimmer 1s ease-out",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function PhotoCollage() {
  return (
    <div className="photo-grid w-full max-w-2xl mx-auto">
      {PHOTO_THEMES.map((theme, i) => (
        <PhotoFrame key={i} theme={theme} delay={0.2 + i * 0.15} index={i} />
      ))}
    </div>
  );
}
