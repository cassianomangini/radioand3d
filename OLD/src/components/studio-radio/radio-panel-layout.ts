// Pure layout geometry for the fixed desktop sidebar width.
export const RADIO_WIDTH_RATIO = 0.235;
export const MAX_RADIO_WIDTH = 1120;
export const MIN_STUDIO_WIDTH = 640;
export const RESIZE_GUTTER = 32;

export function getMinRadioWidth(shellWidth: number) {
  return Math.round(Math.max(340, shellWidth * RADIO_WIDTH_RATIO));
}

export function getMaxRadioWidth(shellWidth: number) {
  return Math.min(
    MAX_RADIO_WIDTH,
    Math.max(getMinRadioWidth(shellWidth), shellWidth - MIN_STUDIO_WIDTH - RESIZE_GUTTER)
  );
}

export function clampRadioWidth(shellWidth: number, requested: number) {
  return Math.min(
    Math.max(requested, getMinRadioWidth(shellWidth)),
    getMaxRadioWidth(shellWidth)
  );
}

export function getDefaultWidth(shellWidth: number) {
  return clampRadioWidth(shellWidth, Math.round(shellWidth * 0.3));
}

export function getRouteDefaultRadioWidth(shellWidth: number, _route: "home" | "detail") {
  return getDefaultWidth(shellWidth);
}

