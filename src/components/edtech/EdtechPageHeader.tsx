import type { ReactNode } from "react";

/**
 * Decorative page header used by every /edtech/* sub-page so the surface
 * stays visually consistent with the EISH-inspired landing.
 */
const EdtechPageHeader = ({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) => (
  <header className="border-b border-border/60 bg-gradient-to-b from-primary/[0.04] to-transparent">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:py-14 lg:flex-row lg:items-end lg:justify-between lg:px-10">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/70">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-[15px] leading-[1.7] text-foreground/65">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </header>
);

export default EdtechPageHeader;