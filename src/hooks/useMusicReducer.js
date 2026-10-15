// src/hooks/useMusicReducer.js
import { useReducer } from "react";

const initialState = {
  songs: [],
  favorites: [],
  queue: [], // Cola de reproducción
  currentSong: null,
  isPlaying: false,
  filter: "All",
  search: "",
  shuffle: false,
  repeat: "off", // 'off', 'all', 'one'
  volume: 0.7,
  showNowPlaying: false,
};

// IA: [problema] Múltiples sub-valores (songs, queue, favorites, player state) con lógica compleja e interdependiente.
// Solución manual: useReducer centraliza TODA la lógica del estado musical, garantizando inmutabilidad y acciones predecibles.
function musicReducer(state, action) {
  switch (action.type) {
    case "SET_SONGS":
      return { ...state, songs: action.payload };

    case "TOGGLE_FAVORITE": {
      const exists = state.favorites.find((f) => f.id === action.payload);
      return {
        ...state,
        favorites: exists
          ? state.favorites.filter((f) => f.id !== action.payload)
          : [
              ...state.favorites,
              state.songs.find((s) => s.id === action.payload),
            ],
      };
    }

    case "ADD_TO_QUEUE": {
      const song = state.songs.find((s) => s.id === action.payload);
      if (!song) return state;
      return { ...state, queue: [...state.queue, song] };
    }

    case "REMOVE_FROM_QUEUE":
      return {
        ...state,
        queue: state.queue.filter((_, idx) => idx !== action.payload),
      };

    case "CLEAR_QUEUE":
      return { ...state, queue: [] };

    case "PLAY_SONG":
      return {
        ...state,
        currentSong: action.payload,
        isPlaying: true,
        showNowPlaying: false,
      };

    case "TOGGLE_PLAY":
      return { ...state, isPlaying: !state.isPlaying };

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "TOGGLE_SHUFFLE":
      return { ...state, shuffle: !state.shuffle };

    case "SET_REPEAT":
      return { ...state, repeat: action.payload };

    case "SET_VOLUME":
      return { ...state, volume: action.payload };

    case "TOGGLE_NOW_PLAYING":
      return { ...state, showNowPlaying: !state.showNowPlaying };

    case "PLAY_NEXT": {
      if (state.queue.length === 0) return state;
      const nextSong = state.queue[0];
      const newQueue = state.queue.slice(1);
      return {
        ...state,
        currentSong: nextSong,
        isPlaying: true,
        queue: newQueue,
      };
    }

    default:
      return state;
  }
}

export function useMusicReducer() {
  return useReducer(musicReducer, initialState);
}
