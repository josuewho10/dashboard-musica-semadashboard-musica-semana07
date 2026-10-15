// src/App.jsx
import { useState, useEffect, useCallback } from "react";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { useMusicReducer } from "./hooks/useMusicReducer";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { MusicLibrary } from "./components/MusicLibrary";
import { Player } from "./components/Player";
import { NowPlaying } from "./components/NowPlaying";
import { Toast } from "./components/Toast";
import { mockSongs } from "./data/mockSongs";
import { Moon, Sun, Music2 } from "lucide-react";

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [state, dispatch] = useMusicReducer();
  const [savedFavorites, setSavedFavorites] = useLocalStorage(
    "musicflow-favorites",
    [],
  );
  const [toast, setToast] = useState(null);
  const isDark = theme === "dark";

  // IA: [problema] Las canciones mock deben cargarse una vez al montar, pero StrictMode ejecuta useEffect dos veces.
  // Solución manual: AbortController cancela la segunda ejecución y evita duplicados.
  useEffect(() => {
    const controller = new AbortController();

    const loadSongs = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!controller.signal.aborted) {
        dispatch({ type: "SET_SONGS", payload: mockSongs });
      }
    };

    loadSongs();
    return () => controller.abort();
  }, [dispatch]);

  // Sincronizar favoritos con localStorage
  useEffect(() => {
    if (state.favorites.length > 0 || savedFavorites.length > 0) {
      setSavedFavorites(state.favorites);
    }
  }, [state.favorites, setSavedFavorites, savedFavorites]);

  const showToast = useCallback((message, type) => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const handleToggleFavorite = useCallback(() => {
    if (state.currentSong) {
      dispatch({ type: "TOGGLE_FAVORITE", payload: state.currentSong.id });
    }
  }, [dispatch, state.currentSong]);

  const bg = isDark
    ? "radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 100%)"
    : "radial-gradient(ellipse at top, #f5f7fa 0%, #c3cfe2 100%)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        color: isDark ? "#fff" : "#000",
        fontFamily: "system-ui, -apple-system, sans-serif",
        transition: "all 0.3s",
      }}
    >
      <header
        style={{
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Music2 size={32} color="#e94560" />
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
              MusicFlow Pro
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.6 }}>
              Dashboard de Gestión Musical | Semana 07 - Parte 2
            </p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          style={{
            padding: "10px 20px",
            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: isDark ? "#fff" : "#000",
            fontWeight: 600,
            backdropFilter: "blur(10px)",
          }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? "Claro" : "Oscuro"}
        </button>
      </header>

      <main style={{ padding: "40px", maxWidth: 1400, margin: "0 auto" }}>
        <MusicLibrary state={state} dispatch={dispatch} showToast={showToast} />
      </main>

      <Player state={state} dispatch={dispatch} />

      {state.showNowPlaying && (
        <NowPlaying
          song={state.currentSong}
          isPlaying={state.isPlaying}
          isFavorite={state.favorites.some(
            (f) => f.id === state.currentSong?.id,
          )}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => dispatch({ type: "TOGGLE_NOW_PLAYING" })}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
