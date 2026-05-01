import { useState, useRef, useCallback } from "react";

interface UseLongPressOptions {
  delay?: number;
  onLongPress: () => void;
}

export function useLongPress({ delay = 500, onLongPress }: UseLongPressOptions) {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
      onLongPress();
      setIsPressed(false);
    }, delay);
  }, [delay, onLongPress]);

  const end = useCallback(() => {
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    handlers: {
      onMouseDown: start,
      onMouseUp: end,
      onMouseLeave: end,
      onTouchStart: start,
      onTouchEnd: end,
    },
    isPressed,
  };
}
