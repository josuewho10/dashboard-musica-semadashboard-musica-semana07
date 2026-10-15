// src/components/MusicLibrary.jsx
import { useMemo, useCallback, useRef } from "react";
import { Search, Heart, Play, Plus, Music, Trash2 } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useDebounce } from "../hooks/useDebounce";
import { genres } from "../data/mockSongs";

export function MusicLibrary({ state, dispatch, showToast }) {
  const { theme } = useTheme();
  const searchRef = useRef(null);
  const isDark = theme === "dark";

  // IA: [problema] Búsqueda en tiempo real causa re-renders en cada tecla.
  // Solución manual: useDebounce retrasa la búsqueda 300ms hasta que el usuario deja de escribir.
  const debouncedSearch = useDebounce(state.search, 300);

  // IA: [problema] Filtrar y ordenar canciones en cada render es O(n log n) costoso.
  // Solución manual: useMemo memoriza el resultado y solo recalcula si cambian las dependencias.
  const filteredSongs = useMemo(() => {
    let result = state.songs;

    if (state.filter !== "All") {
      result = result.filter((song) => song.genre === state.filter);
    }

    if (debouncedSearch.trim()) {
      const search = debouncedSearch.toLowerCase();
      result = result.filter(
        (song) =>
          song.title.toLowerCase().includes(search) ||
          song.artist.toLowerCase().includes(search),
      );
    }

    return result;
  }, [state.songs, state.filter, debouncedSearch]);

  const stats = useMemo(() => {
    const totalPlays = state.songs.reduce((sum, s) => sum + s.plays, 0);
    const totalDuration = state.songs.reduce((sum, s) => {
      const [min, sec] = s.duration.split(":").map(Number);
      return sum + min * 60 + sec;
    }, 0);
    const hours = Math.floor(totalDuration / 3600);
    const mins = Math.floor((totalDuration % 3600) / 60);

    return {
      total: state.songs.length,
      favorites: state.favorites.length,
      genres: [...new Set(state.songs.map((s) => s.genre))].length,
      totalPlays: `${(totalPlays / 1000000).toFixed(1)}M`,
      totalDuration: `${hours}h ${mins}m`,
      queue: state.queue.length,
    };
  }, [state.songs, state.favorites, state.queue]);

  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
  }, []);

  const handleSearch = useCallback(
    (e) => {
      dispatch({ type: "SET_SEARCH", payload: e.target.value });
    },
    [dispatch],
  );

  const handleFilter = useCallback(
    (genre) => {
      dispatch({ type: "SET_FILTER", payload: genre });
    },
    [dispatch],
  );

  const handlePlay = useCallback(
    (song) => {
      dispatch({ type: "PLAY_SONG", payload: song });
    },
    [dispatch],
  );

  const handleFavorite = useCallback(
    (id) => {
      dispatch({ type: "TOGGLE_FAVORITE", payload: id });
      const song = state.songs.find((s) => s.id === id);
      const isFav = state.favorites.some((f) => f.id === id);
      showToast(
        isFav
          ? `Removida de favoritas`
          : `❤️ ${song.title} agregada a favoritas`,
        "favorite",
      );
    },
    [dispatch, state.songs, state.favorites, showToast],
  );

  const handleAddToQueue = useCallback(
    (id) => {
      dispatch({ type: "ADD_TO_QUEUE", payload: id });
      const song = state.songs.find((s) => s.id === id);
      showToast(` ${song.title} agregada a la cola`, "queue");
    },
    [dispatch, state.songs, showToast],
  );

  const bg = isDark ? "#0a0a0f" : "#f5f5f7";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";
  const text = isDark ? "#ffffff" : "#1a1a1a";
  const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div style={{ paddingBottom: 140 }}>
      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          {
            label: "Canciones",
            value: stats.total,
            icon: "🎵",
            color: "#e94560",
          },
          {
            label: "Favoritas",
            value: stats.favorites,
            icon: "❤️",
            color: "#ff6b6b",
          },
          {
            label: "En Cola",
            value: stats.queue,
            icon: "📋",
            color: "#ffd93d",
          },
          {
            label: "Géneros",
            value: stats.genres,
            icon: "🎭",
            color: "#6bcb77",
          },
          {
            label: "Plays",
            value: stats.totalPlays,
            icon: "🔥",
            color: "#4d96ff",
          },
          {
            label: "Duración",
            value: stats.totalDuration,
            icon: "️",
            color: "#9b59b6",
          },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: cardBg,
              backdropFilter: "blur(10px)",
              border: `1px solid ${border}`,
              borderRadius: 16,
              padding: 20,
              transition: "all 0.3s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow =
                "0 10px 30px rgba(233, 69, 96, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
            <div
              style={{ fontSize: 12, opacity: 0.7, marginTop: 4, color: text }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 14,
                top: 14,
                opacity: 0.5,
                color: text,
              }}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar canciones o artistas..."
              value={state.search}
              onChange={handleSearch}
              style={{
                width: "100%",
                padding: "12px 12px 12px 44px",
                borderRadius: 12,
                border: `1px solid ${border}`,
                background: cardBg,
                color: text,
                fontSize: 14,
                backdropFilter: "blur(10px)",
              }}
            />
          </div>
          <button
            onClick={focusSearch}
            style={{
              padding: "12px 20px",
              background: "linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Search size={16} /> Enfocar
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleFilter(genre)}
              style={{
                padding: "8px 16px",
                background:
                  state.filter === genre
                    ? "linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)"
                    : cardBg,
                color: state.filter === genre ? "#fff" : text,
                border: `1px solid ${border}`,
                borderRadius: 20,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                backdropFilter: "blur(10px)",
                transition: "all 0.2s",
              }}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Section */}
      {state.queue.length > 0 && (
        <div
          style={{
            background: cardBg,
            backdropFilter: "blur(10px)",
            border: `1px solid ${border}`,
            borderRadius: 16,
            padding: 20,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                color: text,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              📋 Cola de Reproducción ({state.queue.length})
            </h3>
            <button
              onClick={() => dispatch({ type: "CLEAR_QUEUE" })}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "none",
                color: "#ef4444",
                padding: "6px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Limpiar
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {state.queue.map((song, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 10,
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                  borderRadius: 10,
                }}
              >
                <img
                  src={song.cover}
                  alt={song.title}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: text }}>
                    {song.title}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6, color: text }}>
                    {song.artist}
                  </div>
                </div>
                <button
                  onClick={() =>
                    dispatch({ type: "REMOVE_FROM_QUEUE", payload: idx })
                  }
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#ef4444",
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Songs Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {filteredSongs.map((song) => {
          const isFavorite = state.favorites.some((f) => f.id === song.id);
          const isCurrent = state.currentSong?.id === song.id;
          const inQueue = state.queue.some((s) => s.id === song.id);

          return (
            <div
              key={song.id}
              style={{
                background: cardBg,
                backdropFilter: "blur(10px)",
                border: `1px solid ${border}`,
                borderRadius: 16,
                padding: 16,
                transition: "all 0.3s",
                cursor: "pointer",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(233, 69, 96, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onClick={() => handlePlay(song)}
            >
              <div style={{ position: "relative", marginBottom: 12 }}>
                <img
                  src={song.cover}
                  alt={song.title}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    objectFit: "cover",
                    borderRadius: 12,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background:
                      isCurrent && state.isPlaying
                        ? "linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)"
                        : "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {isCurrent && state.isPlaying ? (
                    <div
                      style={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-end",
                        height: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 3,
                          height: "60%",
                          background: "#fff",
                          animation: "pulse 1s infinite",
                        }}
                      />
                      <div
                        style={{
                          width: 3,
                          height: "100%",
                          background: "#fff",
                          animation: "pulse 1s infinite 0.2s",
                        }}
                      />
                      <div
                        style={{
                          width: 3,
                          height: "80%",
                          background: "#fff",
                          animation: "pulse 1s infinite 0.4s",
                        }}
                      />
                    </div>
                  ) : (
                    <Play size={16} fill="#fff" />
                  )}
                </div>
              </div>

              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 4,
                  color: text,
                }}
              >
                {song.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.6,
                  marginBottom: 8,
                  color: text,
                }}
              >
                {song.artist}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    background: "rgba(233, 69, 96, 0.2)",
                    color: "#e94560",
                    borderRadius: 10,
                    fontWeight: 500,
                  }}
                >
                  {song.genre}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToQueue(song.id);
                    }}
                    style={{
                      background: inQueue
                        ? "rgba(107, 203, 119, 0.2)"
                        : "rgba(255,255,255,0.1)",
                      border: "none",
                      cursor: "pointer",
                      color: inQueue ? "#6bcb77" : isDark ? "#fff" : "#000",
                      padding: 6,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Agregar a cola"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(song.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: isFavorite ? "#e94560" : isDark ? "#fff" : "#000",
                      padding: 6,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Heart size={16} fill={isFavorite ? "#e94560" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSongs.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            opacity: 0.6,
            color: text,
          }}
        >
          <Music size={64} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: 18 }}>No se encontraron canciones</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            Intenta con otra búsqueda o filtro
          </p>
        </div>
      )}
    </div>
  );
}
