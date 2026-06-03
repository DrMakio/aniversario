// Escena en primera persona: portales-nube flotando alrededor del observador
const { useState: useSceneState, useEffect: useSceneEffect, useRef: useSceneRef, useMemo: useSceneMemo } = React;

// Path de la silueta de nube reusada por todos los portales
const CLOUD_PATH =
  "M 30 105 C 5 108, -8 78, 18 66 C 12 38, 58 30, 72 52 C 66 22, 122 12, 138 44 C 148 22, 192 30, 198 58 C 224 58, 240 88, 214 104 C 230 130, 178 148, 158 132 C 144 156, 88 158, 74 132 C 48 144, 18 130, 30 105 Z";

// Posiciones 3D de los 12 portales alrededor de la cámara (origen 0,0,0)
// x,y en px; z negativo = más lejos. Distribuidos en una semiesfera amplia.
const PORTALS_3D = [
  { x: -680, y: -140, z: -1100 },
  { x:  420, y: -200, z:  -950 },
  { x: -180, y:    0, z: -1350 },
  { x:  760, y:   80, z: -1250 },
  { x: -560, y:  240, z: -1050 },
  { x:  220, y:  280, z: -1150 },
  { x: -880, y:  -20, z: -1450 },
  { x:  900, y:  340, z: -1550 },
  { x:   80, y: -280, z: -1500 },
  { x:  600, y: -380, z: -1350 },
  { x: -320, y:  400, z: -1550 },
  { x:  -40, y:  150, z:  -850 },
];
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
function CloudPortal({ memory, index, pos, onOpen, onHover, onLeave, isHovered, flyingTo, fading }) {
  const cid = `cloud-${memory.id}`;
  const gid = `cloud-grad-${memory.id}`;
  const hid = `cloud-highlight-${memory.id}`;
  const sid = `cloud-soft-${memory.id}`;
  const fid = `cloud-blur-${memory.id}`;

  const isFlying = flyingTo === memory.id;
  // Suavidad de la flotación: cada portal con duración y delay únicos
  const floatDur = 14 + (index % 5) * 2.4;
  const floatDelay = -((index * 1.7) % floatDur);

  return (
    <button
      type="button"
      className={`portal ${isHovered ? 'portal--hover' : ''} ${isFlying ? 'portal--flying' : ''} ${fading && !isFlying ? 'portal--fade' : ''}`}
      onMouseEnter={() => onHover(memory.id)}
      onMouseLeave={onLeave}
      onClick={() => onOpen(memory.id)}
      aria-label={`Entrar al recuerdo: ${memory.title}`}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)`,
        '--float-dur': `${floatDur}s`,
        '--float-delay': `${floatDelay}s`,
        '--drift-x': `${pos.driftX}px`,
        '--drift-y': `${pos.driftY}px`,
        '--drift-z': `${pos.driftZ}px`,
      }}
    >
      <span className="portal__float">
        <svg
          className="portal__svg"
          viewBox="0 0 240 170"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <clipPath id={cid}>
              <path d={CLOUD_PATH} />
            </clipPath>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor={`oklch(0.94 0.05 ${memory.hue})`} />
              <stop offset="55%"  stopColor={`oklch(0.82 0.07 ${memory.hue + 10})`} />
              <stop offset="100%" stopColor={`oklch(0.72 0.06 ${memory.hue + 30})`} />
            </linearGradient>
            <radialGradient id={sid} cx="50%" cy="35%" r="95%">
              <stop offset="0%" stopColor="oklch(1 0 0 / 0.75)" />
              <stop offset="45%" stopColor={`oklch(0.92 0.07 ${memory.hue} / 0.45)`} />
              <stop offset="100%" stopColor={`oklch(0.78 0.04 ${memory.hue + 25} / 0.08)`} />
            </radialGradient>
            <radialGradient id={hid} cx="35%" cy="30%" r="65%">
              <stop offset="0%"   stopColor="oklch(1 0 0 / 0.55)" />
              <stop offset="100%" stopColor="oklch(1 0 0 / 0)" />
            </radialGradient>
            <filter id={fid}>
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          {/* Aura blanca alrededor del portal */}
          <ellipse className="portal__halo" cx="120" cy="90" rx="160" ry="105"
            fill="oklch(1 0 0 / 0.6)" />

          {/* Imagen / placeholder recortada a forma de nube */}
          <g clipPath={`url(#${cid})`}>
            {memory.photo ? (
              <image
                href={memory.photo}
                x="-10" y="-10" width="260" height="190"
                preserveAspectRatio="xMidYMid slice"
                className="portal__image"
              />
            ) : (
              <rect width="240" height="170" fill={`url(#${gid})`} />
            )}
            {/* Velo que da el difuminado de "recuerdo" */}
            <rect className="portal__veil" width="240" height="170"
                  fill="oklch(0.97 0.02 50 / 0.28)" />
            {/* Reflejo de luz interno */}
            <ellipse cx="85" cy="55" rx="80" ry="40" fill={`url(#${hid})`} />
          </g>

          {/* Contorno suave de la nube */}
          <path d={CLOUD_PATH}
                fill={`url(#${sid})`}
                filter={`url(#${fid})`}
                opacity="0.9"
                stroke="none" />
        </svg>

        {/* Pequeños mechones extra que asoman al hacer hover */}
        <span className="portal__wisp portal__wisp--a" />
        <span className="portal__wisp portal__wisp--b" />
        <span className="portal__wisp portal__wisp--c" />

        <span className="portal__label serif italic">{memory.date}</span>
      </span>
    </button>
  );
}

function Scene({ memories, onOpen, hoveredId, setHoveredId, flyingTo }) {
  // Rotación de mirada con el cursor y movimiento de cámara con teclas WASD
  const [look, setLook] = useSceneState({ rx: 0, ry: 0, x: 0, y: 0, z: 0 });
  const sceneRef = useSceneRef(null);
  const targetRef = useSceneRef({ rx: 0, ry: 0 });
  const camRef = useSceneRef({ x: 0, y: 0, z: 0 });
  const keysRef = useSceneRef({});
  const rafRef = useSceneRef(0);
  const overlayGas = useSceneMemo(() => Array.from({ length: 10 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    width: 60 + Math.random() * 90,
    height: 40 + Math.random() * 80,
    opacity: 0.08 + Math.random() * 0.12,
    blur: 12 + Math.random() * 16,
    duration: 18 + Math.random() * 20,
    delay: -Math.random() * 18,
    driftX: (Math.random() - 0.5) * 60,
    driftY: (Math.random() - 0.5) * 40,
  })), []);
  const overlayParticles = useSceneMemo(() => Array.from({ length: 24 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 4 + Math.random() * 12,
    blur: 1 + Math.random() * 4,
    opacity: 0.08 + Math.random() * 0.14,
    duration: 12 + Math.random() * 14,
    delay: -Math.random() * 12,
    driftX: (Math.random() - 0.5) * 26,
    driftY: (Math.random() - 0.5) * 22,
  })), []);
  const overlayDrops = useSceneMemo(() => Array.from({ length: 10 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    width: 2 + Math.random() * 3,
    height: 12 + Math.random() * 18,
    opacity: 0.06 + Math.random() * 0.12,
    duration: 7 + Math.random() * 10,
    delay: -Math.random() * 8,
    driftY: 8 + Math.random() * 14,
  })), []);

  const updateTargetFromPointer = (e) => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);

    targetRef.current = {
      ry: clamp((dx / rect.width) * 100, -140, 140),
      rx: clamp((-dy / rect.height) * 42, -34, 34),
    };
  };

  useSceneEffect(() => {
    sceneRef.current?.focus();

    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) {
        keysRef.current[k] = true;
        e.preventDefault();
      }
    };
    const onKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let last = { rx: 0, ry: 0, x: 0, y: 0, z: 0 };
    const tick = () => {
      const t = targetRef.current;
      const cam = camRef.current;
      const speed = 9;
      const rad = cam.yaw ? cam.yaw * Math.PI / 180 : 0;
      const fx = Math.sin(rad);
      const fz = -Math.cos(rad);
      const rx = Math.cos(rad);
      const rz = Math.sin(rad);

      if (keysRef.current['w'] || keysRef.current['arrowup']) {
        cam.x += fx * speed;
        cam.z += fz * speed;
      }
      if (keysRef.current['s'] || keysRef.current['arrowdown']) {
        cam.x -= fx * speed;
        cam.z -= fz * speed;
      }
      if (keysRef.current['a'] || keysRef.current['arrowleft']) {
        cam.x -= rx * speed;
        cam.z -= rz * speed;
      }
      if (keysRef.current['d'] || keysRef.current['arrowright']) {
        cam.x += rx * speed;
        cam.z += rz * speed;
      }

      if (cam.yaw === undefined) cam.yaw = 0;
      if (cam.pitch === undefined) cam.pitch = 0;
      cam.yaw = t.ry;
      cam.pitch = t.rx;

      last = {
        rx: last.rx + (t.rx - last.rx) * 0.04,
        ry: last.ry + (t.ry - last.ry) * 0.04,
        x: last.x + (cam.x - last.x) * 0.10,
        y: last.y + (cam.y - last.y) * 0.10,
        z: last.z + (cam.z - last.z) * 0.10,
      };
      setLook({ rx: last.rx, ry: last.ry, x: last.x, y: last.y, z: last.z });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    sceneRef.current?.focus();
  };

  const portalPositions = useSceneMemo(() => memories.map((m, i) => {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 850 + Math.random() * 620;
    const x = Math.sin(phi) * Math.cos(theta) * radius;
    const y = Math.cos(phi) * radius * 0.55;
    const z = Math.sin(phi) * Math.sin(theta) * radius;
    return {
      x,
      y,
      z,
      driftX: (Math.random() - 0.5) * 40,
      driftY: (Math.random() - 0.5) * 64,
      driftZ: (Math.random() - 0.5) * 46,
    };
  }), [memories.length]);

  const flyingPortal = flyingTo !== null ? memories.find(m => m.id === flyingTo) : null;
  const flyingPos = flyingPortal ? portalPositions[memories.findIndex(m => m.id === flyingPortal.id)] : null;

  // Cuando estás volando hacia un portal, traslada toda la escena hacia él
  const panX = look.ry * 14;
  const panY = look.rx * 18;
  let camTransform = `translate3d(${panX - look.x}px, ${panY - look.y}px, ${-look.z}px) rotateX(${look.rx}deg) rotateY(${look.ry}deg)`;
  if (flyingPos) {
    camTransform = `translate3d(${panX - flyingPos.x}px, ${panY - flyingPos.y}px, ${-flyingPos.z - 220}px) rotateX(${look.rx * 0.3}deg) rotateY(${look.ry * 0.3}deg)`;
  }

  return (
    <div
      className="scene"
      ref={sceneRef}
      tabIndex={0}
      onPointerMove={updateTargetFromPointer}
      onPointerDown={handlePointerDown}
      onClick={() => sceneRef.current?.focus()}
    >
      <div
        className={`scene__camera ${flyingTo !== null ? 'scene__camera--flying' : ''}`}
        style={{ transform: camTransform }}
      >
        {memories.map((m, i) => (
          <CloudPortal
            key={m.id}
            memory={m}
            index={i}
            pos={portalPositions[i]}
            onOpen={onOpen}
            onHover={setHoveredId}
            onLeave={() => setHoveredId(null)}
            isHovered={hoveredId === m.id}
            flyingTo={flyingTo}
            fading={flyingTo !== null}
          />
        ))}
      </div>
      <div className="camera-overlay" aria-hidden="true">
        <span className="camera-sun-glow" />
        <span className="camera-sun-beam" />
        {overlayGas.map((p, index) => (
          <span
            key={`g-${index}`}
            className="overlay-gas"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.width}px`,
              height: `${p.height}px`,
              opacity: p.opacity,
              filter: `blur(${p.blur}px)`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--drift-x': `${p.driftX}px`,
              '--drift-y': `${p.driftY}px`,
            }}
          />
        ))}
        {overlayParticles.map((p, index) => (
          <span
            key={`p-${index}`}
            className="overlay-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              filter: `blur(${p.blur}px)`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--drift-x': `${p.driftX}px`,
              '--drift-y': `${p.driftY}px`,
            }}
          />
        ))}
        {overlayDrops.map((drop, index) => (
          <span
            key={`d-${index}`}
            className="overlay-drop"
            style={{
              left: `${drop.left}%`,
              top: `${drop.top}%`,
              width: `${drop.width}px`,
              height: `${drop.height}px`,
              opacity: drop.opacity,
              animationDuration: `${drop.duration}s`,
              animationDelay: `${drop.delay}s`,
              '--drift-y': `${drop.driftY}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

window.Scene = Scene;
