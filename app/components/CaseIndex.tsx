"use client";

import { useEffect, useRef, useState } from "react";

// Case-study section index (desktop). A slim rail in the left margin shows the current section and
// how far through the case study you are; hovering or focusing it opens the full list to jump to.
type Entry = { label: string; element: HTMLElement };

const NAV_OFFSET = 96; // keeps a jumped-to section clear of the fixed navbar

export default function CaseIndex() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const found = Array.from(document.querySelectorAll<HTMLElement>("main.case-study [data-index]"))
      .map((element) => ({ label: element.dataset.index ?? "", element }));
    setEntries(found);
    if (!found.length) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let index = 0;
      found.forEach((entry, i) => { if (entry.element.getBoundingClientRect().top <= line) index = i; });
      setCurrent(index);
      const first = found[0].element.getBoundingClientRect();
      const last = found[found.length - 1].element.getBoundingClientRect();
      setVisible(first.top < window.innerHeight * 0.6 && last.bottom > window.innerHeight * 0.3);
      const start = first.top + window.scrollY - line;
      const end = last.bottom + window.scrollY - line;
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(1, end - start)));
      barRef.current?.style.setProperty("--case-progress", progress.toFixed(4));
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!entries.length) return null;
  const jump = (entry: Entry) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: entry.element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET, behavior: reduced ? "auto" : "smooth" });
  };
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <nav className={visible ? "case-index-rail is-visible" : "case-index-rail"} aria-label="Case study sections">
      <div className="case-index-rail__hud" aria-hidden="true">
        <b>{pad(current + 1)}</b>
        <span className="case-index-rail__bar" ref={barRef}><i /></span>
        <span>{pad(entries.length)}</span>
        <em key={current}>{entries[current]?.label}</em>
      </div>
      <ol className="case-index-rail__panel">
        {entries.map((entry, index) => (
          <li key={entry.label + index}>
            <button type="button" className={index === current ? "is-current" : ""} aria-current={index === current ? "true" : undefined} onClick={() => jump(entry)}>
              <span>{pad(index + 1)}</span>{entry.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
