"use client";

import { useEffect, useState } from "react";

export function useCountUp(target: number, duration = 1500) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCurrent(Math.round(target * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [duration, target]);

  return current;
}
