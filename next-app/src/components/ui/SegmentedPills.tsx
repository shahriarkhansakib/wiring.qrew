"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export interface SegmentedPillOption {
  id: string;
  label: string;
}

interface SegmentedPillsProps {
  id?: string;
  options: SegmentedPillOption[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function SegmentedPills({
  id,
  options,
  activeId,
  onChange,
  ariaLabel = "Filter options",
  className = "",
}: SegmentedPillsProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const gliderRef = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isInitialMountRef = useRef(true);

  const syncGlider = useCallback((immediate = false) => {
    const trackEl = trackRef.current;
    const gliderEl = gliderRef.current;
    const activeBtn = btnRefs.current[activeId];
    if (!trackEl || !gliderEl || !activeBtn) return;

    const left = activeBtn.offsetLeft;
    const width = activeBtn.offsetWidth;

    if (immediate) {
      gliderEl.style.transition = "none";
      gliderEl.style.transform = `translate3d(${left}px, 0, 0)`;
      gliderEl.style.width = `${width}px`;
      void gliderEl.offsetWidth;
      gliderEl.style.transition = "";
      return;
    }

    gliderEl.style.transform = `translate3d(${left}px, 0, 0)`;
    gliderEl.style.width = `${width}px`;
  }, [activeId]);

  useIsomorphicLayoutEffect(() => {
    const shouldSnap = isInitialMountRef.current;
    if (shouldSnap) isInitialMountRef.current = false;
    syncGlider(shouldSnap);
  }, [syncGlider, options]);

  useEffect(() => {
    const trackEl = trackRef.current;
    if (!trackEl) return;

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => syncGlider());
      ro.observe(trackEl);
    }

    const handleResize = () => syncGlider();
    window.addEventListener("resize", handleResize);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [syncGlider]);

  return (
    <div
      id={id}
      ref={trackRef}
      className={`segmented-pills-track ${className}`.trim()}
      role="tablist"
      aria-label={ariaLabel}
    >
      <div className="segmented-pills-glider" ref={gliderRef} aria-hidden="true" />
      {options.map((opt) => {
        const isActive = opt.id === activeId;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-pill-id={opt.id}
            ref={(el) => {
              btnRefs.current[opt.id] = el;
            }}
            className={`segmented-pill-btn ${isActive ? "active" : ""}`.trim()}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
