"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { services } from "../data";

// Three-step project brief that slides in from the right. Opened by any element that dispatches
// OPEN_BRIEF_EVENT: every "Let's Talk" button (navbar, hero, contact) and the command palette.
// openBrief() keeps the link's href as a no-JavaScript fallback.
export function openBrief(event?: { preventDefault(): void }, delay = 0) {
  event?.preventDefault();
  window.setTimeout(() => window.dispatchEvent(new Event(OPEN_BRIEF_EVENT)), delay);
}
//
// Delivery: Web3Forms emails each brief to the address the access key was created with.
// Paste the key below. Until then the form opens the visitor's email app with the brief filled in.
const WEB3FORMS_ACCESS_KEY = "3a7ba9b9-687b-4d91-b783-6990c0d51084"; // public by design
const EMAIL = "oasix4creators@gmail.com";
export const OPEN_BRIEF_EVENT = "oasix:open-brief";

const SERVICE_OPTIONS = [...services.map(([, title]) => title), "Not sure yet"];
// Draft ranges: confirm the currency and bands you want to show.
const BUDGETS = ["Under $1,000", "$1,000 – $3,000", "$3,000 – $7,000", "$7,000+", "Not sure yet"];
const TIMELINES = ["As soon as possible", "1 – 3 months", "3+ months", "Flexible"];
const STEPS = ["What", "Scope", "You"];

type Status = "idle" | "sending" | "sent" | "mailto" | "error";
type Brief = { services: string[]; budget: string; timeline: string; name: string; email: string; company: string; message: string };
const EMPTY: Brief = { services: [], budget: "", timeline: "", name: "", email: "", company: "", message: "" };

export default function ProjectBrief() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<Brief>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onOpen = () => { returnFocus.current = document.activeElement as HTMLElement | null; setOpen(true); };
    window.addEventListener(OPEN_BRIEF_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_BRIEF_EVENT, onOpen);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("menu-open");
    if (status === "sent" || status === "mailto") { setBrief(EMPTY); setStep(0); setStatus("idle"); }
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("button, input, textarea")?.focus());
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("keydown", onKey); document.body.classList.remove("menu-open"); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => { panelRef.current?.querySelector<HTMLElement>(".brief__step input, .brief__step button, .brief__step textarea")?.focus({ preventScroll: true }); setError(""); }, [step]);

  function close() { setOpen(false); returnFocus.current?.focus?.({ preventScroll: true }); }
  const set = <K extends keyof Brief>(key: K, value: Brief[K]) => { setError(""); if (status === "error") setStatus("idle"); setBrief((current) => ({ ...current, [key]: value })); };
  const toggleService = (title: string) => set("services", brief.services.includes(title) ? brief.services.filter((item) => item !== title) : [...brief.services, title]);

  const check = (index: number) => {
    if (index === 0 && !brief.services.length) return "Pick at least one, or “Not sure yet”.";
    if (index === 1 && (!brief.budget || !brief.timeline)) return "Choose a budget range and a timeline.";
    if (index === 2) {
      if (!brief.name.trim()) return "Add your name.";
      if (!/^\S+@\S+\.\S+$/.test(brief.email.trim())) return "Add an email address we can reply to.";
      if (brief.message.trim().length < 10) return "Tell us a little about the project.";
    }
    return "";
  };
  const next = () => { const problem = check(step); if (problem) setError(problem); else setStep(step + 1); };

  const summary = () => [
    `Name: ${brief.name.trim()}`, `Email: ${brief.email.trim()}`, brief.company.trim() && `Company: ${brief.company.trim()}`,
    `Services: ${brief.services.join(", ")}`, `Budget: ${brief.budget}`, `Timeline: ${brief.timeline}`, "", brief.message.trim(),
  ].filter((line) => line !== "").join("\n");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < 2) { next(); return; }
    const problem = check(2);
    if (problem) { setError(problem); return; }
    if ((new FormData(event.currentTarget).get("botcheck") ?? "") !== "") return; // honeypot: bots fill it
    const subject = `New project brief from ${brief.name.trim()}`;
    if (!WEB3FORMS_ACCESS_KEY) {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary())}`;
      setStatus("mailto");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY, subject, from_name: "OASIX website",
          name: brief.name.trim(), email: brief.email.trim(), company: brief.company.trim() || "-",
          services: brief.services.join(", "), budget: brief.budget, timeline: brief.timeline, message: brief.message.trim(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.message || "Request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (!open) return null;
  const done = status === "sent" || status === "mailto";
  const mailtoHref = `mailto:${EMAIL}?subject=${encodeURIComponent("Project brief")}&body=${encodeURIComponent(summary())}`;

  return (
    <div className="brief" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="brief__panel" role="dialog" aria-modal="true" aria-labelledby="brief-title" ref={panelRef}>
        <header className="brief__head">
          <p className="eyebrow">PROJECT BRIEF</p>
          <button type="button" className="brief__close" aria-label="Close" onClick={close}><span /><span /></button>
          <h2 id="brief-title">{status === "sent" ? "Brief received." : status === "mailto" ? "Almost there." : "Tell us what you’re building."}</h2>
          {!done && (
            <ol className="brief__progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
              {STEPS.map((label, index) => (
                <li key={label} className={index < step ? "is-done" : index === step ? "is-current" : ""}>
                  <span>{String(index + 1).padStart(2, "0")}</span>{label}
                </li>
              ))}
            </ol>
          )}
        </header>

        {done ? (
          <div className="brief__done" aria-live="polite">
            <svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" pathLength="1" /><path d="M15 27l7 7 15-16" pathLength="1" /></svg>
            {status === "sent"
              ? <p>Thanks, {brief.name.trim().split(" ")[0]}. Your brief is in our inbox and we’ll get back to you at <b>{brief.email.trim()}</b>.</p>
              : <p>Your email app should have opened with the brief filled in. Press send there and it reaches us. If nothing opened, write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>}
            <button type="button" className="button" onClick={close}>Done</button>
          </div>
        ) : (
          <form className="brief__form" onSubmit={submit} noValidate>
            <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="brief__trap" aria-hidden="true" />
            <div className="brief__step" key={step}>
              {step === 0 && (
                <fieldset>
                  <legend>What do you need? <small>Pick any that apply.</small></legend>
                  <div className="brief__chips">
                    {SERVICE_OPTIONS.map((title) => (
                      <button type="button" key={title} aria-pressed={brief.services.includes(title)} onClick={() => toggleService(title)}>{title}</button>
                    ))}
                  </div>
                </fieldset>
              )}
              {step === 1 && (
                <>
                  <fieldset>
                    <legend>Budget range</legend>
                    <div className="brief__chips">
                      {BUDGETS.map((value) => <button type="button" key={value} aria-pressed={brief.budget === value} onClick={() => set("budget", value)}>{value}</button>)}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend>Timeline</legend>
                    <div className="brief__chips">
                      {TIMELINES.map((value) => <button type="button" key={value} aria-pressed={brief.timeline === value} onClick={() => set("timeline", value)}>{value}</button>)}
                    </div>
                  </fieldset>
                </>
              )}
              {step === 2 && (
                <div className="brief__fields">
                  <label><span>Name</span><input value={brief.name} onChange={(event) => set("name", event.target.value)} autoComplete="name" required /></label>
                  <label><span>Email</span><input type="email" value={brief.email} onChange={(event) => set("email", event.target.value)} autoComplete="email" required /></label>
                  <label className="brief__wide"><span>Company or brand <small>optional</small></span><input value={brief.company} onChange={(event) => set("company", event.target.value)} autoComplete="organization" /></label>
                  <label className="brief__wide"><span>About the project</span><textarea rows={5} value={brief.message} onChange={(event) => set("message", event.target.value)} placeholder="What it is, who it’s for, and anything you already have (designs, a current site, examples you like)." required /></label>
                </div>
              )}
            </div>
            <p className="brief__error" role="alert">{status === "error" ? <>That didn’t go through. Try again, or <a href={mailtoHref}>send it by email</a>.</> : error}</p>
            <div className="brief__actions">
              {step > 0 && <button type="button" className="brief__back" onClick={() => setStep(step - 1)}>Back</button>}
              <button type="submit" className="button" disabled={status === "sending"}>
                {step < 2 ? "Next" : status === "sending" ? "Sending…" : "Send brief"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
