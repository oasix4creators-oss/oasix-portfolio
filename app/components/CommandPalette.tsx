"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { projects } from "../data";
import { copyEmail } from "./Toast";

// Ctrl+K / Cmd+K command palette. Every destination is a real link, and choosing one clicks it,
// so the site's own route cover and section scrolling run exactly as they do for normal links.
type Item = {
  id: string;
  group: string;
  label: string;
  hint: string;
  keywords?: string;
  href?: string;
  external?: boolean;
  run?: () => void;
};

const EMAIL = "oasix4creators@gmail.com";
const PHONE = "+95 9771751530";
export const OPEN_PALETTE_EVENT = "oasix:open-palette";

function score(item: Item, query: string) {
  if (!query) return 1;
  const label = item.label.toLowerCase();
  const haystack = `${label} ${item.group} ${item.keywords ?? ""} ${item.hint}`.toLowerCase();
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.every((word) => haystack.includes(word))) return 0;
  return label.startsWith(words[0]) ? 3 : label.includes(words[0]) ? 2 : 1;
}

export default function CommandPalette() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [caseSections, setCaseSections] = useState<{ label: string; element: HTMLElement }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => {
          if (!value) returnFocus.current = document.activeElement as HTMLElement | null;
          return !value;
        });
      }
    };
    const onOpen = () => { returnFocus.current = document.activeElement as HTMLElement | null; setOpen(true); };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener(OPEN_PALETTE_EVENT, onOpen); };
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    setQuery(""); setActive(0);
    setCaseSections(Array.from(document.querySelectorAll<HTMLElement>("main.case-study [data-index]")).map((element) => ({ label: element.dataset.index ?? "", element })));
    document.body.classList.add("menu-open");
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => { cancelAnimationFrame(frame); document.body.classList.remove("menu-open"); };
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const onHome = pathname === "/";
    const list: Item[] = [
      { id: "home", group: "Go to", label: "Home", hint: "/", href: onHome ? "#home" : "/" },
      { id: "about", group: "Go to", label: "About", hint: "/#about", href: onHome ? "#about" : "/#about", keywords: "studio who" },
      { id: "services", group: "Go to", label: "Services", hint: "/#services", href: onHome ? "#services" : "/#services", keywords: "what we do websites systems" },
      { id: "work", group: "Go to", label: "Featured work", hint: "/#projects", href: onHome ? "#projects" : "/#projects", keywords: "portfolio" },
      { id: "projects", group: "Go to", label: "All projects", hint: "/projects", href: "/projects", keywords: "portfolio archive case studies work" },
      { id: "process", group: "Go to", label: "Process", hint: "/#process", href: onHome ? "#process" : "/#process", keywords: "how we work steps" },
      { id: "contact", group: "Go to", label: "Contact", hint: "#contact", href: "#contact", keywords: "talk hire reach" },
    ];
    caseSections.forEach((section, index) => list.push({
      id: `section-${index}`, group: "This case study", label: section.label, hint: String(index + 1).padStart(2, "0"),
      run: () => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: section.element.getBoundingClientRect().top + window.scrollY - 96, behavior: reduced ? "auto" : "smooth" });
      },
    }));
    projects.forEach((project) => {
      list.push({ id: `project-${project.slug}`, group: "Projects", label: project.title, hint: project.filter, href: `/project/${project.slug}`, keywords: `${project.category} case study ${project.technologies.join(" ")}` });
    });
    list.push(
      { id: "brief", group: "Contact", label: "Start a project brief", hint: "3 steps", keywords: "form enquiry quote hire talk",
        run: () => window.dispatchEvent(new Event("oasix:open-brief")) },
      { id: "copy-email", group: "Contact", label: "Copy email address", hint: EMAIL, keywords: "mail clipboard", run: copyEmail },
      { id: "email", group: "Contact", label: "Send an email", hint: EMAIL, href: `mailto:${EMAIL}`, keywords: "mail write" },
      { id: "call", group: "Contact", label: "Call OASIX", hint: PHONE, href: `tel:${PHONE.replace(/\s/g, "")}`, keywords: "phone viber" },
    );
    projects.filter((project) => project.liveUrl).forEach((project) => list.push({
      id: `live-${project.slug}`, group: "Live sites", label: `Open ${project.title}`, hint: new URL(project.liveUrl!).hostname, href: project.liveUrl, external: true, keywords: "visit website live",
    }));
    return list;
  }, [pathname, caseSections]);

  const results = useMemo(() => items
    .map((item, order) => ({ item, order, rank: score(item, query.trim()) }))
    .filter((entry) => entry.rank > 0)
    .sort((a, b) => (query.trim() ? b.rank - a.rank : 0) || a.order - b.order)
    .map((entry) => entry.item), [items, query]);

  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-row="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (index: number) => {
    const item = results[index];
    if (!item) return;
    // Unlock scrolling, then click the real link while it is still in the page, so the site's own
    // handlers (route cover, home panel scrolling, native hash jumps) treat it like any other link.
    document.body.classList.remove("menu-open");
    if (item.run) { setOpen(false); requestAnimationFrame(() => item.run?.()); return; }
    listRef.current?.querySelector<HTMLAnchorElement>(`[data-row="${index}"] a.palette__link`)?.click();
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    else if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => (value + 1) % Math.max(1, results.length)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => (value - 1 + results.length) % Math.max(1, results.length)); }
    else if (event.key === "Enter") { event.preventDefault(); choose(active); }
  };

  if (!open) return null;
  let lastGroup = "";
  return (
    <div className="palette" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="palette__panel" role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={onKeyDown}>
        <label className="palette__search">
          <span aria-hidden="true">&gt;</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to a page, project or action"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
            role="combobox"
            aria-expanded="true"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>esc</kbd>
        </label>
        <ul className="palette__results" id="palette-results" role="listbox" ref={listRef}>
          {results.map((item, index) => {
            const heading = item.group !== lastGroup ? item.group : "";
            lastGroup = item.group;
            return (
              <li key={item.id} data-row={index} role="presentation">
                {heading && <p className="palette__group">{heading}</p>}
                <div
                  id={`palette-${item.id}`}
                  role="option"
                  aria-selected={index === active}
                  className={index === active ? "palette__item is-active" : "palette__item"}
                  onMouseMove={() => { if (index !== active) setActive(index); }}
                  onClick={() => choose(index)}
                >
                  <span className="palette__label">{item.label}{item.external && <i aria-hidden="true">↗</i>}</span>
                  <span className="palette__hint">{item.hint}</span>
                </div>
                {item.href && <a href={item.href} tabIndex={-1} aria-hidden="true" className="palette__link" {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})} />}
              </li>
            );
          })}
          {!results.length && <li className="palette__empty">No match for “{query}”.</li>}
        </ul>
        <p className="palette__keys" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></p>
      </div>
    </div>
  );
}
