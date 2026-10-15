// src/hooks/useDebounce.js
import { useState, useEffect } from "react";

// IA: [problema] Ejecutar búsqueda en cada tecla presionada causa re-renders excesivos y queries innecesarias.
// Solución manual: Hook personalizado que retrasa la actualización del valor hasta que el usuario deja de escribir.
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // IA: [problema] Sin cleanup, el timeout anterior se ejecutaría aunque el valor cambie.
    // Solución manual: Limpiar el timeout previo en cada cambio para solo ejecutar el último.
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
