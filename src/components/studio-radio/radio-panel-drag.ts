const FINISH_GAP = 56;

export function getRadioDragPreview(shellWidth: number, sidebarMaximum: number, requestedWidth: number, pointerDistanceFromLeft: number) {
  const available = Math.max(0, shellWidth - sidebarMaximum);
  const width = Math.min(available, Math.max(0, requestedWidth - sidebarMaximum));

  return {
    width,
    ready: width > 0 && pointerDistanceFromLeft <= FINISH_GAP
  };
}
