export type RadioLayoutMode = "split" | "custom" | "focus" | "fullscreen" | "docked";

export function resolveRadioLayoutMode({
  fullscreen,
  docked = false,
  expanded,
  width,
  defaultWidth
}: {
  fullscreen: boolean;
  docked?: boolean;
  expanded: boolean;
  width: number | null;
  defaultWidth: number | null;
}): RadioLayoutMode {
  if (fullscreen) return "fullscreen";
  if (docked) return "docked";
  if (expanded) return "focus";
  if (
    width !== null &&
    defaultWidth !== null &&
    Math.abs(width - defaultWidth) > 1
  ) {
    return "custom";
  }
  return "split";
}
