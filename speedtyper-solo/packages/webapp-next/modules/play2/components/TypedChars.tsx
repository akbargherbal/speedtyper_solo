import highlightjs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import { useEffect, useRef } from "react";
import { useCodeStore } from "../state/code-store";
import { useSettingsStore } from "../state/settings-store";

interface TypedCharsProps {
  language: string;
}

export function TypedChars({ language }: TypedCharsProps) {
  const isSyntaxHighlightingEnabled = useSettingsStore(
    (s) => s.syntaxHighlighting
  );
  useCodeStore((state) => state.code);
  const index = useCodeStore((state) => state.index);
  const typedChars = useCodeStore((state) => state.correctChars);
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isSyntaxHighlightingEnabled) return;
    if (typedRef.current) {
      // Clear the highlighted flag before re-highlighting
      delete typedRef.current.dataset.highlighted;
      highlightjs.highlightElement(typedRef.current);
    }
  }, [index, isSyntaxHighlightingEnabled]);

  return (
    <span
      className={`font-medium ${language} ${!isSyntaxHighlightingEnabled ? 'text-green-400' : ''}`}
      ref={typedRef}
      style={{ background: "none" }}
    >
      {typedChars()}
    </span>
  );
}