"use client";

import { useEffect, useRef, useState } from "react";

// One small status message at a time, bottom centre. Anything can show one:
//   showToast("Email copied")
export const TOAST_EVENT = "oasix:toast";
export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
}
export const EMAIL = "oasix4creators@gmail.com";
export function copyEmail() {
  const done = () => showToast("Email copied — oasix4creators@gmail.com");
  const fallback = () => {
    const field = document.createElement("textarea");
    field.value = EMAIL; field.setAttribute("readonly", ""); field.style.position = "fixed"; field.style.opacity = "0";
    document.body.appendChild(field); field.select();
    const ok = document.execCommand("copy"); field.remove();
    if (ok) done(); else showToast(`Couldn’t copy. The email is ${EMAIL}`);
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(EMAIL).then(done, fallback);
  else fallback();
}

export default function Toast() {
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);
  const timer = useRef(0);
  useEffect(() => {
    const onToast = (event: Event) => {
      setMessage((event as CustomEvent<string>).detail);
      setCount((value) => value + 1);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setMessage(""), 2600);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => { window.removeEventListener(TOAST_EVENT, onToast); window.clearTimeout(timer.current); };
  }, []);
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {message && (
        <p className="toast" key={count}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5l3.2 3.2L15 6.8" pathLength="1" /></svg>
          {message}
        </p>
      )}
    </div>
  );
}
