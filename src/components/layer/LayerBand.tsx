import { LAYER_META, type Layer } from "@/config/siteLayers";

/**
 * Section divider used on the home page to label the 4 ecosystem layers.
 * Composition only — does not reorder or hide child sections.
 */
const LayerBand = ({ layer, eyebrow }: { layer: Layer; eyebrow?: string }) => {
  const meta = LAYER_META[layer];
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-16 pb-2" data-layer-band={layer}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/30 dark:via-foreground/15 to-transparent"
        />
        <span className="text-[10.5px] uppercase tracking-[0.28em] text-foreground/75 dark:text-foreground/50 font-medium whitespace-nowrap">
          {eyebrow ?? `The ${meta.label}`}
        </span>
        <span
          aria-hidden
          className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/30 dark:via-foreground/15 to-transparent"
        />
      </div>
      <p className="mt-2 text-center text-[12px] text-foreground/70 dark:text-foreground/45">{meta.tagline}</p>
    </div>
  );
};

export default LayerBand;