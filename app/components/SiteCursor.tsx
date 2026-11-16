"use client";

import { useEffect, useRef } from "react";

// Site cursor: a precise dot on the pointer plus a ring that trails it.
//  - Default: thin ring with four ticks and a slowly rotating scan arc.
//  - Links and buttons: the ring widens, the ticks turn into corner brackets, and on small targets
//    the ring is pulled towards the element's centre (magnetic).
//  - Project images: the ring becomes a solid "VIEW" disc.
//  - Moving fast stretches the ring along the direction of travel; pressing squeezes it.
// Mouse only. Touch screens and reduced-motion visitors keep the normal system cursor.
const INTERACTIVE = "a[href], button, [role='button'], .service-card, .custom-scrollbar, label, select, summary";
const VIEW = ".project-card__image, .archive-card__image, [data-cursor-label]"; // label comes from data-cursor-label, else "View"
const TEXT_ENTRY = "input:not([type='button']):not([type='submit']):not([type='checkbox']):not([type='radio']), textarea, [contenteditable='true']";
const FOLLOW = 0.34;   // 0–1: how quickly the ring catches up with the pointer
const MAGNET = 0.26;   // 0–1: how far the ring is pulled towards a small target's centre
const MAGNET_MAX = { width: 240, height: 90 }; // only targets up to this size are magnetic

type State = "default" | "link" | "view" | "hidden";

export default function SiteCursor() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const html = document.documentElement;
    const ring = root.querySelector<HTMLElement>(".site-cursor__ring");
    const dot = root.querySelector<HTMLElement>(".site-cursor__dot");
    const shell = root.querySelector<HTMLElement>(".site-cursor__shell");
    const label = root.querySelector<HTMLElement>(".site-cursor__label");
    if (!ring || !dot || !shell) return;
    html.classList.add("has-site-cursor");

    let pointerX = -200, pointerY = -200;
    let targetX = -200, targetY = -200;
    let ringX = -200, ringY = -200;
    let frame = 0;
    let lastTime = 0;
    let press = 1;
    let pressTarget = 1;
    let state: State = "hidden";
    let seen = false;

    const setState = (next: State) => {
      if (next === state) return;
      state = next;
      root.dataset.state = next;
    };

    const render = (time: number) => {
      // Frame-rate independent easing: the ring catches up at the same speed on slow and fast screens.
      const elapsed = lastTime ? Math.min(64, time - lastTime) : 16.7;
      lastTime = time;
      const follow = 1 - Math.pow(1 - FOLLOW, elapsed / 16.7);
      const dx = targetX - ringX;
      const dy = targetY - ringY;
      ringX += dx * follow;
      ringY += dy * follow;
      press += (pressTarget - press) * Math.min(1, follow * 1.6);
      // Transforms only (no per-frame CSS variables), so the browser can move the layers without restyling.
      const stretch = state === "view" ? 0 : Math.min(1, Math.hypot(dx, dy) / 90);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      ring.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;
      shell.style.transform = `translate(-50%, -50%) rotate(${angle.toFixed(1)}deg) scale(${((1 + stretch * 0.2) * press).toFixed(3)}, ${((1 - stretch * 0.1) * press).toFixed(3)})`;
      const settling = Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2 || Math.abs(pressTarget - press) > 0.004;
      frame = settling ? window.requestAnimationFrame(render) : 0;
      if (!settling) lastTime = 0;
    };
    const wake = () => { if (!frame) frame = window.requestAnimationFrame(render); };

    // Works out the ring's state and magnetic pull from whatever sits under the pointer right now.
    const applyTo = (element: Element | null) => {
      targetX = pointerX;
      targetY = pointerY;
      if (element?.closest(TEXT_ENTRY)) {
        setState("hidden");
      } else if (element?.closest(VIEW)) {
        const text = element.closest<HTMLElement>(VIEW)?.dataset.cursorLabel ?? "View";
        if (label && label.textContent !== text) label.textContent = text;
        setState("view");
      } else {
        const interactive = element?.closest<HTMLElement>(INTERACTIVE);
        setState(interactive ? "link" : "default");
        if (interactive) {
          const rect = interactive.getBoundingClientRect();
          if (rect.width <= MAGNET_MAX.width && rect.height <= MAGNET_MAX.height) {
            targetX += (rect.left + rect.width / 2 - pointerX) * MAGNET;
            targetY += (rect.top + rect.height / 2 - pointerY) * MAGNET;
          }
        }
      }
      wake();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!seen) { seen = true; ringX = pointerX; ringY = pointerY; }
      applyTo(event.target instanceof Element ? event.target : null);
    };

    // The page moves under a still mouse all the time here — the wheel, the sideways story, the
    // loader finishing, an overlay opening or closing. Without this the ring keeps the shape and
    // the magnetic offset of whatever used to be under the pointer, so it sits beside the dot
    // over plain text, or stays small on top of a button.
    let recheckFrame = 0;
    const recheck = () => {
      recheckFrame = 0;
      if (!seen) return;
      applyTo(document.elementFromPoint(pointerX, pointerY));
    };
    const scheduleRecheck = () => { if (!recheckFrame) recheckFrame = window.requestAnimationFrame(recheck); };

    const hide = () => setState("hidden");
    const release = () => { root.classList.remove("is-pressed"); pressTarget = 1; wake(); };
    const onDown = () => { root.classList.add("is-pressed"); pressTarget = 0.82; wake(); };
    const onBlur = () => { release(); hide(); };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", release);
    window.addEventListener("scroll", scheduleRecheck, { passive: true });
    window.addEventListener("resize", scheduleRecheck, { passive: true });
    window.addEventListener("oasix:loader-complete", scheduleRecheck);
    html.addEventListener("pointerleave", hide);
    window.addEventListener("blur", onBlur);

    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(recheckFrame);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", release);
      window.removeEventListener("scroll", scheduleRecheck);
      window.removeEventListener("resize", scheduleRecheck);
      window.removeEventListener("oasix:loader-complete", scheduleRecheck);
      html.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", onBlur);
      html.classList.remove("has-site-cursor");
    };
  }, []);

  return (
    <div className="site-cursor" ref={rootRef} data-state="hidden" aria-hidden="true">
      <div className="site-cursor__ring">
        <span className="site-cursor__shell" />
        <svg className="site-cursor__arc" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" pathLength="100" /></svg>
        <span className="site-cursor__ticks"><i /><i /><i /><i /></span>
        <span className="site-cursor__label">View</span>
      </div>
      <div className="site-cursor__dot" />
    </div>
  );
}
