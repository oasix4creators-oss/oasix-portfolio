export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a href="/" className={`brand ${compact ? "brand--compact" : ""}`} aria-label="OASIX Web Studio home">
      <img src={compact ? "/assets/oasix-logomark.png" : "/assets/oasix-logo.png"} width={compact ? 1840 : 1264} height={compact ? 1840 : 328} alt="OASIX" />
    </a>
  );
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 18 18 6M8 6h10v10" />
    </svg>
  );
}

export function LineIcon({ name }: { name: string }) {
  // pathLength lets CSS draw any of these shapes in with a dash offset of 1 → 0.
  const common = { pathLength: 1, fill: "none", stroke: "currentColor", strokeWidth: 1.65, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<string, React.ReactNode> = {
    website: <><rect x="3" y="4" width="18" height="13" rx="2" {...common}/><path d="M3 8h18M8 21h8M12 17v4" {...common}/></>,
    education: <><path d="m3 9 9-5 9 5-9 5-9-5Z" {...common}/><path d="M7 12v4c2 2 8 2 10 0v-4M21 9v6" {...common}/></>,
    business: <><rect x="3" y="7" width="18" height="13" rx="2" {...common}/><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" {...common}/></>,
    diamond: <><path d="m3 9 4-5h10l4 5-9 11L3 9Z" {...common}/><path d="M3 9h18M7 4l5 16 5-16" {...common}/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" {...common}/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" {...common}/></>,
    document: <><path d="M6 3h8l4 4v14H6V3Z" {...common}/><path d="M14 3v5h5M9 13h6M9 17h6" {...common}/></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3" {...common}/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" {...common}/></>,
    device: <><rect x="4" y="3" width="16" height="18" rx="2" {...common}/><path d="M9 6h6M11 18h2" {...common}/></>,
    discover: <><circle cx="11" cy="11" r="6" {...common}/><path d="m16 16 4 4M9 11l1.5 1.5L14 9" {...common}/></>,
    design: <><path d="m4 20 4-1 10-10-3-3L5 16l-1 4ZM13 8l3 3M15 6l2-2 3 3-2 2" {...common}/></>,
    develop: <><path d="m8 5-5 7 5 7M16 5l5 7-5 7M14 3l-4 18" {...common}/></>,
    launch: <><path d="M14 5c3-2 5-2 7-2 0 2 0 4-2 7l-5 5-5-5 5-5Z" {...common}/><path d="m9 10-4 1-2 4 6-1M14 15l-1 6 4-2 1-4M7 17l-3 3" {...common}/></>,
    support: <><path d="M4 13v-2a8 8 0 0 1 16 0v2" {...common}/><path d="M4 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2ZM20 13h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2ZM17 19c-1 2-3 2-5 2" {...common}/></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" {...common}/><circle cx="12" cy="10" r="2.5" {...common}/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name] ?? paths.website}</svg>;
}
