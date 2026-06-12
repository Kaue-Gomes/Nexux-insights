import { useEffect, useState } from "react";

/**
 * Retorna o valor após `delay` ms sem alterações, evitando filtragens/buscas
 * a cada tecla digitada (reduz re-renders e trabalho desnecessário).
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
