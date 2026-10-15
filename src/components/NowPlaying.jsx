// src/components/NowPlaying.jsx
import { useTheme } from "../contexts/ThemeContext";
import { X, Heart, Music } from "lucide-react";

export function NowPlaying({
  song,
  isPlaying,
  isFavorite,
  onToggleFavorite,
  onClose,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!song) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: isDark
          ? "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0f 100%)"
          : "radial-gradient(circle at 50% 50%, #f5f7fa 0%, #c3cfe2 100%)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.4s ease-out",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          background: "rgba(255,255,255,0.1)",
          border: "none",
          borderRadius: "50%",
          width: 44,
          height: 44,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isDark ? "#fff" : "#000",
          backdropFilter: "blur(10px)",
        }}
      >
        <X size={24} />
      </button>

      <div
        style={{
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)",
          padding: 20,
          boxShadow: "0 20px 60px rgba(233, 69, 96, 0.4)",
          animation: isPlaying ? "spin 8s linear infinite" : "none",
          marginBottom: 40,
        }}
      >
        <img
          src={song.cover}
          alt={song.title}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            border: "8px solid #0a0a0f",
          }}
        />
      </div>

      <h2
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: isDark ? "#fff" : "#000",
          marginBottom: 8,
        }}
      >
        {song.title}
      </h2>
      <p
        style={{
          fontSize: 18,
          opacity: 0.7,
          color: isDark ? "#fff" : "#000",
          marginBottom: 24,
        }}
      >
        {song.artist}
      </p>

      <div style={{ display: "flex", gap: 16 }}>
        <span
          style={{
            padding: "8px 16px",
            background: "rgba(233, 69, 96, 0.2)",
            color: "#e94560",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {song.genre}
        </span>
        <button
          onClick={onToggleFavorite}
          style={{
            padding: "8px 16px",
            background: isFavorite
              ? "rgba(233, 69, 96, 0.2)"
              : "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: 20,
            cursor: "pointer",
            color: isFavorite ? "#e94560" : isDark ? "#fff" : "#000",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <Heart size={16} fill={isFavorite ? "#e94560" : "none"} />
          {isFavorite ? "Favorita" : "Agregar"}
        </button>
      </div>

      {isPlaying && (
        <div
          style={{
            position: "absolute",
            bottom: 100,
            display: "flex",
            gap: 4,
            alignItems: "flex-end",
            height: 40,
          }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 4,
                background: "#e94560",
                borderRadius: 2,
                animation: `pulse 0.8s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`,
                height: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
