import { useMemo } from "react";

export function ParticleField({ count = 40, className = "" }: { count?: number; className?: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 20,
        duration: 15 + Math.random() * 25,
        color: ["#00E5FF", "#7B61FF", "#00FFA3"][Math.floor(Math.random() * 3)],
      })),
    [count],
  );
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            animation: `particle-float ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function NetworkMesh({ className = "" }: { className?: string }) {
  const nodes = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      })),
    [],
  );
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden>
      <defs>
        <linearGradient id="meshLine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7B61FF" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {nodes.map((n, i) =>
        nodes.slice(i + 1).map((m, j) => {
          const d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d > 28) return null;
          return (
            <line
              key={`${i}-${j}`}
              x1={`${n.x}%`}
              y1={`${n.y}%`}
              x2={`${m.x}%`}
              y2={`${m.y}%`}
              stroke="url(#meshLine)"
              strokeWidth="0.6"
            />
          );
        }),
      )}
      {nodes.map((n) => (
        <circle key={n.id} cx={`${n.x}%`} cy={`${n.y}%`} r="2.2" fill="#00E5FF">
          <animate attributeName="opacity" values="0.3;1;0.3" dur={`${3 + (n.id % 4)}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

export function OrbitalLoader({ size = 60 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border border-[#00E5FF]/40 animate-spin-slow" />
      <div
        className="absolute inset-2 rounded-full border border-[#7B61FF]/40"
        style={{ animation: "spin-slow 12s linear infinite reverse" }}
      />
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] glow-cyan animate-pulse-ring" />
    </div>
  );
}