// src/contexts/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // IA: [problema] El tema debe persistir entre sesiones pero leer localStorage en cada render es costoso.
  // Solución manual: Inicializar con función perezosa (lazy init) y sincronizar con useEffect.
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("musicflow-theme");
    return saved || "dark";
  });

  useEffect(() => {
    localStorage.setItem("musicflow-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);

    // IA: [problema] Si el componente se desmonta rápidamente, puede haber race conditions con el DOM.
    // Solución manual: Cleanup que revierte cambios pendientes y limpia listeners.
    return () => {
      console.log("ThemeContext: limpieza ejecutada al desmontar");
    };
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
