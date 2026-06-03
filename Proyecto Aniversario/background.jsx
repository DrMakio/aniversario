// Cielo onírico al amanecer: gradiente celeste, sol bajo, nubes lejanas con parallax
const { useState: useSkyState, useEffect: useSkyEffect, useMemo: useSkyMemo, useRef: useSkyRef } = React;

// Una sola nube SVG reusable, blanca y suave
function SkyCloud({ style }) {
  return (
    <svg className="sky-cloud" viewBox="0 0 240 130" style={style} aria-hidden="true">
      <defs>
        <radialGradient id="sky-cloud-fill" cx="50%" cy="55%">
          <stop offset="0%" stopColor="oklch(1 0 0 / 0.95)" />
          <stop offset="60%" stopColor="oklch(0.97 0.02 50 / 0.7)" />
          <stop offset="100%" stopColor="oklch(0.92 0.04 30 / 0)" />
        </radialGradient>
      </defs>
      <path
        d="M 28 95 C 6 95, -6 70, 18 60 C 14 38, 55 32, 68 50 C 64 22, 118 14, 134 42 C 144 24, 188 32, 195 56 C 218 56, 232 82, 208 96 C 222 118, 175 132, 156 120 C 142 142, 90 142, 76 120 C 50 130, 22 120, 28 95 Z"
        fill="url(#sky-cloud-fill)"
      />
    </svg>
  );
}

function DreamBackground() {
  const layers = useSkyMemo(() => {
    // 3 capas de nubes distantes a distinta velocidad y altura
    return [
      // capa lejana (pequeñas, lentas, casi en el horizonte)
      ...Array.from({ length: 7 }, (_, i) => ({
        layer: 'far', i,
        top: 32 + Math.random() * 22,
        size: 10 + Math.random() * 6,
        opacity: 0.55 + Math.random() * 0.25,
        start: Math.random() * 100,
        duration: 220 + Math.random() * 80,
      })),
      // capa media
      ...Array.from({ length: 5 }, (_, i) => ({
        layer: 'mid', i,
        top: 18 + Math.random() * 30,
        size: 16 + Math.random() * 10,
        opacity: 0.65 + Math.random() * 0.2,
        start: Math.random() * 100,
        duration: 160 + Math.random() * 60,
      })),
      // capa cercana (grandes, más rápidas)
      ...Array.from({ length: 4 }, (_, i) => ({
        layer: 'near', i,
        top: 8 + Math.random() * 35,
        size: 26 + Math.random() * 14,
        opacity: 0.75 + Math.random() * 0.2,
        start: Math.random() * 100,
        duration: 120 + Math.random() * 50,
      })),
    ];
  }, []);

  const motes = useSkyMemo(() => {
    return Array.from({ length: 80 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: -Math.random() * 36,
      duration: 18 + Math.random() * 32,
      drift: (Math.random() - 0.5) * 90,
      opacity: 0.2 + Math.random() * 0.55,
    }));
  }, []);

  const drops = useSkyMemo(() => {
    return Array.from({ length: 42 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 5,
      blur: Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.3,
      delay: -Math.random() * 26,
      duration: 18 + Math.random() * 26,
      drift: (Math.random() - 0.5) * 30,
    }));
  }, []);

  return (
    <div className="sky-bg" aria-hidden="true">
      {/* Gradiente del cielo: amanecer suave */}
      <div className="sky-bg__gradient" />
      {/* Halo del sol bajo */}
      <div className="sky-bg__sun" />
      {/* Capas de nubes distantes */}
      <div className="sky-bg__clouds">
        {layers.map((c, idx) => (
          <div
            key={`${c.layer}-${c.i}`}
            className={`sky-cloud-track sky-cloud-track--${c.layer}`}
            style={{
              top: `${c.top}%`,
              animationDuration: `${c.duration}s`,
              animationDelay: `${-c.duration * (c.start / 100)}s`,
              opacity: c.opacity,
            }}
          >
            <SkyCloud
              style={{
                width: `${c.size}vmax`,
                filter: c.layer === 'far' ? 'blur(2px)' : c.layer === 'mid' ? 'blur(0.6px)' : 'none',
              }}
            />
          </div>
        ))}
      </div>
      <div className="sky-bg__drops">
        {drops.map((p, i) => (
          <span
            key={i}
            className="sky-drop"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              filter: `blur(${p.blur}px)`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity,
              '--drift': `${p.drift}px`,
            }}
          />
        ))}
      </div>
      {/* Partículas de polen/luz */}
      <div className="sky-bg__motes">
        {motes.map((p, i) => (
          <span
            key={i}
            className="mote"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--drift': `${p.drift}px`,
              '--peak-opacity': p.opacity,
            }}
          />
        ))}
      </div>
      {/* Viñeta sutil */}
      <div className="sky-bg__vignette" />
    </div>
  );
}

window.DreamBackground = DreamBackground;
