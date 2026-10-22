const focusableSelector =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

type Direction = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown";

function visibleRect(element: HTMLElement): DOMRect | null {
  if (
    element.tabIndex < 0 ||
    element.matches(":disabled, [aria-disabled='true'], [role='separator']") ||
    element.closest('[inert], [aria-hidden="true"]')
  ) return null;

  const style = getComputedStyle(element);
  if (style.visibility !== "visible" || style.display === "none") return null;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 ? rect : null;
}

function gap(startA: number, endA: number, startB: number, endB: number) {
  return Math.max(0, startA - endB, startB - endA);
}

export function moveDirectionalFocus(root: HTMLElement, direction: Direction): boolean {
  const active = document.activeElement;
  const activeRect = active instanceof HTMLElement && root.contains(active)
    ? active.getBoundingClientRect()
    : new DOMRect(innerWidth / 2, innerHeight / 2, 0, 0);
  const horizontal = direction === "ArrowLeft" || direction === "ArrowRight";
  const origin = horizontal
    ? (activeRect.left + activeRect.right) / 2
    : (activeRect.top + activeRect.bottom) / 2;
  const forward = direction === "ArrowRight" || direction === "ArrowDown";
  let best: HTMLElement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const element of root.querySelectorAll<HTMLElement>(focusableSelector)) {
    if (element === active) continue;
    const rect = visibleRect(element);
    if (!rect) continue;

    const center = horizontal
      ? (rect.left + rect.right) / 2
      : (rect.top + rect.bottom) / 2;
    const distance = forward ? center - origin : origin - center;
    if (distance <= 1) continue;

    const crossGap = horizontal
      ? gap(activeRect.top, activeRect.bottom, rect.top, rect.bottom)
      : gap(activeRect.left, activeRect.right, rect.left, rect.right);
    const score = distance * distance + 4 * crossGap * crossGap;
    if (score < bestScore) {
      best = element;
      bestScore = score;
    }
  }

  if (!best) return false;
  best.focus({ preventScroll: true });
  best.scrollIntoView({ block: "nearest", inline: "nearest" });
  return true;
}

export function shouldKeepNativeArrow(target: EventTarget | null, direction: Direction) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.closest('[contenteditable="true"]')) return true;
  const control = target.closest("input, textarea, select");
  if (!control) return false;
  if (control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) return true;
  if (!(control instanceof HTMLInputElement)) return false;
  return direction === "ArrowLeft" || direction === "ArrowRight";
}
