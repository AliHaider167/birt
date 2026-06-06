// CSS-based 3D trees as overlay decoration (complements Three.js trees)
export default function CSSTree({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  const flip = isLeft ? '' : 'scaleX(-1)';

  return (
    <div
      className="fixed bottom-0 pointer-events-none"
      style={{
        [isLeft ? 'left' : 'right']: '-20px',
        zIndex: 15,
        transform: `${flip}`,
        transformOrigin: 'bottom center',
      }}
    >
      {/* Back tree - small */}
      <div
        className={isLeft ? 'sway-left' : 'sway-right'}
        style={{
          position: 'absolute',
          bottom: 0,
          left: '-60px',
          transformOrigin: 'bottom center',
          opacity: 0.5,
        }}
      >
        <TreeSVG scale={0.65} hue={isLeft ? 140 : 150} />
      </div>
      {/* Main tree */}
      <div
        className={isLeft ? 'sway-left' : 'sway-right'}
        style={{ transformOrigin: 'bottom center', opacity: 0.85 }}
      >
        <TreeSVG scale={1} hue={isLeft ? 145 : 155} />
      </div>
    </div>
  );
}

function TreeSVG({ scale, hue }: { scale: number; hue: number }) {
  const w = 140 * scale;
  const h = 320 * scale;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 140 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Trunk */}
      <rect x="58" y="240" width="24" height="80" rx="6" fill={`hsl(${30}, 50%, 28%)`} />
      {/* Root spread */}
      <ellipse cx="70" cy="320" rx="28" ry="6" fill={`hsl(${30}, 40%, 22%)`} />

      {/* Layer 1 - bottom wide */}
      <ellipse cx="70" cy="230" rx="66" ry="36" fill={`hsl(${hue}, 52%, 24%)`} />
      {/* Layer 2 */}
      <ellipse cx="70" cy="195" rx="54" ry="30" fill={`hsl(${hue}, 55%, 30%)`} />
      {/* Layer 3 */}
      <ellipse cx="70" cy="162" rx="44" ry="26" fill={`hsl(${hue}, 58%, 34%)`} />
      {/* Layer 4 */}
      <ellipse cx="70" cy="132" rx="34" ry="22" fill={`hsl(${hue}, 62%, 38%)`} />
      {/* Layer 5 - top */}
      <ellipse cx="70" cy="105" rx="24" ry="18" fill={`hsl(${hue}, 65%, 44%)`} />
      {/* Tip */}
      <ellipse cx="70" cy="82" rx="14" ry="14" fill={`hsl(${hue}, 68%, 50%)`} />

      {/* Highlight streaks */}
      <ellipse cx="55" cy="200" rx="12" ry="8" fill={`hsl(${hue}, 60%, 55%)`} opacity="0.25" />
      <ellipse cx="80" cy="150" rx="10" ry="6" fill={`hsl(${hue}, 60%, 55%)`} opacity="0.2" />
      <ellipse cx="65" cy="110" rx="8" ry="5" fill={`hsl(${hue}, 65%, 60%)`} opacity="0.22" />

      {/* Glowing fruit / flowers */}
      {[
        [40, 215], [100, 210], [30, 175], [110, 170],
        [55, 140], [90, 135], [50, 105], [88, 100],
      ].map(([fx, fy], i) => (
        <circle
          key={i}
          cx={fx}
          cy={fy}
          r={i % 2 === 0 ? 4 : 3}
          fill={i % 3 === 0 ? '#f472b6' : i % 3 === 1 ? '#fbbf24' : '#c4b5fd'}
          opacity="0.7"
        />
      ))}
    </svg>
  );
}
