export type RadioLayoutMode = "split" | "fullscreen" | "docked";

export function resolveRadioLayoutMode({
  fullscreen,
  docked = false,
}: {
  fullscreen: boolean;
  docked?: boolean;
}): RadioLayoutMode {
  if (fullscreen) return "fullscreen";
  if (docked) return "docked";
  return "split";
}
