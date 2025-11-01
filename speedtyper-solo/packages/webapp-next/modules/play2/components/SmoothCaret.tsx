import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCodeStore } from '../state/code-store';
import { useSettingsStore } from '../state/settings-store';

const useHasLoadedCode = () => {
  const code = useCodeStore((state) => state.code);
  return code.length > 0;
};

export const PRIMARY_PINK_COLOR = '#d6bcfa';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

export const SmoothCaret = ({ top, left }: { top: number; left: number }) => {
  const hasLoaded = useHasLoadedCode();
  const isPlaying = useCodeStore((state) => state.isPlaying)();
  const caretStyle = useSettingsStore((state) => state.caretStyle);

  const isInitialRender = useRef(true);

  useEffect(() => {
    if (top > 0 || left > 0) {
      isInitialRender.current = false;
    }
  }, [top, left]);

  const getCaretDimensions = () => {
    switch (caretStyle) {
      case 'line':
      case 'line-smooth':
        return { height: '1.4em', width: '2px' };
      case 'block':
        return { height: '1.4em', width: '0.6em', opacity: 0.5 };
      case 'underline':
        return { height: '2px', width: '0.6em', top: '1.3em' };
      default:
        return { height: '1.4em', width: '2px' };
    }
  };

  // Determine if we should animate position (smooth styles only)
  const shouldAnimatePosition = caretStyle === 'line-smooth';

  // Determine transition duration
  const getTransitionDuration = () => {
    if (isInitialRender.current) return 0;
    return shouldAnimatePosition ? 0.075 : 0;
  };

  return (
    <AnimatePresence>
      <motion.div
        hidden={!hasLoaded}
        className="absolute rounded-sm"
        style={getCaretDimensions()}
        animate={{
          top,
          left,
          backgroundColor: !isPlaying
            ? [PRIMARY_PINK_COLOR, TRANSPARENT, PRIMARY_PINK_COLOR]
            : PRIMARY_PINK_COLOR,
        }}
        transition={{
          top: {
            duration: getTransitionDuration(),
            ease: 'linear',
          },
          left: {
            duration: getTransitionDuration(),
            ease: 'linear',
          },
          backgroundColor: {
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      />
    </AnimatePresence>
  );
};