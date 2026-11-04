"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileClient = {
  render(container: HTMLElement, options: {
    sitekey: string;
    action: string;
    theme: string;
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  }): string;
  remove(widgetId: string): void;
};
declare global {
  interface Window { turnstile?: TurnstileClient }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function QuoteTurnstile({
  siteKey, onToken,
}: {
  siteKey: string;
  onToken: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let widgetId: string | null = null;
    let script = document.querySelector<HTMLScriptElement>("script[data-cm-quote-turnstile]");
    const mount = () => {
      if (cancelled || widgetId || !containerRef.current || !window.turnstile) return;
      try {
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: "quote_intake",
          theme: "auto",
          callback: (token) => { onToken(token); setError(""); },
          "expired-callback": () => { onToken(""); setError("A verificação expirou. Confirme novamente."); },
          "error-callback": () => { onToken(""); setError("Não foi possível verificar. Recarregue a página."); },
        });
      } catch {
        setError("Não foi possível carregar a verificação. Recarregue a página.");
      }
    };
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.dataset.cmQuoteTurnstile = "true";
      document.head.appendChild(script);
    }
    script.addEventListener("load", mount);
    script.addEventListener("error", () => { if (!cancelled) setError("Verificação indisponível."); }, { once: true });
    mount();
    const deadline = window.setTimeout(() => {
      if (!cancelled && !widgetId) setError("Não foi possível carregar a verificação. Recarregue a página.");
    }, 12_000);
    return () => {
      cancelled = true;
      window.clearTimeout(deadline);
      script?.removeEventListener("load", mount);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      onToken("");
    };
  }, [siteKey, onToken]);

  return (
    <div aria-label="Proteção contra envios automatizados">
      <div ref={containerRef} />
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
