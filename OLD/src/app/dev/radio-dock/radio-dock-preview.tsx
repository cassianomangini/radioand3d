"use client";

import { StudioRadioShell } from "@/components/studio-radio/studio-radio-shell";

/**
 * After 03c was integrated, the dev URL renders the SAME working shell as
 * the site. The original stand-alone motion overlay was retired to avoid
 * competing drag handlers and duplicate miniature players.
 *
 * The route itself remains development-only (404 in production).
 */
export function RadioDockPreview() {
  return <StudioRadioShell />;
}
