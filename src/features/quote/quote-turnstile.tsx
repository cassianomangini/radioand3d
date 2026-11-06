"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileClient = {
  render(container: HTMLElement, options: {
    sitekey: string;
    action: string;
    theme: "auto";
    retry: "never";
    "refresh-expired": "manual";
    callback: (token: string) => void;
    "expired-callback": () => void;
    "timeout-callback": () => void;
    "error-callback": (code: string) => void;
  }): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
};
declare global {
  interface Window { turnstile?: TurnstileClient }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function errorMessage(code: string): string {
  if (["110100", "110110", "110200", "400020", "400021", "400070"].includes(code)) {
    return `A verificação está indisponível neste endereço (código ${code}). Seus dados continuam preenchidos.`;
  }
  if (code === "200100") return `A verificação encontrou um problema de horário ou cache (código ${code}). Seus dados continuam preenchidos.`;
  return `Não foi possível concluir a verificação${code ? ` (código ${code})` : ""}. Tente novamente sem perder o pedido.`;
}

export function QuoteTurnstile({
  siteKey, onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let script = document.querySelector<HTMLScriptElement>("script[data-cm-quote-turnstile]");
    if (script?.dataset.cmQuoteTurnstileState === "error") {
      script.remove();
      script = null;
    }
    const mount = () => {
      if (cancelled || widgetRef.current || !containerRef.current || !window.turnstile) return;
      try {
        widgetRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: "quote_intake",
          theme: "auto",
          retry: "never",
          "refresh-expired": "manual",
          callback: (token) => { if (!cancelled) { onToken(token); setError(""); } },
          "expired-callback": () => { if (!cancelled) { onToken(""); setError("A verificação expirou. Tente novamente para continuar."); } },
          "timeout-callback": () => { if (!cancelled) { onToken(""); setError("A verificação demorou demais. Tente novamente para continuar."); } },
          "error-callback": (code) => {
            if (cancelled) return;
            onToken("");
            console.warn("[quote-turnstile] widget error", { code, hostname: location.hostname });
            setError(errorMessage(code));
          },
        });
      } catch (cause) {
        console.warn("[quote-turnstile] widget render failed", cause);
        setError("Não foi possível iniciar a verificação. Tente novamente.");
      }
    };
    const onLoad = () => { if (script) script.dataset.cmQuoteTurnstileState = "loaded"; mount(); };
    const onScriptError = () => {
      if (script) script.dataset.cmQuoteTurnstileState = "error";
      if (!cancelled) setError("A verificação está indisponível. Tente novamente.");
    };
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.dataset.cmQuoteTurnstile = "true";
    }
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onScriptError);
    if (!script.isConnected) document.head.appendChild(script);
    mount();
    const deadline = window.setTimeout(() => {
      if (!cancelled && !widgetRef.current) setError("A verificação não carregou. Tente novamente.");
    }, 12_000);
    return () => {
      cancelled = true;
      window.clearTimeout(deadline);
      script?.removeEventListener("load", onLoad);
      script?.removeEventListener("error", onScriptError);
      if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current);
      widgetRef.current = null;
      onToken("");
    };
  }, [siteKey, onToken, attempt]);

  function retry() {
    onToken("");
    setError("");
    if (widgetRef.current && window.turnstile) {
      try { window.turnstile.reset(widgetRef.current); return; }
      catch { /* Recreate the widget below. */ }
    }
    setAttempt((current) => current + 1);
  }

  return (
    <div aria-label="Proteção contra envios automatizados">
      <div ref={containerRef} />
      {error ? <p role="alert">{error} <button type="button" onClick={retry}>Tentar novamente</button></p> : null}
    </div>
  );
}
