"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useRadio } from "@/features/radio/radio-provider";
import { StudioRadioShell } from "./studio-radio-shell";

export function PublicExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { tracks } = useRadio();
  const sharedSlug = pathname.startsWith("/musica/") ? pathname.slice("/musica/".length) : null;
  const publishedMusicRoute = sharedSlug !== null && tracks.some((track) => track.shareSlug === sharedSlug);

  if (pathname === "/" || pathname.startsWith("/studio") || publishedMusicRoute) {
    return <StudioRadioShell>{children}</StudioRadioShell>;
  }

  return <>{children}</>;
}
