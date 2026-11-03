"use client";

import { useEffect, useRef } from "react";
import { resolveRadioKeyboardCommand, shouldIgnoreRadioShortcut } from "./radio-keyboard";
import { useRadio } from "./radio-provider";

export function useRadioKeyboard() {
  const radio = useRadio();
  const radioRef = useRef(radio);
  radioRef.current = radio;

  useEffect(() => {
    function handleRadioShortcut(event: KeyboardEvent) {
      const current = radioRef.current;
      if (event.defaultPrevented || shouldIgnoreRadioShortcut(event.target, event.code)) return;

      const command = resolveRadioKeyboardCommand(event);
      if (!command || !current.currentTrack) return;
      if (command.type === "next" && !current.canSkipNext) return;

      event.preventDefault();

      switch (command.type) {
        case "toggle":
          current.toggle();
          break;
        case "seek":
          current.seek(current.position + command.seconds);
          break;
        case "mute":
          current.toggleMute();
          break;
        case "previous":
          current.previous();
          break;
        case "next":
          current.next();
          break;
      }
    }

    window.addEventListener("keydown", handleRadioShortcut);
    return () => window.removeEventListener("keydown", handleRadioShortcut);
  }, []);
}
