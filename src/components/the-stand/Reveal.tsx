import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * IntersectionObserver-driven slow fade + blur reveal. Honors
 * prefers-reduced-motion via the CSS-only `.stand-rise` class.
 */
export function Reveal({ delay = 0, as: Tag = "div", className, style, children, ...rest }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Component = Tag as "div";
  return (
    <Component
      ref={ref as never}
      className={cn("stand-rise", inView && "is-in", className)}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Component>
  );
}
