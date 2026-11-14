"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type ScrollMetrics = {
  maxScroll: number;
  maxThumbY: number;
  progress: number;
  thumbHeight: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function CustomScrollbar() {
  const pathname = usePathname();
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ pointerY: 0, thumbY: 0 });
  const metricsRef = useRef<ScrollMetrics>({ maxScroll: 0, maxThumbY: 0, progress: 0, thumbHeight: 72 });

  useEffect(() => {
    const rail = railRef.current;
    const thumb = thumbRef.current;
    if (!rail || !thumb) return;

    const update = () => {
      frameRef.current = 0;
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      const viewportHeight = window.innerHeight;
      const trackHeight = rail.clientHeight;
      const maxScroll = Math.max(0, documentHeight - viewportHeight);
      const viewportRatio = documentHeight > 0 ? clamp(viewportHeight / documentHeight, 0, 1) : 1;
      const thumbHeight = clamp(trackHeight * viewportRatio, 72, trackHeight);
      const maxThumbY = Math.max(0, trackHeight - thumbHeight);
      const progress = maxScroll > 0 ? clamp(window.scrollY / maxScroll, 0, 1) : 0;
      const thumbY = progress * maxThumbY;

      metricsRef.current = { maxScroll, maxThumbY, progress, thumbHeight };
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translate3d(-50%, ${thumbY}px, 0)`;
      rail.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
      rail.classList.toggle("custom-scrollbar--inactive", maxScroll <= 1);
    };

    const scheduleUpdate = () => {
      if (!frameRef.current) frameRef.current = window.requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.addEventListener("load", scheduleUpdate, { once: true });
    window.addEventListener("oasix:loader-complete", scheduleUpdate);

    scheduleUpdate();
    const routeFrame = window.requestAnimationFrame(scheduleUpdate);
    const routeTimer = window.setTimeout(scheduleUpdate, 500);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("oasix:loader-complete", scheduleUpdate);
      window.cancelAnimationFrame(frameRef.current);
      window.cancelAnimationFrame(routeFrame);
      window.clearTimeout(routeTimer);
      document.body.classList.remove("custom-scrollbar-dragging");
      document.documentElement.classList.remove("custom-scrollbar-dragging");
    };
  }, [pathname]);

  const updateDrag = (pointerY: number) => {
    const { maxScroll, maxThumbY } = metricsRef.current;
    if (maxScroll <= 0 || maxThumbY <= 0) return;
    const thumbY = clamp(dragStartRef.current.thumbY + pointerY - dragStartRef.current.pointerY, 0, maxThumbY);
    const progress = thumbY / maxThumbY;
    const scrollTop = progress * maxScroll;

    metricsRef.current.progress = progress;
    if (thumbRef.current) thumbRef.current.style.transform = `translate3d(-50%, ${thumbY}px, 0)`;
    railRef.current?.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
    document.documentElement.scrollTop = scrollTop;
    document.body.scrollTop = scrollTop;
  };

  const releaseDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    event.currentTarget.classList.remove("custom-scrollbar__thumb--dragging");
    railRef.current?.classList.remove("custom-scrollbar--dragging");
    document.body.classList.remove("custom-scrollbar-dragging");
    document.documentElement.classList.remove("custom-scrollbar-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const scrollWithKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const { maxScroll } = metricsRef.current;
    if (maxScroll <= 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let destination: number | null = null;
    switch (event.key) {
      case "ArrowUp": destination = window.scrollY - 56; break;
      case "ArrowDown": destination = window.scrollY + 56; break;
      case "PageUp": destination = window.scrollY - window.innerHeight * 0.82; break;
      case "PageDown": destination = window.scrollY + window.innerHeight * 0.82; break;
      case "Home": destination = 0; break;
      case "End": destination = maxScroll; break;
      default: return;
    }

    event.preventDefault();
    window.scrollTo({
      top: clamp(destination, 0, maxScroll),
      left: 0,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <div
      ref={railRef}
      className="custom-scrollbar"
      role="scrollbar"
      aria-label="Page scroll position"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      tabIndex={0}
      onKeyDown={scrollWithKeyboard}
      onPointerDown={(event) => {
        if (event.button !== 0 || (event.target as Element).closest(".custom-scrollbar__thumb")) return;
        const rail = railRef.current;
        if (!rail || metricsRef.current.maxScroll <= 0) return;
        const rect = rail.getBoundingClientRect();
        const { maxScroll, maxThumbY, thumbHeight } = metricsRef.current;
        const thumbY = clamp(event.clientY - rect.top - thumbHeight / 2, 0, maxThumbY);
        const progress = maxThumbY > 0 ? thumbY / maxThumbY : 0;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: progress * maxScroll, left: 0, behavior: reduced ? "auto" : "smooth" });
      }}
    >
      <span className="custom-scrollbar__track" aria-hidden="true" />
      <div
        ref={thumbRef}
        className="custom-scrollbar__thumb"
        aria-hidden="true"
        onPointerDown={(event) => {
          if (event.button !== 0 || metricsRef.current.maxScroll <= 0) return;
          event.preventDefault();
          draggingRef.current = true;
          dragStartRef.current = {
            pointerY: event.clientY,
            thumbY: metricsRef.current.progress * metricsRef.current.maxThumbY,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.classList.add("custom-scrollbar__thumb--dragging");
          railRef.current?.classList.add("custom-scrollbar--dragging");
          document.body.classList.add("custom-scrollbar-dragging");
          document.documentElement.classList.add("custom-scrollbar-dragging");
        }}
        onPointerMove={(event) => {
          if (draggingRef.current) updateDrag(event.clientY);
        }}
        onPointerUp={releaseDrag}
        onPointerCancel={releaseDrag}
      />
    </div>
  );
}
