import type { ReactNode } from "react";

export type RadioIconName =
  | "expand"
  | "medium"
  | "close"
  | "heart"
  | "dice"
  | "repeat"
  | "previous"
  | "play"
  | "pause"
  | "next"
  | "volume"
  | "volumeMute"
  | "search"
  | "share";

export function RadioIcon({ name }: { name: RadioIconName }) {
  const paths: Record<RadioIconName, ReactNode> = {
    expand: <><path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4" /><path d="m4 4 5 5m11-5-5 5M4 20l5-5m11 5-5-5" /></>,
    medium: <><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M14 4v16" /></>,
    close: <><path d="M5 5l14 14M19 5 5 19" /></>,
    heart: <path d="M20.8 8.6c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z" />,
    dice: <>
      <g stroke="none">
        <rect x="0.5" y="2.4" width="15" height="15" rx="3.1" fill="none" stroke="var(--accent-cyan)" />
        <circle cx="4.5" cy="6.2" r="1.65" fill="var(--accent-cyan)" />
        <circle cx="8" cy="9.9" r="1.65" fill="var(--accent-cyan)" />
        <circle cx="11.5" cy="13.6" r="1.65" fill="var(--accent-cyan)" />
      </g>
      <g stroke="none">
        <rect x="18.5" y="0.6" width="15" height="15" rx="3.1" fill="none" stroke="var(--accent-violet)" />
        <circle cx="22.5" cy="4.6" r="1.65" fill="var(--accent-violet)" />
        <circle cx="29.5" cy="4.6" r="1.65" fill="var(--accent-violet)" />
        <circle cx="22.5" cy="11.6" r="1.65" fill="var(--accent-violet)" />
        <circle cx="29.5" cy="11.6" r="1.65" fill="var(--accent-violet)" />
      </g>
    </>,
    repeat: <><path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15" /><path d="m7 22-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3" /><path d="m11 11 1-1v5" /></>,
    previous: <><path d="M5 5v14" /><path d="m19 5-11 7 11 7V5Z" fill="currentColor" stroke="none" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none" />,
    pause: <><rect x="7" y="5" width="3.5" height="14" rx=".6" fill="currentColor" stroke="none" /><rect x="13.5" y="5" width="3.5" height="14" rx=".6" fill="currentColor" stroke="none" /></>,
    next: <><path d="M19 5v14" /><path d="m5 5 11 7-11 7V5Z" fill="currentColor" stroke="none" /></>,
    volume: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12" /></>,
    volumeMute: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m16 9 5 6m0-6-5 6" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></>,
  };

  return (
    <svg
      width={20}
      height={20}
      viewBox={name === "dice" ? "0 0 34 18" : "0 0 24 24"}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
