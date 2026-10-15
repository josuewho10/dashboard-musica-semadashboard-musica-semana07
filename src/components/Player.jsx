// src/components/Player.jsx
import { useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Maximize2,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function Player({ state, dispatch }) {
  const { theme } = useTheme();
  const progressRef = useRef(null);
  const isDark = theme === "dark";

  // IA: [problema] Simular progreso de reproducción requiere setInterval que debe limpiarse al desmontar o pausar.
  // Solución manual: useEffect con cleanup que limpia el intervalo para evitar memory leaks.
  useEffect(() => {
    let interval;
    if (state.isPlaying && progressRef.current) {
      interval = setInterval(() => {
        const current = parseFloat(progressRef.current.style.width) || 0;
        if (current < 100) {
          progressRef.current.style.width = `${current + 0.3}%`;
        } else {
          progressRef.current.style.width = "0%";
          if (state.repeat === "one") {
            progressRef.current.style.width = "0%";
          } else if (state.queue.length > 0) {
            dispatch({ type: "PLAY_NEXT" });
          } else {
            dispatch({ type: "TOGGLE_PLAY" });
          }
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [state.isPlaying, state.repeat, state.queue.length, dispatch]);

  // IA: [problema] Los atajos de teclado deben registrarse al montar y limpiarse al desmontar.
  // Solución manual: useEffect con addEventListener y cleanup con removeEventListener.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && e.target.tagName !== "INPUT") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_PLAY" });
      }
      if (e.code === "ArrowRight" && e.ctrlKey) {
        dispatch({ type: "PLAY_NEXT" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const handleProgressClick = useCallback((e) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      progressRef.current.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    }
  }, []);

  const handleVolumeClick = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      dispatch({
        type: "SET_VOLUME",
        payload: Math.max(0, Math.min(1, percent)),
      });
    },
    [dispatch],
  );

  if (!state.currentSong) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          background: isDark
            ? "rgba(18, 18, 18, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          textAlign: "center",
          color: isDark ? "#fff" : "#000",
          fontSize: 13,
        }}
      >
        Selecciona una canción para reproducir • Presiona{" "}
        <kbd
          style={{
            padding: "2px 6px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: 4,
          }}
        >
          Espacio
        </kbd>{" "}
        para play/pause
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "14px 24px",
        background: isDark
          ? "rgba(18, 18, 18, 0.98)"
          : "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(20px)",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        zIndex: 100,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.2)",
      }}
    >
      {/* Song Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flex: 1,
          minWidth: 0,
        }}
      >
        <img
          src={state.currentSong.cover}
          alt={state.currentSong.title}
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            objectFit: "cover",
            animation: state.isPlaying ? "spin 8s linear infinite" : "none",
            cursor: "pointer",
          }}
          onClick={() => dispatch({ type: "TOGGLE_NOW_PLAYING" })}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: isDark ? "#fff" : "#000",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {state.currentSong.title}
          </div>
          <div
            style={{
              fontSize: 12,
              opacity: 0.6,
              color: isDark ? "#fff" : "#000",
            }}
          >
            {state.currentSong.artist}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => dispatch({ type: "TOGGLE_SHUFFLE" })}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: state.shuffle ? "#e94560" : isDark ? "#fff" : "#000",
            opacity: state.shuffle ? 1 : 0.6,
            padding: 6,
          }}
          title="Shuffle"
        >
          <Shuffle size={18} />
        </button>
        <button
          onClick={() => dispatch({ type: "PLAY_NEXT" })}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: isDark ? "#fff" : "#000",
          }}
        >
          <SkipBack size={20} />
        </button>
        <button
          onClick={() => dispatch({ type: "TOGGLE_PLAY" })}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {state.isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={() => dispatch({ type: "PLAY_NEXT" })}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: isDark ? "#fff" : "#000",
          }}
        >
          <SkipForward size={20} />
        </button>
        <button
          onClick={() => {
            const modes = ["off", "all", "one"];
            const next =
              modes[(modes.indexOf(state.repeat) + 1) % modes.length];
            dispatch({ type: "SET_REPEAT", payload: next });
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color:
              state.repeat !== "off" ? "#e94560" : isDark ? "#fff" : "#000",
            opacity: state.repeat !== "off" ? 1 : 0.6,
            padding: 6,
          }}
          title={`Repeat: ${state.repeat}`}
        >
          {state.repeat === "one" ? (
            <Repeat1 size={18} />
          ) : (
            <Repeat size={18} />
          )}
        </button>
      </div>

      {/* Progress */}
      <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 10 }}>
        <div
          onClick={handleProgressClick}
          style={{
            flex: 1,
            height: 4,
            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            borderRadius: 2,
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <div
            ref={progressRef}
            style={{
              width: "0%",
              height: "100%",
              background: "linear-gradient(90deg, #e94560 0%, #ff6b6b 100%)",
              transition: "width 0.5s linear",
            }}
          />
        </div>
      </div>

      {/* Volume */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}
      >
        <button
          onClick={() =>
            dispatch({
              type: "SET_VOLUME",
              payload: state.volume > 0 ? 0 : 0.7,
            })
          }
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: isDark ? "#fff" : "#000",
          }}
        >
          {state.volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div
          onClick={handleVolumeClick}
          style={{
            flex: 1,
            height: 4,
            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            borderRadius: 2,
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: `${state.volume * 100}%`,
              height: "100%",
              background: "#e94560",
            }}
          />
        </div>
      </div>

      {/* Expand button */}
      <button
        onClick={() => dispatch({ type: "TOGGLE_NOW_PLAYING" })}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: isDark ? "#fff" : "#000",
          padding: 6,
        }}
        title="Modo expandido"
      >
        <Maximize2 size={18} />
      </button>
    </div>
  );
}
