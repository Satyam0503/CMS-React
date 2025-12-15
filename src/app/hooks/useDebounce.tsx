import { useEffect, useState } from "react";

export const useDebounce = <T,>(value: T, timer: number = 800) => {

  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, timer);
    return () => clearTimeout(timeoutId);
  }, [value, timer]);

  return debouncedValue;
};
