import { useState, useEffect, useCallback, useRef } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}

export function useSearchSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    setLoading(true);
    try {
      const Req = require("@/app/utility/axios").default;
      const res = await Req.app.get(`${Req.base}/v1/house?searchWord=${encodeURIComponent(query)}&limit=5`);
      const properties = res.data?.data || [];
      
      const uniqueSuggestions = new Set<string>();
      properties.forEach((p: any) => {
        if (p.title) uniqueSuggestions.add(p.title);
        if (p.location) uniqueSuggestions.add(p.location);
        if (p.address) uniqueSuggestions.add(p.address);
        if (p.state) uniqueSuggestions.add(p.state);
      });
      
      setSuggestions(Array.from(uniqueSuggestions).slice(0, 6));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return { suggestions, loading, fetchSuggestions, setSuggestions };
}
