export type RadioSnapKind = "compact" | "balanced" | "focus";

export interface RadioSnapPoint {
  kind: RadioSnapKind;
  width: number;
}

export function createRadioSnapPoints(
  compactWidth: number,
  balancedWidth: number,
  focusWidth: number
): RadioSnapPoint[] {
  const candidates: RadioSnapPoint[] = [
    { kind: "compact", width: compactWidth },
    { kind: "balanced", width: balancedWidth },
    { kind: "focus", width: focusWidth }
  ];

  const result: RadioSnapPoint[] = [];
  for (const point of candidates) {
    const existing = result.find((candidate) => Math.abs(candidate.width - point.width) < 1);
    if (!existing) result.push(point);
    else if (point.kind === "focus") existing.kind = "focus";
  }

  return result.sort((a, b) => a.width - b.width);
}

export function getRadioDragMagnet(
  requestedWidth: number,
  snapPoints: RadioSnapPoint[],
  threshold = 28
) {
  const nearest = snapPoints.reduce<RadioSnapPoint | null>((best, point) => {
    if (!best) return point;
    return Math.abs(point.width - requestedWidth) < Math.abs(best.width - requestedWidth)
      ? point
      : best;
  }, null);

  if (!nearest) return { width: requestedWidth, snap: null as RadioSnapKind | null };

  const distance = Math.abs(nearest.width - requestedWidth);
  if (distance > threshold) {
    return { width: requestedWidth, snap: null as RadioSnapKind | null };
  }

  const proximity = 1 - distance / threshold;
  const attraction = 0.18 + 0.58 * proximity * proximity;

  return {
    width: requestedWidth + (nearest.width - requestedWidth) * attraction,
    snap: nearest.kind
  };
}

export function getRadioReleaseTarget(
  currentWidth: number,
  widthVelocity: number,
  snapPoints: RadioSnapPoint[],
  captureDistance = 68,
  flingVelocity = 0.48
) {
  if (snapPoints.length === 0) {
    return { width: currentWidth, snap: null as RadioSnapKind | null };
  }

  const sorted = [...snapPoints].sort((a, b) => a.width - b.width);

  if (Math.abs(widthVelocity) >= flingVelocity) {
    const direction = Math.sign(widthVelocity);
    const directional = direction > 0
      ? sorted.find((point) => point.width > currentWidth + 2)
      : [...sorted].reverse().find((point) => point.width < currentWidth - 2);

    if (directional) return { width: directional.width, snap: directional.kind };
  }

  const projectedWidth = currentWidth + widthVelocity * 120;
  const nearest = sorted.reduce((best, point) =>
    Math.abs(point.width - projectedWidth) < Math.abs(best.width - projectedWidth)
      ? point
      : best
  );

  if (Math.abs(nearest.width - projectedWidth) <= captureDistance) {
    return { width: nearest.width, snap: nearest.kind };
  }

  return { width: currentWidth, snap: null as RadioSnapKind | null };
}

export function getRadioDragPreview(
  shellWidth: number,
  sidebarMaximum: number,
  requestedWidth: number,
  pointerDistanceFromLeft: number,
  startDistanceFromLeft: number
) {
  const available = Math.max(0, shellWidth - sidebarMaximum);
  const width = Math.min(available, Math.max(0, requestedWidth - sidebarMaximum));

  return {
    width,
    ready: width > 0 && pointerDistanceFromLeft <= startDistanceFromLeft / 2
  };
}
