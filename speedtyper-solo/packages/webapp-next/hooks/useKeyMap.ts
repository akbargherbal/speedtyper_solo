import { useEffect, useState } from "react";

export enum Keys {
  Tab = "Tab",
  Enter = "Enter",
  Escape = "Escape",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
}

export const triggerKeys = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*() ";

interface UseKeyMapOptions {
  preventDefault?: boolean;
  blockWhenTyping?: boolean;
  requireAlt?: boolean;
  requireCtrl?: boolean;
  requireShift?: boolean;
}

/**
 * Enhanced keyboard shortcut hook
 * @param isActive - Whether the keyboard listener is active
 * @param selectedKeys - Keys to listen for (e.g., "Tab", "Enter", "ArrowLeft")
 * @param callback - Function to call when key is pressed
 * @param options - Additional options for modifier keys and behavior
 */
export const useKeyMap = (
  isActive: boolean,
  selectedKeys: string,
  callback: () => void,
  options?: UseKeyMapOptions
) => {
  const [capsLockActive, setCapsLockActive] = useState(false);
  const preventDefault = options?.preventDefault ?? true;
  const blockWhenTyping = options?.blockWhenTyping ?? true;
  const requireAlt = options?.requireAlt ?? false;
  const requireCtrl = options?.requireCtrl ?? false;
  const requireShift = options?.requireShift ?? false;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key: pressedKey, target, altKey, ctrlKey, shiftKey } = e;

      // Track CapsLock state
      if (pressedKey === "CapsLock") {
        setCapsLockActive(!capsLockActive);
      }

      // Block shortcuts if user is typing in an input/textarea (unless explicitly allowed)
      if (blockWhenTyping) {
        const targetElement = target as HTMLElement;
        const isTypingElement =
          targetElement.tagName === "INPUT" ||
          targetElement.tagName === "TEXTAREA" ||
          targetElement.isContentEditable;
        
        if (isTypingElement) {
          return;
        }
      }

      // Check modifier key requirements
      if (requireAlt && !altKey) return;
      if (requireCtrl && !ctrlKey) return;
      if (requireShift && !shiftKey) return;

      // If modifier is required, make sure ONLY that modifier is pressed
      // (prevents Alt+Ctrl+Arrow from triggering Alt+Arrow shortcuts)
      if (requireAlt && ctrlKey) return;
      if (requireCtrl && altKey) return;

      // Check if pressed key matches our selected key(s)
      const isEnumKey = Object.values(Keys)
        .map((en) => en.toString())
        .includes(selectedKeys);

      if (isEnumKey) {
        if (pressedKey !== selectedKeys) return;
      } else {
        if (!selectedKeys.includes(pressedKey)) return;
      }

      // Key matched, execute callback
      if (preventDefault) {
        e.preventDefault();
      }
      callback();
    };

    const handleCapsLock = (e: KeyboardEvent) => {
      setCapsLockActive(e.getModifierState("CapsLock"));
    };

    if (window && document) {
      if (isActive) {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keydown", handleCapsLock);
        return () => {
          document.removeEventListener("keydown", handleKeyDown);
          document.removeEventListener("keydown", handleCapsLock);
        };
      } else {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keydown", handleCapsLock);
      }
    }
  }, [isActive, callback, selectedKeys, capsLockActive, preventDefault, blockWhenTyping, requireAlt, requireCtrl, requireShift]);

  return { capsLockActive };
};