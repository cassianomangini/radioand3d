"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { StudioRadioShell } from "./studio-radio-shell";

export function PublicExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/studio") {
    return <StudioRadioShell />;
  }

  return <>{children}</>;
}
