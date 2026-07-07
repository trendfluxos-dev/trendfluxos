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
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition"
      >
        <X className="h-5 w-5" />
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="absolute left-2 sm:left-4 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="absolute right-2 sm:right-4 h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <figure
        className="relative max-w-[95vw] max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: `translateX(${drag}px)`, transition: drag === 0 ? "transform 200ms ease" : "none" }}
      >
        <img
          src={current.src}
          alt={current.alt}
          className="max-w-[95vw] max-h-[85vh] object-contain rounded-xl shadow-2xl select-none"
          draggable={false}
        />
        <figcaption className="mt-3 text-xs sm:text-sm text-white/70 text-center">
          {current.alt} · {index + 1} / {count}
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}