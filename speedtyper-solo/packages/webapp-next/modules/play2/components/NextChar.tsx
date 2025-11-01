import { motion } from 'framer-motion';
import { useNodeRect } from '../hooks/useNodeRect';
import { useCodeStore } from '../state/code-store';
import { useSettingsStore } from '../state/settings-store';
import { useState, useEffect } from 'react';
import { SmoothCaret } from './SmoothCaret';

interface NextCharProps {
  focused: boolean;
}

export function NextChar({ focused }: NextCharProps) {
  const useSmoothCaret = useSettingsStore((state) => state.smoothCaret);
  const caretStyle = useSettingsStore((state) => state.caretStyle);
  const debugMode = useSettingsStore((state) => state.debugMode);
  const index = useCodeStore((state) => state.index);

  const [{ top, left }, nextCharRef] = useNodeRect<HTMLSpanElement>(
    index.toString()
  );

  const getNextChar = useCodeStore((state) => state.currentChar);
  const nextChar = getNextChar().replace(/\n/g, '↵\n');

  // Fix hydration error by only rendering SmoothCaret on client
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug logging (only in debug mode)
  useEffect(() => {
    if (debugMode && isClient) {
      console.log(`[Caret] index=${index}, top=${top}, left=${left}, char="${nextChar.replace(/\n/g, '\\n')}"`);
    }
  }, [index, top, left, nextChar, debugMode, isClient]);

  // Smooth caret removed - yellow background provides sufficient visual indicator
  
  return (
    <>
      <motion.span
        ref={nextCharRef}
        data-active="true"
        className={`rounded-sm ${
          caretStyle === 'block'
            ? 'bg-purple-500 text-white font-bold px-1 -mx-0.5'
            : 'bg-yellow-500 text-black font-semibold px-1 -mx-0.5'
        }`}
      >
        {nextChar}
      </motion.span>
    </>
  );
}