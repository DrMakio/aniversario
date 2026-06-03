// App principal — primera persona, cielo de amanecer
const { useState: useStateApp, useEffect: useEffectApp, useCallback: useCallbackApp, useRef: useRefApp } = React;

const FLY_DURATION = 1100; // ms

function App() {
  // 'intro' → pantalla de entrada
  // 'sky'   → portales flotando alrededor
  // 'flying'→ animación de entrada al portal
  // 'memory'→ recuerdo abierto
  const [view, setView] = useStateApp('intro');
  const [introMounted, setIntroMounted] = useStateApp(true);
  const [currentId, setCurrentId] = useStateApp(null);
  const [hoveredId, setHoveredId] = useStateApp(null);
  const [flyingTo, setFlyingTo] = useStateApp(null);
  const flyTimer = useRefApp(0);
  const introTimer = useRefApp(0);

  const list = window.memories;

  const enterDream = () => {
    setView('sky');
    // Safety: desmonta el intro después del fade aunque la transición esté throttled
    clearTimeout(introTimer.current);
    introTimer.current = setTimeout(() => setIntroMounted(false), 1500);
  };

  const openMemory = useCallbackApp((id) => {
    setFlyingTo(id);
    setView('flying');
    clearTimeout(flyTimer.current);
    flyTimer.current = setTimeout(() => {
      setCurrentId(id);
      setView('memory');
    }, FLY_DURATION);
  }, []);

  const closeMemory = useCallbackApp(() => {
    setView('sky');
    setCurrentId(null);
    setFlyingTo(null);
  }, []);

  const goPrev = useCallbackApp(() => {
    setCurrentId((id) => {
      const i = list.findIndex((m) => m.id === id);
      return list[(i - 1 + list.length) % list.length].id;
    });
  }, [list]);

  const goNext = useCallbackApp(() => {
    setCurrentId((id) => {
      const i = list.findIndex((m) => m.id === id);
      return list[(i + 1) % list.length].id;
    });
  }, [list]);

  useEffectApp(() => () => {
    clearTimeout(flyTimer.current);
    clearTimeout(introTimer.current);
  }, []);

  const current = list.find((m) => m.id === currentId);
  const currentIndex = list.findIndex((m) => m.id === currentId);

  const showScene = view === 'sky' || view === 'flying';

  return (
    <div className={`stage stage--${view}`}>
      <window.DreamBackground />

      {/* Pantalla de entrada */}
      {introMounted && (
        <div className={`intro ${view !== 'intro' ? 'intro--out' : ''}`}>
          <div className="intro__inner">
            <div className="intro__kicker serif italic">para ti, Angie</div>
            <h1 className="intro__title serif">
              <span className="intro__line">Un sueño</span>
              <span className="intro__line intro__line--italic italic">hecho de recuerdos</span>
            </h1>
            <p className="intro__sub">
              Cierra los ojos un instante. Deja que los recuerdos floten cerca,
              y entra en cualquiera para volver a vivirlo.
            </p>
            <button className="intro__enter" onClick={enterDream}>
              <span className="intro__enter-ring" />
              <span className="intro__enter-label serif italic">entrar al sueño</span>
            </button>
          </div>
          <div className="intro__hint">12 recuerdos · mira alrededor · entra a una nube</div>
        </div>
      )}

      {/* Escena en primera persona */}
      {showScene && (
        <window.Scene
          memories={list}
          onOpen={openMemory}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
          flyingTo={flyingTo}
        />
      )}

      {/* Whisper del portal apuntado */}
      <div className={`whisper ${view === 'sky' && hoveredId !== null ? 'whisper--show' : ''}`}>
        {hoveredId !== null && (
          <>
            <span className="whisper__date serif italic">
              {list.find((m) => m.id === hoveredId)?.date}
            </span>
            <span className="whisper__title serif">
              {list.find((m) => m.id === hoveredId)?.title}
            </span>
          </>
        )}
      </div>

      {/* Velo blanco que aparece al volar dentro de la nube */}
      <div className={`fly-veil ${view === 'flying' ? 'fly-veil--in' : ''}`} />

      {/* Header sutil cuando estás en el cielo */}
      <div className={`top-bar ${view === 'sky' ? 'top-bar--show' : ''}`}>
        <div className="top-bar__mark serif italic">para Angie</div>
        <div className="top-bar__hint">arrastra para mirar · W A S D para moverte · entra en una nube</div>
      </div>

      {/* Vista del recuerdo */}
      {view === 'memory' && current && (
        <window.MemoryView
          memory={current}
          onClose={closeMemory}
          onPrev={goPrev}
          onNext={goNext}
          index={currentIndex}
          total={list.length}
        />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
