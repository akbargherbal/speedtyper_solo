import { motion } from "framer-motion";
import { useCodeStore } from "../state/code-store";
import { useSettingsStore } from "../state/settings-store";
import { useEffect } from "react";

interface NextCharProps {
  focused: boolean;
}

export function NextChar({ focused }: NextCharProps) {
  const debugMode = useSettingsStore((state) => state.debugMode);
  const index = useCodeStore((state) => state.index);
  const getNextChar = useCodeStore((state) => state.currentChar);
  const nextChar = getNextChar().replace(/\n/g, "↵\n");

  // Debug logging (only in debug mode)
  useEffect(() => {
    if (debugMode) {
      console.log(
        `[Caret] index=${index}, char="${nextChar.replace(/\n/g, "\\n")}"`
      );
    }
  }, [index, nextChar, debugMode]);

  return (
    <span
      data-active="true"
      className="bg-yellow-500 text-black font-semibold px-1 -mx-0.5 rounded-sm transition-all duration-75 ease-out"
      style={{
        transition: "all 100ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {nextChar}
    </span>
  );
}
