"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Section labels (".eyebrow") decode from random glyphs into their text the first
// time they scroll into view. The home hero label is excluded: the hero is final.
const SELECTOR = ".eyebrow";
const EXCLUDE = ".hero, .site-loader";
const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/<>#_";
const TICK_MS = 40;
const KEEP = /[\s·—–\-/&.,:]/; // spacing and punctuation stay put so the label keeps its shape

function decode(element: HTMLElement) {
  const text = element.dataset.decodeText ?? element.textContent ?? "";
  if (!text.trim() || element.childElementCount > 0) return;
  element.dataset.decodeText = text;
  element.setAttribute("aria-label", text);
  const duration = Math.min(900, 260 + text.length * 26);
  const startedAt = performance.now();
  const timer = window.setInterval(() => {
    const progress = Math.min(1, (performance.now() - startedAt) / duration);
    const resolved = Math.floor(progress * text.length);
    element.textContent = text.split("").map((char, index) => (
      index < resolved || KEEP.test(char) ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    )).join("");
    if (progress >= 1) {
      window.clearInterval(timer);
      element.textContent = text;
      element.removeAttribute("aria-label");
    }
  }, TICK_MS);
  return timer;
}

export default function DecodeLabels() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let observer: IntersectionObserver | undefined;
    const timers: number[] = [];

    const start = () => {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer?.unobserve(entry.target);
          const timer = decode(entry.target as HTMLElement);
          if (timer) timers.push(timer);
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.6 });
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => {
        if (!element.closest(EXCLUDE)) observer?.observe(element);
      });
    };

    // Wait for the loader or route cover to clear, so the effect is seen and the new page is in place.
    if (document.documentElement.dataset.oasixLoader === "complete") start();
    else window.addEventListener("oasix:loader-complete", start, { once: true });

    return () => {
      window.removeEventListener("oasix:loader-complete", start);
      observer?.disconnect();
      timers.forEach((timer) => window.clearInterval(timer));
      document.querySelectorAll<HTMLElement>("[data-decode-text]").forEach((element) => {
        element.textContent = element.dataset.decodeText ?? element.textContent;
        element.removeAttribute("aria-label");
      });
    };
  }, [pathname]);

  return null;
}
