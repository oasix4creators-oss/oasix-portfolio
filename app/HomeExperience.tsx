"use client";

import { openBrief } from "./components/ProjectBrief";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowIcon, LineIcon } from "./components/Brand";
import HeroGlassCircle from "./components/HeroGlassCircle";
import { SiteFrame, TransitionLink } from "./components/SiteChrome";
import SocialLinks from "./components/SocialLinks";
import TechBackground from "./components/TechBackground";
import { processSteps, projects, services } from "./data";

// Real client quotes only. The dots and arrows appear automatically once there is more than one.
const testimonials = [
  { quote: "OASIX Web Studio delivered a website that exceeded our expectations. They understood our needs perfectly and the final product is amazing.", client: "ZYPP Camera House" },
];

const featuredProjects = projects.slice(0, 3);

const STORY_PANELS = ["About", "Services", "Projects", "Process"]; // order of the sideways panels
const SERVICE_TILT_DEG = 5; // maximum tilt in each direction

// Front: icon and title. Back: a one-line description. Hover or keyboard focus reveals the back;
// on touch screens a tap toggles it.
function ServiceCard({ index, icon, title, description }: { index: number; icon: string; title: string; description: string }) {
  const [open, setOpen] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  // Mouse only: a light follows the cursor around the card border and the card tilts slightly towards it.
  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const tiltX = (0.5 - y / rect.height) * 2 * SERVICE_TILT_DEG;
    const tiltY = (x / rect.width - 0.5) * 2 * SERVICE_TILT_DEG;
    card.style.setProperty("--mx", `${x.toFixed(1)}px`);
    card.style.setProperty("--my", `${y.toFixed(1)}px`);
    card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    card.classList.add("is-tilting");
  };
  const resetTilt = () => {
    const card = cardRef.current;
    if (!card) return;
    card.classList.remove("is-tilting");
  };

  return (
    <article
      ref={cardRef}
      style={{ "--i": index } as React.CSSProperties}
      onPointerMove={onPointerMove}
      className={open ? "service-card is-open" : "service-card"}
      tabIndex={0}
      onClick={() => setOpen((current) => !current)}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setOpen((current) => !current); } }}
      onPointerLeave={(event) => { resetTilt(); if (event.pointerType === "mouse") setOpen(false); }}
      onBlur={() => setOpen(false)}
    >
      <div className="service-card__front"><LineIcon name={icon} /><h3>{title}</h3></div>
      <div className="service-card__back"><span aria-hidden="true">{title}</span><p>{description}</p></div>
    </article>
  );
}

export default function HomeExperience() {
  const [testimonial, setTestimonial] = useState(0);
  const horizontalRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const storyHudRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      // Headline lines rise out of a mask one after another, then the rest of the copy follows and a
      // single light sweep crosses "Digital Experiences". Reduced motion keeps the original simple fade.
      const headline = document.querySelector<HTMLElement>(".hero h1");
      const lines = gsap.utils.toArray<HTMLElement>(".hero h1 .hero-line > span");
      const heroItems = gsap.utils.toArray<HTMLElement>(".hero__copy > *").filter((item) => reduced || item !== headline);
      gsap.set(heroItems, { y: 34, opacity: 0 });
      if (!reduced) gsap.set(lines, { yPercent: 115 });
      const playHeroEntrance = () => {
        if (reduced) {
          gsap.to(heroItems, { y: 0, opacity: 1, duration: 0.95, stagger: 0.1, ease: "power3.out" });
        } else {
          const [eyebrow, ...rest] = heroItems;
          if (eyebrow) gsap.to(eyebrow, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
          gsap.to(lines, { yPercent: 0, duration: 1.05, stagger: 0.13, delay: 0.08, ease: "power4.out", onComplete: () => {
            headline?.classList.add("is-revealed");
            headline?.querySelector(".hero-line--accent")?.classList.add("is-sheen");
          } });
          gsap.to(rest, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, delay: 0.5, ease: "power3.out" });
        }
        ScrollTrigger.refresh();
      };
      if (document.documentElement.dataset.oasixLoader === "complete") playHeroEntrance();
      else window.addEventListener("oasix:loader-complete", playHeroEntrance, { once: true });
      if (!reduced) {
        gsap.to(".hero__copy", {
          y: -90, opacity: 0, scale: 0.96, filter: "blur(10px)",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "72% top", scrub: 0.8 },
        });
        gsap.utils.toArray<HTMLElement>(".reveal").filter((element) => !element.closest(".horizontal-story")).forEach((element) => {
          gsap.from(element, { y: 42, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 88%", once: true } });
        });
      }

      media.add("(max-width: 1080px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".horizontal-story .reveal").forEach((element) => {
          gsap.from(element, { y: 42, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 88%", once: true } });
        });
        gsap.fromTo(".horizontal-story .service-card", { y: 38, opacity: 0 }, { y: 0, opacity: 1, clearProps: "transform", duration: 0.7, stagger: 0.07, ease: "power3.out", scrollTrigger: { trigger: ".services-grid", start: "top 82%", once: true } });
        gsap.fromTo(".horizontal-story .project-card", { y: 44, opacity: 0 }, { y: 0, opacity: 1, clearProps: "transform", duration: 0.8, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ".projects-grid", start: "top 82%", once: true } });
        gsap.from(".horizontal-story .process-step", { y: 25, opacity: 0, duration: 0.75, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: ".process-grid", start: "top 80%", once: true } });
      });

      media.add("(min-width: 1081px) and (prefers-reduced-motion: no-preference)", () => {
        const horizontal = horizontalRef.current;
        const track = horizontalTrackRef.current;
        if (!horizontal || !track) return;

        horizontal.classList.add("is-horizontal-ready");
        const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const tween = gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: horizontal,
            start: "top top",
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.utils.toArray<HTMLElement>(".horizontal-story .reveal").forEach((element) => {
          gsap.from(element, {
            y: 42,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              containerAnimation: tween,
              start: "left 84%",
              once: true,
            },
          });
        });
        // Explicit end state, and the inline transform is cleared afterwards, so the cards always
        // settle at their true grid position and the CSS hover/tilt transforms can take over.
        gsap.fromTo(".horizontal-story .service-card", { y: 38, opacity: 0 }, {
          y: 0,
          opacity: 1,
          clearProps: "transform",
          duration: 0.7,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".services-grid",
            containerAnimation: tween,
            start: "left 78%",
            once: true,
          },
        });
        gsap.fromTo(".horizontal-story .project-card", { y: 44, opacity: 0 }, {
          y: 0,
          opacity: 1,
          clearProps: "transform",
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".projects-grid",
            containerAnimation: tween,
            start: "left 78%",
            once: true,
          },
        });
        gsap.from(".horizontal-story .process-step", {
          y: 25,
          opacity: 0,
          duration: 0.75,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".process-grid",
            containerAnimation: tween,
            start: "left 76%",
            once: true,
          },
        });

        const panelIds = ["about", "services", "projects", "process"];
        const goToPanel = (id: string, smooth = true) => {
          const index = panelIds.indexOf(id);
          const trigger = tween.scrollTrigger;
          if (index < 0 || !trigger) return;
          const progress = index / (panelIds.length - 1);
          window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * progress, behavior: smooth ? "smooth" : "auto" });
        };

        const onAnchorClick = (event: MouseEvent) => {
          const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a");
          const href = anchor?.getAttribute("href");
          if (!href) return;
          const url = new URL(href, window.location.href);
          if (url.pathname !== window.location.pathname || !url.hash) return;
          const id = url.hash.slice(1);
          if (!panelIds.includes(id)) return;
          event.preventDefault();
          window.history.replaceState(null, "", `#${id}`);
          goToPanel(id);
        };

        document.addEventListener("click", onAnchorClick);
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          const initialId = window.location.hash.slice(1);
          if (panelIds.includes(initialId)) goToPanel(initialId, false);
        });

        return () => {
          document.removeEventListener("click", onAnchorClick);
          horizontal.classList.remove("is-horizontal-ready");
        };
      });

      return () => window.removeEventListener("oasix:loader-complete", playHeroEntrance);
    });
    return () => { media.revert(); context.revert(); };
  }, []);

  // Service icons draw themselves in, card by card, the first time the grid comes into view.
  useEffect(() => {
    const grid = document.querySelector<HTMLElement>(".services-grid");
    if (!grid) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      grid.classList.add("is-drawn");
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  // Panel counter for the sideways section: reads how far the track has actually moved.
  useEffect(() => {
    const horizontal = horizontalRef.current;
    const track = horizontalTrackRef.current;
    const hud = storyHudRef.current;
    if (!horizontal || !track || !hud) return;
    const current = hud.querySelector<HTMLElement>(".story-hud__current");
    const label = hud.querySelector<HTMLElement>(".story-hud__label");
    let shown = -1;
    let frame = 0;
    let running = false;

    const update = () => {
      if (horizontal.classList.contains("is-horizontal-ready")) {
        const distance = track.scrollWidth - horizontal.clientWidth;
        const moved = horizontal.getBoundingClientRect().left - track.getBoundingClientRect().left;
        const progress = distance > 0 ? Math.min(1, Math.max(0, moved / distance)) : 0;
        const index = Math.round(progress * (STORY_PANELS.length - 1));
        hud.style.setProperty("--story-progress", progress.toFixed(4));
        if (index !== shown && current && label) {
          shown = index;
          current.textContent = String(index + 1).padStart(2, "0");
          label.textContent = STORY_PANELS[index];
          hud.classList.remove("is-changing");
          void hud.offsetWidth; // restart the label animation
          hud.classList.add("is-changing");
        }
      }
      if (running) frame = window.requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      hud.classList.toggle("is-visible", entry.isIntersecting && entry.intersectionRatio > 0.6);
      window.cancelAnimationFrame(frame);
      if (running) frame = window.requestAnimationFrame(update);
    }, { threshold: [0, 0.6, 1] });
    observer.observe(horizontal);
    return () => { running = false; window.cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  // Process line: the fill follows scroll position and each step powers on as the fill reaches it.
  // Progress is read from where the section actually is on screen, so it works for the pinned
  // sideways scroll on desktop and for normal vertical scrolling on smaller screens.
  useEffect(() => {
    const grid = document.querySelector<HTMLElement>(".process-grid");
    const section = grid?.closest<HTMLElement>(".process");
    const line = grid?.querySelector<HTMLElement>(".process-line");
    if (!grid || !section || !line) return;
    const steps = Array.from(grid.querySelectorAll<HTMLElement>(".process-step"));
    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const apply = (progress: number) => {
      const lineRect = line.getBoundingClientRect();
      const vertical = lineRect.height > lineRect.width;
      grid.style.setProperty("--process-progress", progress.toFixed(4));
      steps.forEach((step) => {
        const node = step.querySelector(".process-step__number")?.getBoundingClientRect();
        if (!node) return;
        const at = vertical
          ? (node.top + node.height / 2 - lineRect.top) / lineRect.height
          : (node.left + node.width / 2 - lineRect.left) / lineRect.width;
        step.classList.toggle("is-on", progress >= clamp(at) - 0.001);
      });
      grid.classList.toggle("is-complete", progress >= 0.999);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(1); return; }

    const measure = () => {
      const lineRect = line.getBoundingClientRect();
      if (lineRect.height > lineRect.width) return clamp((window.innerHeight * 0.7 - lineRect.top) / lineRect.height);
      if (section.closest(".is-horizontal-ready")) {
        const left = section.getBoundingClientRect().left;
        return clamp((window.innerWidth * 0.72 - left) / (window.innerWidth * 0.68));
      }
      return clamp((window.innerHeight * 0.85 - grid.getBoundingClientRect().top) / (window.innerHeight * 0.45));
    };

    let frame = 0;
    let running = false;
    const tick = () => { apply(measure()); if (running) frame = window.requestAnimationFrame(tick); };
    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      window.cancelAnimationFrame(frame);
      if (running) frame = window.requestAnimationFrame(tick);
      else apply(measure());
    }, { rootMargin: "20% 20% 20% 20%" });
    apply(0);
    observer.observe(section);
    return () => { running = false; window.cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  const hasManyTestimonials = testimonials.length > 1;
  const testimonialBusyRef = useRef(false);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  // Slide the current quote out and the chosen one in. Used by the arrows, the dots and swipe.
  const showTestimonial = (index: number, direction: number) => {
    const next = (index + testimonials.length) % testimonials.length;
    if (next === testimonial || testimonialBusyRef.current) return;
    testimonialBusyRef.current = true;
    gsap.to(".testimonial__content", { opacity: 0, x: direction * -22, duration: 0.18, onComplete: () => {
      setTestimonial(next);
      gsap.fromTo(".testimonial__content", { opacity: 0, x: direction * 22 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out", onComplete: () => { testimonialBusyRef.current = false; } });
    }});
  };
  const changeTestimonial = (direction: number) => showTestimonial(testimonial + direction, direction);

  const onTestimonialPointerDown = (event: React.PointerEvent) => {
    if ((event.target as Element).closest("button")) return;
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  };
  const onTestimonialPointerUp = (event: React.PointerEvent) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return; // ignore taps and vertical scrolls
    changeTestimonial(dx < 0 ? 1 : -1);
  };

  return (
    <SiteFrame>
      <main id="home">
        <section className="hero" data-section="home">
          <SocialLinks className="hero__rail" />
          <div className="shell hero__inner">
            <div className="hero__copy">
              <p className="eyebrow">OASIX WEB STUDIO</p>
              <h1><span className="hero-line"><span>We Build</span></span>{" "}<span className="hero-line hero-line--accent"><span>Digital Experiences</span></span>{" "}<span className="hero-line"><span>That Drive Growth.</span></span></h1>
              <p className="hero__lead">We help businesses turn ideas into powerful websites that engage users and grow brands.</p>
              <div className="hero__actions">
                <a className="button" href="#projects">View Our Work <ArrowIcon /></a>
                <a className="button button--ghost" href="#contact" onClick={(event) => openBrief(event)}>Let&apos;s Talk</a>
              </div>
              {/* Shown instead of the side rail when the screen is too narrow for the rail to clear the text. */}
              <SocialLinks className="hero__social" />
            </div>
            <HeroGlassCircle />
          </div>
          <div className="scroll-cue"><span>SCROLL</span><i /></div>
        </section>

        <div className="horizontal-story" ref={horizontalRef}>
          {/* Desktop only: shows which sideways panel you are on and how far through the set. */}
          <div className="story-hud" ref={storyHudRef} aria-hidden="true">
            <b className="story-hud__current">01</b>
            <span className="story-hud__bar"><i /></span>
            <span className="story-hud__total">{String(STORY_PANELS.length).padStart(2, "0")}</span>
            <em className="story-hud__label">{STORY_PANELS[0]}</em>
          </div>
          <div className="horizontal-story__track" ref={horizontalTrackRef}>
        <section className="section about" id="about" data-section="about">
          <TechBackground variant="about" />
          <div className="shell about__grid">
            <div className="about__copy reveal">
              <p className="eyebrow">ABOUT US</p>
              <h2>Your Business,<br />Your System.</h2>
              <p>OASIX builds custom software for your business, shaped around your requirements and your budget. Start small, scale later.</p>
              <ul className="about-points">
                <li><span>01</span><p><strong>Budget-friendly</strong> solutions</p></li>
                <li><span>02</span><p>Tailored to your <strong>business requirements</strong></p></li>
                <li><span>03</span><p><strong>Scalable</strong> systems for long-term growth</p></li>
              </ul>
              <figure className="about-flow" aria-label="Your needs and your budget go into OASIX and come out as your system">
                <figcaption>Built around your budget &amp; business requirements</figcaption>
                <div className="about-flow__diagram" aria-hidden="true">
                  <div className="about-flow__inputs"><span>Your needs</span><span>Your budget</span></div>
                  <svg className="about-flow__merge" viewBox="0 0 40 80" preserveAspectRatio="none"><path d="M0 18 C22 18 18 40 40 40" /><path d="M0 62 C22 62 18 40 40 40" /></svg>
                  <span className="about-flow__core"><img src="/assets/oasix-logomark.png" width="1840" height="1840" alt="" />OASIX</span>
                  <svg className="about-flow__arrow" viewBox="0 0 40 12" preserveAspectRatio="none"><path d="M0 6 H38" /></svg>
                  <span className="about-flow__output">Your system</span>
                </div>
              </figure>
              <a href="#services" className="text-link">Explore Our Services <ArrowIcon /></a>
            </div>
            <div className="about-visual reveal">
              <div className="about-visual__image"><img src="/assets/about-workstation.webp" alt="OASIX workstation displaying the studio website" /></div>
              <div className="about-visual__detail"><img src="/assets/about-mug.webp" alt="OASIX branded mug beside a desk plant" /></div>
              <div className="dot-matrix" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="section services" id="services" data-section="services">
          <TechBackground variant="services" />
          <div className="shell">
            <div className="section-heading section-heading--center reveal"><p className="eyebrow">WHAT WE DO</p><h2>Our Services</h2></div>
            <div className="services-grid">
              {services.map(([icon, title, description], index) => <ServiceCard key={title} index={index} icon={icon} title={title} description={description} />)}
            </div>
          </div>
        </section>

        <section className="section projects" id="projects" data-section="projects">
          <TechBackground variant="projects" />
          <div className="shell">
            <div className="section-heading section-heading--split reveal"><div><p className="eyebrow">FEATURED PROJECTS</p><h2>Some Things We&apos;ve Built</h2></div><TransitionLink href="/projects" className="text-link">View All Projects <ArrowIcon /></TransitionLink></div>
            <div className={featuredProjects.length === 1 ? "projects-grid projects-grid--single" : featuredProjects.length === 2 ? "projects-grid projects-grid--double" : "projects-grid"}>
              {featuredProjects.map((project, index) => (
                <TransitionLink href={`/project/${project.slug}`} className="project-card" key={project.slug}>
                  <div className="project-card__image"><img src={project.image} alt={`${project.title} website preview`} loading={index ? "lazy" : "eager"} /></div>
                  <div className="project-card__body"><p className="eyebrow">{project.category}</p><h3>{project.title}</h3><p>{project.description}</p><span className="project-arrow"><ArrowIcon /></span></div>
                </TransitionLink>
              ))}
            </div>
          </div>
        </section>

        <section className="section process" id="process" data-section="process">
          <TechBackground variant="process" />
          <div className="shell">
            <div className="section-heading reveal"><p className="eyebrow">OUR PROCESS</p><h2>From Idea to Impact</h2></div>
            <div className="process-grid">
              <div className="process-line" aria-hidden="true"><span className="process-line__fill" /><span className="process-line__head" /><span className="process-line__pulse" /></div>
              {processSteps.map(([number, icon, title, text]) => <article className="process-step" key={number}><span className="process-step__number">{number}</span><span className="process-step__icon"><LineIcon name={icon} /></span><h3>{title}</h3><p>{text}</p></article>)}
            </div>
          </div>
        </section>
          </div>
        </div>

        <section className="section testimonials" data-section="testimonials">
          <TechBackground variant="testimonials" />
          <div className="shell">
            <div className="section-heading reveal"><p className="eyebrow">TESTIMONIALS</p><h2>What Our Clients Say</h2></div>
            <div
              className={hasManyTestimonials ? "testimonial testimonial--swipe reveal" : "testimonial reveal"}
              onPointerDown={hasManyTestimonials ? onTestimonialPointerDown : undefined}
              onPointerUp={hasManyTestimonials ? onTestimonialPointerUp : undefined}
              onPointerCancel={() => { swipeStartRef.current = null; }}
            >
              <span className="quote-mark">”</span>
              <div className="testimonial__content"><p>{testimonials[testimonial].quote}</p><strong>— {testimonials[testimonial].client}</strong></div>
              {hasManyTestimonials && <div className="testimonial__controls">
                <div className="dots">{testimonials.map((_, index) => <button key={index} className={index === testimonial ? "active" : ""} onClick={() => showTestimonial(index, index > testimonial ? 1 : -1)} aria-label={`Show testimonial ${index + 1}`} />)}</div>
                <button onClick={() => changeTestimonial(-1)} aria-label="Previous testimonial">←</button><button onClick={() => changeTestimonial(1)} aria-label="Next testimonial">→</button>
              </div>}
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
