// src/components/Toast.jsx
import { useEffect } from "react";
import { X, Heart, Plus } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function Toast({ message, type, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // IA: [problema] El toast debe desaparecer automáticamente pero limpiarse al desmontar para evitar memory leaks.
  // Solución manual: useEffect con setTimeout y cleanup que cancela el timer si el componente se desmonta.
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icon =
    type === "favorite" ? (
      <Heart size={18} fill="#e94560" />
    ) : (
      <Plus size={18} />
    );
  const bg = isDark ? "rgba(30, 30, 40, 0.95)" : "rgba(255, 255, 255, 0.95)";

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        padding: "14px 20px",
        background: bg,
        backdropFilter: "blur(20px)",
        borderRadius: 12,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 1000,
        animation: "slideIn 0.3s ease-out",
        color: isDark ? "#fff" : "#000",
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {icon}
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          padding: 4,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
