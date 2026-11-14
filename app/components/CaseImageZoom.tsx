"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Click any case-study screenshot to view it full screen. The image grows out of its place on the
// page and shrinks back on close. Escape, the close button or a click anywhere closes it.
const ZOOMABLE = ".case-visual img";
type Open = { src: string; alt: string; caption: string; origin: HTMLImageElement };

export default function CaseImageZoom() {
  const [open, setOpen] = useState<Open | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const closingRef = useRef(false);
  const pathname = usePathname();

  // Mark zoomable images so the cursor and keyboard users can find them.
  useEffect(() => {
    const mark = () => document.querySelectorAll<HTMLImageElement>(ZOOMABLE).forEach((image) => {
      const figure = image.closest<HTMLElement>(".case-visual");
      if (!figure || figure.dataset.zoomReady) return;
      figure.dataset.zoomReady = "true";
      figure.dataset.cursorLabel = "Zoom";
      figure.tabIndex = 0;
      figure.setAttribute("role", "button");
      figure.setAttribute("aria-label", `Enlarge image: ${image.alt}`);
    });
    mark();
    const timer = window.setTimeout(mark, 800);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const openFrom = useCallback((origin: HTMLImageElement) => {
    const caption = origin.closest(".case-visual")?.querySelector("figcaption")?.textContent ?? "";
    setOpen({ src: origin.currentSrc || origin.src, alt: origin.alt, caption, origin });
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const figure = (event.target as Element | null)?.closest?.<HTMLElement>(".case-visual[data-zoom-ready]");
      const image = figure?.querySelector<HTMLImageElement>("img");
      if (image) openFrom(image);
    };
    const onKey = (event: KeyboardEvent) => {
      const figure = (event.target as Element | null)?.closest?.<HTMLElement>(".case-visual[data-zoom-ready]");
      if (figure && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        const image = figure.querySelector<HTMLImageElement>("img");
        if (image) openFrom(image);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); };
  }, [openFrom]);

  const flip = (image: HTMLImageElement, origin: HTMLImageElement, reverse: boolean) => {
    const from = origin.getBoundingClientRect();
    const to = image.getBoundingClientRect();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !to.width || typeof image.animate !== "function") return Promise.resolve();
    const start = `translate(${from.left + from.width / 2 - (to.left + to.width / 2)}px, ${from.top + from.height / 2 - (to.top + to.height / 2)}px) scale(${from.width / to.width})`;
    const frames = [{ transform: start, borderRadius: "16px" }, { transform: "none", borderRadius: "8px" }];
    return image.animate(reverse ? frames.reverse() : frames, { duration: reverse ? 320 : 420, easing: "cubic-bezier(.2,.75,.25,1)", fill: "both" }).finished.catch(() => undefined);
  };

  const close = useCallback(() => {
    if (!open || closingRef.current) return;
    closingRef.current = true;
    const image = imageRef.current;
    document.documentElement.classList.remove("zoom-open");
    void (image ? flip(image, open.origin, true) : Promise.resolve()).then(() => {
      closingRef.current = false;
      open.origin.closest<HTMLElement>(".case-visual")?.focus({ preventScroll: true });
      setOpen(null);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("menu-open"); // reuses the scroll lock from the mobile menu
    const image = imageRef.current;
    const start = () => {
      if (!image) return;
      document.documentElement.classList.add("zoom-open");
      void flip(image, open.origin, false);
    };
    if (image?.complete) start(); else image?.addEventListener("load", start, { once: true });
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.classList.remove("menu-open"); document.documentElement.classList.remove("zoom-open"); };
  }, [open, close]);

  useEffect(() => { setOpen(null); }, [pathname]);

  if (!open) return null;
  return (
    <div className="image-zoom" data-cursor-label="Close" role="dialog" aria-modal="true" aria-label={open.alt} onClick={close}>
      <img ref={imageRef} src={open.src} alt={open.alt} />
      {open.caption && <p className="image-zoom__caption">{open.caption}</p>}
      <button type="button" className="image-zoom__close" aria-label="Close" autoFocus onClick={(event) => { event.stopPropagation(); close(); }}>
        <span /><span />
      </button>
    </div>
  );
}
