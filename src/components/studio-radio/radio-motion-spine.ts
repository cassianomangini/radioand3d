export type RadioLayoutMode = "split" | "custom" | "focus" | "fullscreen";

export function resolveRadioLayoutMode({
  fullscreen,
  expanded,
  width,
  defaultWidth
}: {
  fullscreen: boolean;
  expanded: boolean;
  width: number | null;
  defaultWidth: number | null;
}): RadioLayoutMode {
  if (fullscreen) return "fullscreen";
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
