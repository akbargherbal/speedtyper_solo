import { ReactNode, useRef, useEffect, useState } from "react";
import Countdown from "../../../components/Countdown";
import { useGameStore } from "../state/game-store";
import { useCodeStore } from "../state/code-store";
import { useSettingsStore } from "../state/settings-store";

interface CodeAreaProps {
  filePath: string;
  focused: boolean;
  children: ReactNode;
  staticHeigh: boolean;
}

export function CodeArea({
  filePath,
  focused,
  children,
  staticHeigh = true,
}: CodeAreaProps) {
  const countDown = useGameStore((state) => state.countdown);
  const index = useCodeStore((state) => state.index);
  const debugMode = useSettingsStore((state) => state.debugMode);
  const codeRef = useRef<HTMLPreElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fix hydration error: Only use debugMode on client side
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug mode: Always treat as focused for screenshots (only on client)
  const effectiveFocused = (isClient && debugMode) || focused;

  // Smooth scroll to keep active character centered vertically and horizontally
  useEffect(() => {
    if (!effectiveFocused || !codeRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const pre = codeRef.current;
    const activeChar = pre.querySelector('[data-active="true"]') as HTMLElement;

    if (activeChar) {
      // Vertical Scrolling
      const verticalScrollTop =
        activeChar.offsetTop -
        container.offsetTop -
        container.clientHeight / 2 +
        activeChar.clientHeight / 2;

      // Horizontal Scrolling
      const horizontalScrollLeft =
        activeChar.offsetLeft -
        container.offsetLeft -
        container.clientWidth * 0.4;

      container.scrollTo({
        top: Math.max(0, verticalScrollTop),
        left: Math.max(0, horizontalScrollLeft),
        behavior: "smooth",
      });
    }
  }, [effectiveFocused, index]);

  return (
    <div
      ref={containerRef}
      className={`${
        staticHeigh ? "h-[250px] sm:h-[420px]" : ""
      } bg-dark-lake text-faded-gray flex-shrink tracking-tight sm:tracking-wider rounded-xl p-4 text-xs sm:text-2xl w-full overflow-auto`}
      style={{
        fontFamily: "Fira Code",
        fontWeight: "normal",
        scrollBehavior: "smooth",
        whiteSpace: "pre",
      }}
    >
      {!effectiveFocused && (
        <div className="absolute flex justify-center items-center w-full h-full">
          Click or press any key to focus
        </div>
      )}
      {countDown && (
        <div className="absolute flex justify-center items-center w-full h-full">
          <Countdown countdown={countDown} />
        </div>
      )}
      <CodeAreaHeader filePath={filePath} debugMode={isClient && debugMode} />
      <pre
        ref={codeRef}
        className={effectiveFocused ? "blur-none opacity-100" : "blur-sm opacity-40"}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}

function CodeAreaHeader({ filePath, debugMode }: { filePath: string; debugMode: boolean }) {
  return (
    <div className="flex items-center flex-row mb-4 w-full">
      <div className="flex flex-row gap-2 mr-2 relative">
        <div className={`w-2.5 h-2.5 rounded-full ${debugMode ? 'bg-yellow-500' : 'bg-slate-600'}`} />
        <div className="w-2.5 h-2.5 bg-slate-600 rounded-full" />
        <div className="w-2.5 h-2.5 bg-slate-600 rounded-full" />
      </div>
      <div className="flex items-start justify-center flex-row w-full h-6 pr-12">
        <span className="hidden sm:block italic text-base opacity-80 truncate">
          {filePath}
          {debugMode && <span className="ml-2 text-yellow-500 font-bold">[DEBUG MODE]</span>}
        </span>
      </div>
    </div>
  );
}