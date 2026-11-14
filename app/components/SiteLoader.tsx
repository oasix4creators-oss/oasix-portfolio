"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const waveNodes = [
  [70, 154, 2.4], [128, 132, 1.7], [186, 111, 2.1], [248, 119, 1.5],
  [312, 158, 2.5], [379, 194, 1.6], [448, 203, 2.2], [516, 176, 1.5],
  [582, 128, 2.4], [654, 92, 1.7], [724, 104, 2.1], [792, 151, 1.5],
  [858, 199, 2.4], [930, 215, 1.7], [1002, 186, 2.2], [1072, 134, 1.5],
  [1145, 102, 2.4], [1218, 113, 1.7], [1288, 153, 2.1], [1360, 178, 1.5],
] as const;

// Loader timing (ms). The full branded loader plays once per browser session;
// in-site navigation uses a short cover transition instead.
const FIRST_VISIT_MIN_MS = 2000;
const REPEAT_VISIT_MIN_MS = 700;
const ROUTE_MIN_MS = 320;
const ROUTE_COVER_MS = 200;
const INTRO_SEEN_KEY = "oasix:intro-seen";

const hasSeenIntro = () => {
  try { return window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1"; } catch { return false; }
};
const markIntroSeen = () => {
  try { window.sessionStorage.setItem(INTRO_SEEN_KEY, "1"); } catch { /* storage unavailable */ }
};

const normalizePathname = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

const scrollToHash = (hash: string, behavior: ScrollBehavior) => {
  if (!hash) return false;
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ behavior, block: "start" });
  return true;
};

export default function SiteLoader() {
  const [visible, setVisible] = useState(true);
  const [cycle, setCycle] = useState(0);
  const [routeVariant, setRouteVariant] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const routeReadyRef = useRef<(() => void) | null>(null);
  const pendingHashRef = useRef("");
  const modeRef = useRef<"initial" | "route">("initial");
  const activeRef = useRef(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const beginRouteLoader = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      modeRef.current = "route";
      setRouteVariant(true);
      setVisible(true);
      setCycle((current) => current + 1);
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      const current = new URL(window.location.href);
      const sameDocument = normalizePathname(destination.pathname) === normalizePathname(current.pathname)
        && destination.search === current.search;

      if (sameDocument) {
        if (destination.hash !== "#contact") return;
        event.preventDefault();
        window.history.pushState(null, "", `${destination.pathname}${destination.search}${destination.hash}`);
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.requestAnimationFrame(() => scrollToHash(destination.hash, reduced ? "auto" : "smooth"));
        return;
      }

      event.preventDefault();
      pendingHashRef.current = destination.hash;
      beginRouteLoader();
      window.setTimeout(() => router.push(`${destination.pathname}${destination.search}${destination.hash}`), ROUTE_COVER_MS);
    };

    window.addEventListener("oasix:navigation-start", beginRouteLoader);
    window.addEventListener("popstate", beginRouteLoader);
    document.addEventListener("click", onDocumentClick);
    return () => {
      window.removeEventListener("oasix:navigation-start", beginRouteLoader);
      window.removeEventListener("popstate", beginRouteLoader);
      document.removeEventListener("click", onDocumentClick);
    };
  }, [router]);

  useEffect(() => {
    if (modeRef.current !== "route") return;
    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let fallbackTimer = 0;

    const settleRoute = () => {
      const resolveRoute = routeReadyRef.current;
      if (!resolveRoute) {
        firstFrame = window.requestAnimationFrame(settleRoute);
        return;
      }
      secondFrame = window.requestAnimationFrame(() => {
        void (async () => {
          await document.fonts?.ready;
          const pendingImages = Array.from(document.querySelectorAll<HTMLImageElement>("main img:not([loading='lazy'])"))
            .filter((image) => !image.complete)
            .map((image) => new Promise<void>((resolve) => {
              const done = () => resolve();
              image.addEventListener("load", done, { once: true });
              image.addEventListener("error", done, { once: true });
            }));
          await Promise.race([
            Promise.all(pendingImages),
            new Promise<void>((resolve) => { fallbackTimer = window.setTimeout(resolve, 1600); }),
          ]);
          if (!cancelled) {
            routeReadyRef.current = null;
            resolveRoute();
          }
        })();
      });
    };
    firstFrame = window.requestAnimationFrame(settleRoute);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(fallbackTimer);
    };
  }, [pathname]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    let cancelled = false;
    let minimumTimer = 0;
    let readinessFallbackTimer = 0;
    let removeLoadListener: (() => void) | undefined;
    const body = document.body;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const isRoute = modeRef.current === "route";
    body.classList.add("site-loading");
    body.classList.toggle("site-loading--route", isRoute);
    root.dataset.oasixLoader = "active";

    const minimumDuration = new Promise<void>((resolve) => {
      minimumTimer = window.setTimeout(resolve, isRoute ? ROUTE_MIN_MS : hasSeenIntro() ? REPEAT_VISIT_MIN_MS : FIRST_VISIT_MIN_MS);
    });
    const pageReady = !isRoute
      ? new Promise<void>((resolve) => {
        if (document.readyState === "complete") {
          resolve();
          return;
        }
        const onLoad = () => resolve();
        window.addEventListener("load", onLoad, { once: true });
        removeLoadListener = () => window.removeEventListener("load", onLoad);
      })
      : Promise.race([
        new Promise<void>((resolve) => { routeReadyRef.current = resolve; }),
        new Promise<void>((resolve) => { readinessFallbackTimer = window.setTimeout(resolve, 2000); }),
      ]);

    void Promise.all([minimumDuration, pageReady]).then(async () => {
      if (cancelled) return;
      const { default: gsap } = await import("gsap");
      if (cancelled || !loaderRef.current) return;

      const finish = () => {
        routeReadyRef.current = null;
        body.classList.remove("site-loading", "site-loading--route");
        root.dataset.oasixLoader = "complete";
        markIntroSeen();
        if (isRoute) {
          const targetHash = pendingHashRef.current || window.location.hash;
          pendingHashRef.current = "";
          if (targetHash) {
            window.requestAnimationFrame(() => {
              if (!scrollToHash(targetHash, "auto")) {
                window.requestAnimationFrame(() => scrollToHash(targetHash, "auto"));
              }
            });
          }
        }
        window.dispatchEvent(new Event("oasix:loader-complete"));
        activeRef.current = false;
        setVisible(false);
      };

      if (isRoute) {
        gsap.to(loader, { opacity: 0, duration: reduced ? 0.2 : 0.28, ease: "power2.out", onComplete: finish });
        return;
      }

      if (reduced) {
        gsap.to(loader, { opacity: 0, duration: 0.55, ease: "power1.out", onComplete: finish });
        return;
      }

      gsap.timeline({ onComplete: finish })
        .to(".site-loader__wave", { opacity: 0, y: 14, duration: 0.42, ease: "power2.in" }, 0)
        .to(".site-loader__status", { opacity: 0, y: -5, duration: 0.3, ease: "power2.in" }, 0.08)
        .to(".site-loader__brand", { opacity: 0, y: -18, duration: 0.48, ease: "power2.in" }, 0.12)
        .to(loader, { opacity: 0, duration: 0.72, ease: "power2.inOut" }, 0.22)
        .to(".navbar", { autoAlpha: 1, y: 0, duration: 0.52, ease: "power3.out", clearProps: "transform" }, 0.78);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(minimumTimer);
      window.clearTimeout(readinessFallbackTimer);
      removeLoadListener?.();
      body.classList.remove("site-loading", "site-loading--route");
    };
  }, [cycle]);

  if (!visible) return null;

  return (
    <div className={routeVariant ? "site-loader site-loader--route" : "site-loader"} ref={loaderRef} role="status" aria-live="polite" aria-label="OASIX website loading">
      <div className="site-loader__tech" aria-hidden="true" />
      <div className="site-loader__nodes" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
      </div>
      <div className="site-loader__brand">
        <div className="site-loader__mark-wrap">
          <img className="site-loader__mark" src="/assets/oasix-logomark.png" alt="OASIX" />
        </div>
        <div className="site-loader__wordmark" aria-label="OASIX">
          <img src="/assets/oasix-logo.png" alt="" />
        </div>
        <p>WEB STUDIO</p>
        <div className="site-loader__status" aria-label="Loading">
          <span>LOADING</span><i /><i /><i />
        </div>
      </div>
      <div className="site-loader__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMid slice">
          <g className="site-loader__wave-layer site-loader__wave-layer--back">
            <path d="M-40 180 C120 70 250 250 420 146 S720 64 880 170 S1160 248 1480 112" />
            <path d="M-30 218 C155 122 286 264 470 174 S760 104 938 208 S1230 230 1470 146" />
          </g>
          <g className="site-loader__wave-layer site-loader__wave-layer--mid">
            <path d="M-40 154 C126 236 246 72 416 166 S704 238 874 128 S1168 72 1480 190" />
            <path d="M-20 122 C170 198 288 54 472 130 S758 218 944 110 S1230 86 1470 162" />
          </g>
          <g className="site-loader__wave-layer site-loader__wave-layer--front">
            <path d="M-40 194 C132 82 264 238 430 154 S722 76 892 188 S1182 234 1480 126" />
            {waveNodes.map(([cx, cy, radius], index) => <circle key={index} cx={cx} cy={cy} r={radius} />)}
          </g>
          <g className="site-loader__wave-layer site-loader__wave-layer--specks">
            <path d="M-30 236 C132 118 292 246 444 182 S720 98 902 216 S1206 238 1470 168" />
            <path d="M-40 92 C158 176 284 72 448 118 S726 202 914 94 S1204 102 1480 202" />
            <path d="M-10 170 C180 244 300 108 476 152 S762 242 950 144 S1224 92 1460 124" />
            {waveNodes.map(([cx, cy], index) => <circle key={index} cx={cx + 24} cy={cy + ((index % 3) - 1) * 22} r="1.1" />)}
          </g>
        </svg>
      </div>
    </div>
  );
}
