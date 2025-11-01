import { useEffect, useState } from "react";

interface IRect {
  top: number;
  left: number;
}

export function useNodeRect<T extends HTMLElement>(
  refreshValue: string
): [IRect, (node: T) => void] {
  const [node, setNode] = useState<T>();
  const [rect, setRect] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (!node) return;

    // Use getBoundingClientRect for accurate viewport-relative positioning
    const domRect = node.getBoundingClientRect();
    
    // Get the scroll container (the CodeArea container)
    const scrollContainer = node.closest('.overflow-auto');
    const scrollTop = scrollContainer?.scrollTop ?? 0;
    const scrollLeft = scrollContainer?.scrollLeft ?? 0;
    
    // Calculate position relative to the scroll container
    const containerRect = scrollContainer?.getBoundingClientRect();
    const containerTop = containerRect?.top ?? 0;
    const containerLeft = containerRect?.left ?? 0;
    
    setRect({
      top: domRect.top - containerTop + scrollTop,
      left: domRect.left - containerLeft + scrollLeft,
    });
  }, [node, refreshValue]);

  return [rect, setNode];
}