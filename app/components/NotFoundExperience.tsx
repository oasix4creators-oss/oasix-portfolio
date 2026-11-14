"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowIcon } from "./Brand";
import { SiteFrame } from "./SiteChrome";

const CODE = "404";
const GLYPHS = "0123456789/<>#_";
const SETTLE_MS = [380, 680, 980]; // each digit locks in, left to right
const TICK_MS = 45;

export default function NotFoundExperience() {
  const pathname = usePathname();
  const [digits, setDigits] = useState(CODE);
  const timerRef = useRef(0);

  const scramble = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.clearInterval(timerRef.current);
    const startedAt = performance.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      setDigits(CODE.split("").map((char, index) => (
        elapsed >= SETTLE_MS[index] ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      )).join(""));
      if (elapsed >= SETTLE_MS[SETTLE_MS.length - 1]) window.clearInterval(timerRef.current);
    }, TICK_MS);
  }, []);

  useEffect(() => {
    // Wait for the site loader so the effect is actually seen.
    if (document.documentElement.dataset.oasixLoader === "complete") scramble();
    else window.addEventListener("oasix:loader-complete", scramble, { once: true });
    return () => {
      window.removeEventListener("oasix:loader-complete", scramble);
      window.clearInterval(timerRef.current);
    };
  }, [scramble]);

  return (
    <SiteFrame>
      <main className="inner-page not-found" id="home">
        <section className="not-found__inner shell">
          <div className="not-found__copy">
            <p className="eyebrow">ERROR 404 — SIGNAL LOST</p>
            <h1>This page went<br /><span>off the grid.</span></h1>
            <p>The link may be broken, or the page may have been moved or removed.</p>
            <div className="not-found__trace" aria-hidden="true">
              <span>&gt;</span><code>GET {pathname}</code><b>404</b><i />
            </div>
            <div className="not-found__actions">
              <a className="button" href="/">Back to Home <ArrowIcon /></a>
              <a className="button button--ghost" href="/projects">View Our Work</a>
            </div>
          </div>
          <div className="not-found__code" aria-hidden="true" onPointerEnter={scramble}>
            {digits.split("").map((char, index) => <span key={index}>{char}</span>)}
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
