"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Brand, ArrowIcon, LineIcon } from "./Brand";
import SocialLinks from "./SocialLinks";
import TechBackground from "./TechBackground";
import { openBrief } from "./ProjectBrief";
import { copyEmail } from "./Toast";

export function TransitionLink({ href, children, className = "", ariaLabel }: { href: string; children: React.ReactNode; className?: string; ariaLabel?: string }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const navigatingRef = useRef(false);
  const usesCardSweep = className.split(" ").includes("project-card");

  return (
    <>
      <a
        href={href}
        className={className}
        aria-label={ariaLabel}
        onClick={(event) => {
          if (href.startsWith("#") || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          const destination = new URL(href, window.location.href);
          if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
          event.preventDefault();
          if (navigatingRef.current) return;
          navigatingRef.current = true;

          const beginLoading = () => {
            window.dispatchEvent(new Event("oasix:navigation-start"));
            window.setTimeout(() => router.push(href), 200);
          };

          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            beginLoading();
            return;
          }

          if (!usesCardSweep) {
            beginLoading();
            return;
          }

          setLeaving(true);
          window.setTimeout(beginLoading, 320);
        }}
      >
        {children}
        {leaving && (
          <span className="route-transition route-transition--active" aria-hidden="true">
            <img src="/favicon.png" alt="" />
          </span>
        )}
      </a>
    </>
  );
}

// Sections that have a link in the bar. Anything else on the page (the testimonials band, for
// one) must not take the underline away from the section the visitor is actually reading.
const navIds = new Set(["home", "about", "services", "projects", "process", "contact"]);

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(pathname === "/" ? "home" : pathname.includes("project") ? "projects" : "");
  const contactHref = pathname === "/" ? "#contact" : "/#contact";
  const [isMac, setIsMac] = useState(false);
  useEffect(() => { setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (pathname === "/") {
      // The active link is worked out by measurement rather than by IntersectionObserver order.
      // Two sections can sit on the reading line at once — most obviously while the sideways
      // story slides one panel out and the next one in — and an observer callback would simply
      // apply whichever entry happened to come last, which is how the underline used to jump a
      // section ahead. Here the panel that actually fills most of the screen wins.
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"))
        .filter((section) => navIds.has(section.dataset.section ?? ""));
      let frame = 0;

      const measure = () => {
        frame = 0;
        const line = window.innerHeight * 0.45;
        let bestId = "";
        let bestWidth = 0;
        for (const section of sections) {
          const id = section.dataset.section ?? "";
          const rect = section.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          // Panels parked off to the side of the sideways story are not on screen.
          const visible = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
          if (visible <= 1) continue;
          if (rect.top > line || rect.bottom <= line) continue;
          if (visible > bestWidth) { bestWidth = visible; bestId = id; }
        }
        if (bestId) setActive(bestId);
      };
      const scheduleMeasure = () => { if (!frame) frame = window.requestAnimationFrame(measure); };

      scheduleMeasure();
      window.addEventListener("scroll", scheduleMeasure, { passive: true });
      window.addEventListener("resize", scheduleMeasure, { passive: true });
      window.addEventListener("oasix:loader-complete", scheduleMeasure);
      const settle = window.setTimeout(scheduleMeasure, 600);

      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("scroll", scheduleMeasure);
        window.removeEventListener("resize", scheduleMeasure);
        window.removeEventListener("oasix:loader-complete", scheduleMeasure);
        window.clearTimeout(settle);
        window.cancelAnimationFrame(frame);
      };
    }
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Mobile menu: lock page scroll while it is open, and close it with Escape or on navigation.
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.removeEventListener("keydown", onKeyDown); document.body.classList.remove("menu-open"); };
  }, [open]);
  useEffect(() => { setOpen(false); }, [pathname]);
  // The bar must stay "un-transformed" for as long as the menu is on screen, including while it
  // wipes closed: a transform or blur on the bar would trap the full-screen menu inside the bar.
  const [menuHeld, setMenuHeld] = useState(false);
  useEffect(() => {
    if (open) { setMenuHeld(true); return; }
    const timer = window.setTimeout(() => setMenuHeld(false), 650);
    return () => window.clearTimeout(timer);
  }, [open]);

  const nav = [
    ["Home", pathname === "/" ? "#home" : "/#home", "home"],
    ["About", "/#about", "about"],
    ["Services", "/#services", "services"],
    ["Projects", "/projects", "projects"],
    ["Process", "/#process", "process"],
    ["Contact", contactHref, "contact"],
  ];

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""} ${open || menuHeld ? "navbar--menu-open" : ""}`}>
      <div className="navbar__inner shell">
        <Brand />
        <nav className={`navlinks ${open ? "navlinks--open" : ""}`} aria-label="Main navigation">
          {nav.map(([label, href, id], index) => (
            <a key={id} href={href} className={active === id ? "active" : ""} style={{ "--i": index } as React.CSSProperties} onClick={() => setOpen(false)}>
              <span className="navlinks__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{label}
            </a>
          ))}
          <a href={contactHref} className="button button--small mobile-cta" style={{ "--i": nav.length } as React.CSSProperties} onClick={(event) => { setOpen(false); openBrief(event, 80); }}>Let&apos;s Talk <ArrowIcon /></a>
          <p className="navlinks__meta" style={{ "--i": nav.length + 1 } as React.CSSProperties}><button type="button" className="navlinks__copy" onClick={copyEmail} aria-label="Copy email address">oasix4creators@gmail.com <span>Copy</span></button><br />+95 9771751530</p>
        </nav>
        <button type="button" className="palette-trigger" aria-label="Open command palette (Ctrl+K)" onClick={() => window.dispatchEvent(new Event("oasix:open-palette"))}>
          <kbd>{isMac ? "⌘" : "Ctrl"}</kbd><kbd>K</kbd>
        </button>
        <a href={contactHref} className="button button--small desktop-cta" onClick={(event) => openBrief(event)}>Let&apos;s Talk <ArrowIcon /></a>
        <button className={`menu-toggle ${open ? "menu-toggle--open" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">
          <span /><span />
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer" id="contact" data-section="contact">
      <TechBackground variant="footer" />
      <div className="shell">
        <div className="footer__top">
          <div className="footer__cta reveal">
            <p className="eyebrow">LET&apos;S WORK TOGETHER</p>
            <h2>Have a Project<br />in Mind?</h2>
            <button type="button" className="button" onClick={() => openBrief()}>Let&apos;s Talk <ArrowIcon /></button>
          </div>
          <div className="contact-list reveal">
            <div className="contact-list__email">
              <a href="mailto:oasix4creators@gmail.com"><span>✉</span> oasix4creators@gmail.com</a>
              <button type="button" className="copy-chip" onClick={copyEmail} aria-label="Copy email address">
                <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="7" width="9" height="10" rx="2" /><path d="M4 13V5a2 2 0 0 1 2-2h7" /></svg>Copy
              </button>
            </div>
            <div className="contact-list__phones">
              <span aria-hidden="true">☎</span>
              <div><a href="tel:+959771751530">+95 9771751530</a></div>
            </div>
            <p><span aria-hidden="true"><LineIcon name="location" /></span> Yangon, Myanmar</p>
          </div>
          <div className="footer__brand reveal">
            <Brand />
            <p>Building digital experiences<br />that help businesses grow.</p>
            <SocialLinks className="social-row" />
          </div>
        </div>
        <div className="footer__bottom">
          <p>© 2026 OASIX Web Studio. All rights reserved.</p>
          <div><a href="/#home">Home</a><a href="/#about">About</a><a href="/projects">Projects</a><a href="/#contact">Contact</a></div>
          <a
            href="#top"
            className="back-top"
            aria-label="Back to top"
            onClick={(event) => {
              event.preventDefault();
              const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              window.scrollTo({ top: 0, left: 0, behavior: reduced ? "auto" : "smooth" });
            }}
          >↑</a>
        </div>
      </div>
    </footer>
  );
}

// Case studies are often opened straight from a share link, so they need their own way out
// rather than relying on the browser's back button or the bar at the top.
export function CaseBack() {
  return (
    <div className="case-back shell">
      <TransitionLink href="/" className="case-back__link" ariaLabel="Back to the home page">
        <span aria-hidden="true">←</span> Back to home
      </TransitionLink>
      <TransitionLink href="/projects" className="case-back__all">All projects</TransitionLink>
    </div>
  );
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  return <><Navbar />{children}<Footer /></>;
}
