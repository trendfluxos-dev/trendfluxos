// Tiny event bus so any component can open the global CommandPalette.
const EVENT = "trendflux:open-command-palette";

export const openCommandPalette = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
};

export const onOpenCommandPalette = (handler: () => void) => {
  if (typeof window === "undefined") return () => {};
  const listener = () => handler();
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
};
