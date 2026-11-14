"use client";

import { useEffect, useRef } from "react";

export default function HeroGlassCircle() {
  const circleRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const circle = circleRef.current;
    const logo = logoRef.current;
    if (!circle || !logo) return;

    let disposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    let gsapContext: { revert: () => void } | undefined;
    let gsapInstance: typeof import("gsap")["default"] | undefined;
    let introRunning = !reduced;
    let lastPointer: { x: number; y: number } | undefined;
    const arcState = { angle: 135 };
    const tiltState = { x: 0, y: 0 };

    // The rim glow, the specular highlight, the shadowed side and the caustic all share one light
    // direction (the glow angle), so the sphere reads as a single lit 3D object.
    const renderArc = () => {
      const radians = (arcState.angle * Math.PI) / 180;
      const dx = Math.sin(radians);
      const dy = -Math.cos(radians);
      circle.style.setProperty("--glow-angle", `${arcState.angle}deg`);
      circle.style.setProperty("--lx", `${(50 + dx * 33).toFixed(2)}%`);
      circle.style.setProperty("--ly", `${(50 + dy * 33).toFixed(2)}%`);
      circle.style.setProperty("--sx", `${(50 - dx * 30).toFixed(2)}%`);
      circle.style.setProperty("--sy", `${(50 - dy * 30).toFixed(2)}%`);
      circle.style.setProperty("--cx", `${(50 - dx * 33).toFixed(2)}%`);
      circle.style.setProperty("--cy", `${(50 - dy * 33).toFixed(2)}%`);
      // Touch screens have no pointer to follow, so the logo turns gently with the orbiting light.
      if (coarsePointer && !reduced) {
        circle.style.setProperty("--ox", (dx * 0.35).toFixed(3));
        circle.style.setProperty("--oy", (dy * 0.35).toFixed(3));
      }
    };

    // The logo plane inside the glass turns towards the cursor; the sphere's outline never changes.
    const renderTilt = () => {
      circle.style.setProperty("--ox", tiltState.x.toFixed(3));
      circle.style.setProperty("--oy", tiltState.y.toFixed(3));
    };
    const tiltToPointer = (x: number, y: number) => {
      if (!gsapInstance || reduced) return;
      const rect = circle.getBoundingClientRect();
      const clamp = (value: number) => Math.max(-1, Math.min(1, value));
      const nx = clamp((x - (rect.left + rect.width / 2)) / (rect.width * 1.4));
      const ny = clamp((y - (rect.top + rect.height / 2)) / (rect.height * 1.4));
      const distance = Math.min(1, Math.hypot(nx, ny));
      circle.style.setProperty("--light", (1 - distance * 0.35).toFixed(3));
      gsapInstance.to(tiltState, { x: nx, y: ny, duration: 1.1, ease: "power3.out", overwrite: "auto", onUpdate: renderTilt });
    };

    // As the hero scrolls away, the sphere lags behind the page and shrinks slightly (parallax).
    const hero = circle.closest<HTMLElement>(".hero");
    let exitFrame = 0;
    let exitRunning = false;
    const renderExit = () => {
      if (hero) {
        const rect = hero.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
        circle.style.setProperty("--hero-exit", progress.toFixed(4));
      }
      if (exitRunning) exitFrame = window.requestAnimationFrame(renderExit);
    };
    const exitObserver = hero && !reduced ? new IntersectionObserver(([entry]) => {
      exitRunning = entry.isIntersecting;
      window.cancelAnimationFrame(exitFrame);
      if (exitRunning) exitFrame = window.requestAnimationFrame(renderExit);
    }) : undefined;
    if (hero) exitObserver?.observe(hero);
    renderArc();

    const moveArcToPointer = (x: number, y: number) => {
      if (!gsapInstance) return;
      const rect = circle.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rawAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
      const normalizedCurrent = ((arcState.angle % 360) + 360) % 360;
      const shortestTurn = ((rawAngle - normalizedCurrent + 540) % 360) - 180;

      gsapInstance.to(arcState, {
        angle: arcState.angle + shortestTurn,
        duration: 0.82,
        ease: "power3.out",
        overwrite: "auto",
        onUpdate: renderArc,
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      lastPointer = { x: event.clientX, y: event.clientY };
      tiltToPointer(event.clientX, event.clientY);
      if (!introRunning) moveArcToPointer(event.clientX, event.clientY);
    };

    if (!coarsePointer) window.addEventListener("pointermove", onPointerMove, { passive: true });

    const activateOrb = () => void import("gsap").then(({ default: gsap }) => {
      if (disposed || !circleRef.current || !logoRef.current) return;
      gsapInstance = gsap;
      gsapContext = gsap.context(() => {
        gsap.fromTo(circle,
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1, duration: 1.1, delay: 0.3, ease: "power3.out" },
        );
        gsap.from(logo, { opacity: 0, duration: 0.8, delay: 0.62, ease: "power3.out" });

        if (reduced) {
          introRunning = false;
          circle.classList.add("hero-glass--ready");
          if (lastPointer) moveArcToPointer(lastPointer.x, lastPointer.y);
          return;
        }

        circle.classList.add("hero-glass--intro");
        gsap.to(arcState, {
          angle: arcState.angle + 720,
          duration: 1.5,
          delay: 0.3,
          ease: "power4.out",
          overwrite: "auto",
          onUpdate: renderArc,
          onComplete: () => {
            circle.classList.remove("hero-glass--intro");
            circle.classList.add("hero-glass--ready");
            introRunning = false;
            if (lastPointer) moveArcToPointer(lastPointer.x, lastPointer.y);
            // No pointer on touch screens: let the light orbit slowly so the sphere never looks frozen.
            if (coarsePointer) gsap.to(arcState, { angle: "+=360", duration: 18, ease: "none", repeat: -1, onUpdate: renderArc });
          },
        });
      }, circle);
    });

    if (document.documentElement.dataset.oasixLoader === "complete") activateOrb();
    else window.addEventListener("oasix:loader-complete", activateOrb, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener("oasix:loader-complete", activateOrb);
      window.removeEventListener("pointermove", onPointerMove);
      circle.classList.remove("hero-glass--intro", "hero-glass--ready");
      gsapInstance?.killTweensOf(arcState);
      gsapInstance?.killTweensOf(tiltState);
      exitRunning = false;
      window.cancelAnimationFrame(exitFrame);
      exitObserver?.disconnect();
      gsapContext?.revert();
    };
  }, []);

  return (
    <div className="hero-glass" ref={circleRef} aria-label="Interactive OASIX glass emblem">
      <span className="hero-glass__floor" aria-hidden="true" />
      <span className="hero-glass__surface" />
      <span className="hero-glass__shade" aria-hidden="true" />
      <span className="hero-glass__arc-outer" />
      <span className="hero-glass__inner-clip"><span className="hero-glass__arc-inner" /></span>
      <span className="hero-glass__arc-core" />
      <span className="hero-glass__arc-highlight" />
      <span className="hero-glass__hover-ring" aria-hidden="true" />
      <span className="hero-glass__logo-aura" />
      <img ref={logoRef} src="/assets/oasix-logomark.png" alt="OASIX logomark" />
      <span className="hero-glass__caustic" aria-hidden="true" />
      <span className="hero-glass__reflection" aria-hidden="true" />
      <span className="hero-glass__specular" aria-hidden="true" />
    </div>
  );
}
