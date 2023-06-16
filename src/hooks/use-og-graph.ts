import { useEffect, useState } from "react";
import { api } from "~/utils/api";

export function useOgGraph(url: string) {
  const debounced = useDebounce(url, 300);

  const query = api.main.scrapeUrl.useQuery({ url: debounced });

  return query;
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
