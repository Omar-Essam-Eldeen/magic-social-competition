import { useEffect, useState } from "react";

/**
 * Animates a number from 0 to `target` over ~600ms with an ease-out curve.
 * Returns the target immediately (no animation) when the user prefers
 * reduced motion.
 */
export default function useCountUp(target: number): number {
  const [value, setValue] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? target
      : 0,
  );

  useEffect(() => {
    let raf = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Jump straight to the target — scheduled, not set synchronously in
      // the effect body (the lint rule forbids that).
      raf = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(raf);
    }
    const start = performance.now();
    const duration = 600;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}
