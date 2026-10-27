export type RadioKeyboardCommand =
  | { type: "toggle" }
  | { type: "seek"; seconds: number }
  | { type: "mute" }
  | { type: "previous" }
  | { type: "next" };

export interface RadioKeyboardInput {
  code: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  repeat?: boolean;
}

export function resolveRadioKeyboardCommand(
  input: RadioKeyboardInput
): RadioKeyboardCommand | null {
  if (input.ctrlKey || input.metaKey || input.altKey) return null;

  let command: RadioKeyboardCommand | null = null;

  switch (input.code) {
    case "Space":
    case "KeyK":
      command = { type: "toggle" };
      break;
    case "ArrowLeft":
      command = { type: "seek", seconds: -5 };
      break;
    case "ArrowRight":
      command = { type: "seek", seconds: 5 };
      break;
    case "KeyJ":
      command = { type: "seek", seconds: -10 };
      break;
    case "KeyL":
      command = { type: "seek", seconds: 10 };
      break;
    case "KeyM":
      command = { type: "mute" };
      break;
    case "KeyP":
      command = { type: "previous" };
      break;
    case "KeyN":
      command = { type: "next" };
      break;
  }

  if (!command) return null;
  if (input.repeat && command.type !== "seek") return null;
  return command;
}

export function shouldIgnoreRadioShortcut(target: EventTarget | null, code: string) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target.closest('input, textarea, select, [contenteditable="true"], [role="slider"]')) return true;
  if (code === "Space" && target.closest("button, a[href]")) return true;
  return false;
}
