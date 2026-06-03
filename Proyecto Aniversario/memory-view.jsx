// Vista de un recuerdo: foto + nota + navegación
const { useEffect: useEffectMem, useState: useStateMem } = React;

function MemoryView({ memory, onClose, onPrev, onNext, index, total }) {
  const [entered, setEntered] = useStateMem(false);

  useEffectMem(() => {
    const t = setTimeout(() => setEntered(true), 30);
    return () => clearTimeout(t);
  }, [memory.id]);

  useEffectMem(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div className={`memory-view ${entered ? 'memory-view--in' : ''}`}>
      <div className="memory-view__scrim" onClick={onClose} />

      <button className="memory-view__close" onClick={onClose} aria-label="Cerrar">
        <span className="memory-view__close-x">×</span>
        <span className="memory-view__close-label">volver al sueño</span>
      </button>

      <div className="memory-view__counter serif italic">
        {String(index + 1).padStart(2, '0')} <span>/ {String(total).padStart(2, '0')}</span>
      </div>

      <button className="memory-view__nav memory-view__nav--prev" onClick={onPrev} aria-label="Recuerdo anterior">
        <span>‹</span>
      </button>
      <button className="memory-view__nav memory-view__nav--next" onClick={onNext} aria-label="Siguiente recuerdo">
        <span>›</span>
      </button>

      <div className="memory-card" key={memory.id}>
        <div
          className="memory-card__photo"
          style={{
            background: memory.photo
              ? `center/cover no-repeat url(${memory.photo})`
              : `linear-gradient(135deg, oklch(0.92 0.05 ${memory.hue}) 0%, oklch(0.82 0.08 ${memory.hue}) 45%, oklch(0.68 0.08 ${memory.hue + 25}) 100%)`,
          }}
        >
          {!memory.photo && (
            <div className="memory-card__placeholder">
              <span className="memory-card__placeholder-line" />
              <span className="memory-card__placeholder-hint">añade aquí una foto</span>
            </div>
          )}
          <div className="memory-card__photo-shade" />
        </div>

        <div className="memory-card__body">
          <div className="memory-card__date serif italic">{memory.date}</div>
          <h2 className="memory-card__title serif">{memory.title}</h2>
          <div className="memory-card__divider">
            <span /><span className="dot" /><span />
          </div>
          <p className="memory-card__note">{memory.note}</p>
        </div>
      </div>
    </div>
  );
}

window.MemoryView = MemoryView;
