"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRadioKeyboard } from "@/features/radio/use-radio-keyboard";
import { MobileRadioBar } from "./mobile-radio-bar";
import { RadioPanel } from "./radio-panel";
import { SiteHeader } from "./site-header";
import styles from "../app/page.module.css";

const mobileQuery = "(max-width: 1023px)";

export function SiteShell({ children }: { children: ReactNode }) {
  const [split, setSplit] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [docked, setDocked] = useState(false);
  const [mobileLayout, setMobileLayout] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileHost, setMobileHost] = useState<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef(expanded);
  const mobileOpenRef = useRef(mobileOpen);
  expandedRef.current = expanded;
  mobileOpenRef.current = mobileOpen;
  const frameClass = expanded ? styles.expanded : split ? styles.split : styles.single;
  const showDesktopRadio = split && !mobileLayout;

  useRadioKeyboard();

  useEffect(() => {
    const media = window.matchMedia(mobileQuery);
    const apply = () => {
      const mobile = media.matches;
      setMobileLayout(mobile);
      if (mobile && expandedRef.current) setMobileOpen(true);
      if (!mobile && mobileOpenRef.current) {
        setMobileOpen(false);
        setDocked(false);
        setSplit(true);
        setExpanded(true);
      }
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setMobileHost(document.body);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      setMobileOpen(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  function openRadio() {
    if (window.matchMedia(mobileQuery).matches) {
      setMobileOpen(true);
      return;
    }
    setMobileOpen(false);
    setDocked(false);
    setSplit(true);
    setExpanded(true);
  }

  function closeExpanded() {
    setExpanded(false);
    setMobileOpen(false);
  }

  const mobileRadio = mobileOpen && mobileHost
    ? createPortal(
      <div
        ref={dialogRef}
        className={styles.mobileRadio}
        role="dialog"
        aria-modal="true"
        aria-label="CM Rádio"
        tabIndex={-1}
      >
        <RadioPanel mobile expanded={false} onClose={() => setMobileOpen(false)} />
      </div>,
      mobileHost
    )
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.chrome}>
        <SiteHeader
          radioOpen={expanded || mobileOpen}
          docked={docked}
          onHome={closeExpanded}
          onOpenRadio={openRadio}
          onRestoreRadio={() => {
            setDocked(false);
            setExpanded(false);
            setSplit(true);
          }}
        />
        <MobileRadioBar active={mobileLayout && !mobileOpen} onOpen={() => setMobileOpen(true)} />
      </div>
      <div className={frameClass}>
        <main className={styles.stage}>{children}</main>
        {showDesktopRadio ? (
          <>
            <div className={styles.bar} />
            <aside className={styles.side}>
              <RadioPanel
                expanded={expanded}
                onClose={() => {
                  setExpanded(false);
                  setSplit(false);
                  setDocked(true);
                }}
                onToggleSize={() => setExpanded((current) => !current)}
              />
            </aside>
          </>
        ) : null}
      </div>
      {mobileRadio}
    </div>
  );
}
