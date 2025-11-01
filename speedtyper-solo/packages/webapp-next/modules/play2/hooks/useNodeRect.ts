import { useEffect, useState, useCallback } from "react";

interface IRect {
  top: number;
  left: number;
}

export function useNodeRect<T extends HTMLElement>(
  refreshValue: string
): [IRect, (node: T | null) => void] {
  const [node, setNode] = useState<T | null>(null);
  const [rect, setRect] = useState({
    top: 0,
    left: 0,
  });

  // Use useCallback to ensure stable ref callback
  const refCallback = useCallback((node: T | null) => {
    if (node) {
      setNode(node);
    }
  }, []);

  useEffect(() => {
    if (!node) return;

    // Use requestAnimationFrame to ensure DOM is fully laid out
    const updateRect = () => {
      if (!node) return;
      
      setRect({
        top: node.offsetTop,
        left: node.offsetLeft,
      });
    };

    // Update immediately
    updateRect();

    // Also update on next frame (handles cases where layout isn't complete)
    const rafId = requestAnimationFrame(updateRect);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [node, refreshValue]);

  return [rect, refCallback];
}