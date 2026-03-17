"use client";

import { useEffect, useRef, useState } from "react";

export function useAnimatedNumber(target: number, duration = 400) {
  const [display, setDisplay] = useState(target);
  const frameRef = useRef<number | null>(null);
  const latestRef = useRef(target);

  useEffect(() => {
    const start = latestRef.current;
    const diff = target - start;

    if (diff === 0) {
      latestRef.current = target;
      return;
    }

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const nextValue = Math.round(start + diff * eased);

      latestRef.current = nextValue;
      setDisplay(nextValue);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(animate);
      } else {
        frameRef.current = null;
      }
    };

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [duration, target]);

  return display;
}
