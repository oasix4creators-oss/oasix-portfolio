"use client";

import { useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ArrowIcon } from "../components/Brand";
import { SiteFrame, TransitionLink } from "../components/SiteChrome";
import { projects } from "../data";

// Preferred display order. A category only appears once at least one project uses it,
// so the filter bar can never lead to an empty result.
const filterOrder = ["E-Commerce", "Portfolio Websites", "Business Systems", "Education", "Web Applications", "Other"];
const usedFilters = Array.from(new Set(projects.map((project) => project.filter)));
const filters = ["All", ...filterOrder.filter((item) => usedFilters.includes(item)), ...usedFilters.filter((item) => !filterOrder.includes(item))];

// Every technology used across projects, most-used first. The row only shows once there is a choice to make.
const techCounts = projects.flatMap((project) => project.technologies).reduce<Record<string, number>>((counts, tech) => ({ ...counts, [tech]: (counts[tech] ?? 0) + 1 }), {});
const technologies = Object.keys(techCounts).sort((a, b) => techCounts[b] - techCounts[a] || a.localeCompare(b));

export default function ProjectsExperience() {
  const [filter, setFilter] = useState("All");
  const [tech, setTech] = useState("");
  const visible = projects.filter((project) => (filter === "All" || project.filter === filter) && (!tech || project.technologies.includes(tech)));

  useLayoutEffect(() => {
    gsap.fromTo(".archive-card", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.52, stagger: 0.06, ease: "power3.out" });
  }, [filter, tech]);

  return (
    <SiteFrame>
      <main className="inner-page" id="home">
        <section className="archive-hero shell">
          <p className="eyebrow">SELECTED WORK — 2023/26</p>
          <h1>Systems, stores and<br /><span>digital experiences.</span></h1>
          <p>A collection of projects shaped around real business needs, clear user journeys and dependable technology.</p>
        </section>
        <section className="archive shell" aria-label="Projects archive">
          {/* A filter bar is only useful once projects span more than one category. */}
          {filters.length > 2 && <div className="filter-bar" role="group" aria-label="Filter projects">
            {filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
          </div>}
          {technologies.length > 1 && <div className="tech-filter" role="group" aria-label="Filter by technology">
            <span className="tech-filter__label">Built with</span>
            {technologies.map((item) => <button key={item} type="button" aria-pressed={tech === item} onClick={() => setTech(tech === item ? "" : item)}>{item}</button>)}
            {tech && <button type="button" className="tech-filter__clear" onClick={() => setTech("")}>Clear ×</button>}
          </div>}
          <p className="archive-count" aria-live="polite">{visible.length} {visible.length === 1 ? "project" : "projects"}{tech ? ` built with ${tech}` : ""}{filter !== "All" ? ` in ${filter}` : ""}</p>
          <div className="archive-grid">
            {visible.length ? visible.map((project, index) => (
              <TransitionLink href={`/project/${project.slug}`} className="archive-card" key={project.slug}>
                <div className="archive-card__number">0{projects.indexOf(project) + 1}</div>
                <div className="archive-card__image" style={{ "--accent": project.accent } as React.CSSProperties}><img src={project.image} alt={`${project.title} preview`} loading={index > 1 ? "lazy" : "eager"} /></div>
                <div className="archive-card__meta"><div><p className="eyebrow">{project.category}</p><h2>{project.title}</h2></div><span><ArrowIcon /></span></div>
                <p>{project.description}</p>
                <ul className="archive-card__tech" aria-label="Technologies">{project.technologies.map((item) => <li key={item} className={item === tech ? "is-match" : ""}>{item}</li>)}</ul>
              </TransitionLink>
            )) : <div className="empty-state"><p className="eyebrow">COMING SOON</p><h2>New work is being prepared.</h2><p>There are no published projects matching this filter yet.</p></div>}
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
