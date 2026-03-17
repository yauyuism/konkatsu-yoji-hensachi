"use client";

import { useEffect, useRef } from "react";

type IncomeRangeSliderProps = {
  options: readonly number[];
  min: number;
  max: number;
  onChange: (next: { min: number; max: number }) => void;
  helper?: string;
  valueLabel: string;
};

type DragTarget = "min" | "max" | null;

function getActualOptions(options: readonly number[]) {
  return options.filter((option) => option > 0);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getLowerSlot(options: readonly number[], min: number) {
  if (min === 0) {
    return 0;
  }

  const index = options.findIndex((option) => option === min);
  return index >= 0 ? index + 1 : 0;
}

function getUpperSlot(options: readonly number[], max: number) {
  if (max === 0) {
    return options.length + 1;
  }

  const index = options.findIndex((option) => option === max);
  return index >= 0 ? index + 1 : options.length + 1;
}

function getMinFromSlot(options: readonly number[], slot: number) {
  if (slot <= 0) {
    return 0;
  }

  return options[slot - 1] ?? 0;
}

function getMaxFromSlot(options: readonly number[], slot: number) {
  if (slot >= options.length + 1) {
    return 0;
  }

  return options[slot - 1] ?? 0;
}

function getThumbPercent(slot: number, denominator: number) {
  return denominator > 0 ? (slot / denominator) * 100 : 0;
}

export function IncomeRangeSlider({ options, min, max, onChange, helper, valueLabel }: IncomeRangeSliderProps) {
  const actualOptions = getActualOptions(options);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragTargetRef = useRef<DragTarget>(null);
  const stateRef = useRef({
    actualOptions,
    min,
    max,
    lowerSlot: 0,
    upperSlot: 0,
    denominator: 0,
  });
  const denominator = actualOptions.length + 1;
  const lowerSlot = getLowerSlot(actualOptions, min);
  const upperSlot = getUpperSlot(actualOptions, max);
  const lowerPercent = getThumbPercent(lowerSlot, denominator);
  const upperPercent = getThumbPercent(upperSlot, denominator);

  const updateFromCurrentSlot = (target: Exclude<DragTarget, null>, slot: number) => {
    if (target === "min") {
      const nextSlot = clamp(slot, 0, upperSlot);
      onChange({ min: getMinFromSlot(actualOptions, nextSlot), max });
      return;
    }

    const nextSlot = clamp(slot, lowerSlot, denominator);
    onChange({ min, max: getMaxFromSlot(actualOptions, nextSlot) });
  };

  useEffect(() => {
    stateRef.current = {
      actualOptions,
      min,
      max,
      lowerSlot,
      upperSlot,
      denominator,
    };
  }, [actualOptions, denominator, lowerSlot, max, min, upperSlot]);

  useEffect(() => {
    const getSlotFromClientX = (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();

      if (!rect || rect.width <= 0) {
        return stateRef.current.lowerSlot;
      }

      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      return Math.round(ratio * stateRef.current.denominator);
    };

    const updateFromSlot = (target: Exclude<DragTarget, null>, slot: number) => {
      const current = stateRef.current;

      if (target === "min") {
        const nextSlot = clamp(slot, 0, current.upperSlot);
        onChange({ min: getMinFromSlot(current.actualOptions, nextSlot), max: current.max });
        return;
      }

      const nextSlot = clamp(slot, current.lowerSlot, current.denominator);
      onChange({ min: current.min, max: getMaxFromSlot(current.actualOptions, nextSlot) });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragTargetRef.current) {
        return;
      }

      updateFromSlot(dragTargetRef.current, getSlotFromClientX(event.clientX));
    };

    const clearDragTarget = () => {
      dragTargetRef.current = null;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!dragTargetRef.current) {
        return;
      }

      updateFromSlot(dragTargetRef.current, getSlotFromClientX(event.clientX));
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!dragTargetRef.current || event.touches.length === 0) {
        return;
      }

      updateFromSlot(dragTargetRef.current, getSlotFromClientX(event.touches[0].clientX));
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", clearDragTarget);
    window.addEventListener("pointercancel", clearDragTarget);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", clearDragTarget);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", clearDragTarget);
    window.addEventListener("touchcancel", clearDragTarget);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", clearDragTarget);
      window.removeEventListener("pointercancel", clearDragTarget);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", clearDragTarget);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", clearDragTarget);
      window.removeEventListener("touchcancel", clearDragTarget);
    };
  }, [onChange]);

  return (
    <div className="rounded-[1.5rem] border border-[rgba(26,26,26,0.08)] bg-white/88 p-4 sm:p-5">
      <div className="flex items-center justify-between text-sm font-bold text-[var(--text-sub)]">
        <span>下限なし</span>
        <span>上限なし</span>
      </div>

      <div className="mt-4">
        <div
          ref={trackRef}
          className="relative h-10 touch-none"
          onPointerDown={(event) => {
            const rect = trackRef.current?.getBoundingClientRect();
            const ratio = rect && rect.width > 0 ? clamp((event.clientX - rect.left) / rect.width, 0, 1) : 0;
            const slot = Math.round(ratio * denominator);
            const target = Math.abs(slot - lowerSlot) <= Math.abs(slot - upperSlot) ? "min" : "max";
            updateFromCurrentSlot(target, slot);
            dragTargetRef.current = target;
          }}
          onMouseDown={(event) => {
            const rect = trackRef.current?.getBoundingClientRect();
            const ratio = rect && rect.width > 0 ? clamp((event.clientX - rect.left) / rect.width, 0, 1) : 0;
            const slot = Math.round(ratio * denominator);
            const target = Math.abs(slot - lowerSlot) <= Math.abs(slot - upperSlot) ? "min" : "max";
            updateFromCurrentSlot(target, slot);
            dragTargetRef.current = target;
          }}
        >
          <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-[#E5E7EB]" />
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[var(--data-bar)]"
            style={{
              left: `${lowerPercent}%`,
              right: `${100 - upperPercent}%`,
            }}
          />

          <button
            type="button"
            role="slider"
            aria-label="年収の下限"
            aria-valuemin={0}
            aria-valuemax={denominator}
            aria-valuenow={lowerSlot}
            onPointerDown={(event) => {
              event.stopPropagation();
              event.preventDefault();
              dragTargetRef.current = "min";
            }}
            onMouseDown={(event) => {
              event.stopPropagation();
              event.preventDefault();
              dragTargetRef.current = "min";
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                updateFromCurrentSlot("min", lowerSlot - 1);
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                updateFromCurrentSlot("min", lowerSlot + 1);
              }
              if (event.key === "Home") {
                event.preventDefault();
                updateFromCurrentSlot("min", 0);
              }
              if (event.key === "End") {
                event.preventDefault();
                updateFromCurrentSlot("min", upperSlot);
              }
            }}
            className="absolute top-1/2 z-[3] h-[1.35rem] w-[1.35rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[var(--data-bar-strong)] shadow-[0_8px_18px_rgba(30,64,175,0.26)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--data-bar-strong)]"
            style={{ left: `${lowerPercent}%` }}
          />

          <button
            type="button"
            role="slider"
            aria-label="年収の上限"
            aria-valuemin={0}
            aria-valuemax={denominator}
            aria-valuenow={upperSlot}
            onPointerDown={(event) => {
              event.stopPropagation();
              event.preventDefault();
              dragTargetRef.current = "max";
            }}
            onMouseDown={(event) => {
              event.stopPropagation();
              event.preventDefault();
              dragTargetRef.current = "max";
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                updateFromCurrentSlot("max", upperSlot - 1);
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                updateFromCurrentSlot("max", upperSlot + 1);
              }
              if (event.key === "Home") {
                event.preventDefault();
                updateFromCurrentSlot("max", lowerSlot);
              }
              if (event.key === "End") {
                event.preventDefault();
                updateFromCurrentSlot("max", denominator);
              }
            }}
            className="absolute top-1/2 z-[4] h-[1.35rem] w-[1.35rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[var(--data-bar-strong)] shadow-[0_8px_18px_rgba(30,64,175,0.26)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--data-bar-strong)]"
            style={{ left: `${upperPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="tag rounded-full px-4 py-2 text-sm font-bold text-[var(--data-bar-strong)]">
          {valueLabel}
        </p>
        {helper ? <p className="text-right text-xs leading-6 text-[var(--text-sub)] sm:text-sm">{helper}</p> : null}
      </div>
    </div>
  );
}
