import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export type LightboxPhoto = { src: string; alt: string };

type Props = {
  photos: LightboxPhoto[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

/**
 * Fullscreen photo lightbox with keyboard (←/→/Esc) and touch-swipe
 * navigation. Renders via portal so it escapes any transformed ancestors.
 */
export function PhotoLightbox({ photos, index, onClose, onIndexChange }: Props) {
  const count = photos.length;
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const [drag, setDrag] = useState(0);

  const go = useCallback(
    (dir: 1 | -1) => onIndexChange((index + dir + count) % count),
    [index, count, onIndexChange],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onClose]);

  const current = photos[index];
  if (!current) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    setDrag(touchDeltaX.current);
  };
  const onTouchEnd = () => {
    const d = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setDrag(0);
    if (Math.abs(d) > 60) go(d < 0 ? 1 : -1);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 h-11 w-11 rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 flex items-center justify-center transition z-10"
        style={{ top: "max(0.75rem, env(safe-area-inset-top))", right: "max(0.75rem, env(safe-area-inset-right))" }}
      >
        <X className="h-5 w-5" />
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="hidden sm:flex absolute left-4 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 items-center justify-center transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="hidden sm:flex absolute right-4 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 items-center justify-center transition"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <figure
        className="relative w-full max-w-[100vw] sm:max-w-[95vw] max-h-[90vh] flex flex-col items-center px-2 sm:px-0 touch-pan-y"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: `translateX(${drag}px)`, transition: drag === 0 ? "transform 200ms ease" : "none" }}
      >
        <img
          src={current.src}
          alt={current.alt}
          className="max-w-full max-h-[78vh] sm:max-h-[85vh] object-contain rounded-lg sm:rounded-xl shadow-2xl select-none"
          draggable={false}
        />
        <figcaption className="mt-3 px-4 text-[11px] sm:text-sm text-white/70 text-center">
          {current.alt} · {index + 1} / {count}
        </figcaption>
        {count > 1 && (
          <div className="mt-2 flex gap-1.5 sm:hidden" aria-hidden>
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </figure>
    </div>,
    document.body,
  );
}