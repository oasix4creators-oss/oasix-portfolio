"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// The spine. One rail for the whole site, in the left margin on desktop: a line that draws itself
// as you descend, with a node per section that lights as that section takes the screen. Sections
// announce themselves with data-index (a written label, used by the case studies) or data-section
// (an id, used by the home page); the rail reads whichever the page provides.
export type Entry = { label: string; element: HTMLElement };

const NAV_OFFSET = 96; // keeps a jumped-to section clear of the fixed navbar
const READING_LINE = 0.4; // a section counts as current once its top passes this much of the viewport

const SECTION_LABELS: Record<string, string> = {
  home: "Top",
  about: "About",
  services: "Services",
  projects: "Work",
  process: "Process",
  testimonials: "Clients",
  contact: "Contact",
};

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");

// Shared with the scroll readout so both pieces of chrome name the same sections.
export function readSections(): Entry[] {
  const indexed = Array.from(document.querySelectorAll<HTMLElement>("[data-index]"));
  if (indexed.length) return indexed.map((element) => ({ label: element.dataset.index ?? "", element }));
  return Array.from(document.querySelectorAll<HTMLElement>("[data-section]")).map((element) => {
    const id = element.dataset.section ?? "";
    return { label: SECTION_LABELS[id] ?? titleCase(id), element };
  });
}

// The section whose top has most recently passed the reading line.
export function activeSection(entries: Entry[]) {
  const line = window.innerHeight * READING_LINE;
  let index = 0;
  entries.forEach((entry, i) => { if (entry.element.getBoundingClientRect().top <= line) index = i; });
  return index;
}

export default function SectionRail() {
  const pathname = usePathname();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const lineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const read = readSections;
    let found = read();
    setEntries(found);
    setCurrent(0);

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!found.length) return;
      const line = window.innerHeight * READING_LINE;
      setCurrent(activeSection(found));
      const first = found[0].element.getBoundingClientRect();
      const last = found[found.length - 1].element.getBoundingClientRect();
      setVisible(first.top < window.innerHeight * 0.6 && last.bottom > window.innerHeight * 0.3);
      const start = first.top + window.scrollY - line;
      const end = last.bottom + window.scrollY - line;
      const progress = Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(1, end - start)));
      lineRef.current?.style.setProperty("--rail-progress", progress.toFixed(4));
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };

    // Sections can arrive after the first paint — the case studies render asynchronously, and the
    // loader holds the home page back — so take a second reading once things have settled.
    const recount = () => { found = read(); setEntries(found); schedule(); };
    const settle = window.setTimeout(recount, 600);

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("oasix:loader-complete", recount);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("oasix:loader-complete", recount);
    };
  }, [pathname]);

  if (entries.length < 2) return null;

  const jump = (entry: Entry) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: entry.element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <nav className={visible ? "spine-rail is-visible" : "spine-rail"} aria-label="Page sections">
      <span className="spine-rail__line" ref={lineRef} aria-hidden="true"><i /></span>
      <ol className="spine-rail__nodes">
        {entries.map((entry, index) => (
          <li key={entry.label + index}>
            <button
              type="button"
              className={index === current ? "is-current" : index < current ? "is-passed" : ""}
              aria-current={index === current ? "true" : undefined}
              onClick={() => jump(entry)}
            >
              <i aria-hidden="true" />
              <span>{entry.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
