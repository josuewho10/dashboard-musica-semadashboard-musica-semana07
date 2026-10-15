# 🎵 MusicFlow Pro - Dashboard de Gestión Musical

## Semana 07 - Parte 2: React Hooks y Estado Complejo

**Universidad:** Universidad Nacional del Centro del Perú (UNCP)  
**Facultad:** Ingeniería de Sistemas  
**Asignatura:** Desarrollo de Aplicaciones Web (IS093A)  
**Unidad:** I - Desarrollo Web Frontend  
**Tema:** React Hooks: useState, useEffect, useContext, useRef, useReducer, useCallback, useMemo y Hooks Personalizados  
**Alumno:** Josue Yarnga Ruiz
**Fecha:** 15 de Octubre de 2026

## 1. Diagrama de flujo de estado y ciclo de render

```mermaid
graph TD
    A[Usuario interactúa: Play, Favorito, Búsqueda, Agregar a Cola] --> B[Componente dispara dispatch con Acción]
    B --> C[useMusicReducer procesa la acción]
    C --> D[Genera Nuevo Estado Inmutable]
    D --> E{¿Cambiaron las dependencias de useMemo?}
    E -->|Sí (ej: cambió search, filter o queue)| F[useMemo recalcula filteredSongs y stats]
    E -->|No (ej: solo cambió el theme o volume)| G[useMemo retorna valor en caché]
    F --> H[MusicLibrary / Player se re-renderizan]
    G --> H
    H --> I[useEffect sincroniza favoritos con localStorage]
    I --> J[Cleanup: limpia intervalos del reproductor y event listeners]

## 2. Justificación técnica de cada hook utilizado (¿por qué no useState simple?)

1. useReducer
Uso en el proyecto: Gestiona el estado global del reproductor (songs, favorites, queue, currentSong, isPlaying, filter, search, shuffle, repeat, volume).
¿Por qué no useState simple?: El estado tiene múltiples sub-valores interdependientes y la lógica de actualización depende del estado anterior. Usar múltiples useState dispersaría la lógica ("useState hell"). useReducer centraliza la lógica en una función pura, garantiza inmutabilidad y hace las transiciones predecibles.

2. useContext
Uso en el proyecto: ThemeContext para manejar el modo Claro/Oscuro globalmente.
¿Por qué no useState simple?: Pasar la prop theme y toggleTheme manualmente desde App hacia MusicLibrary, Player, NowPlaying y Toast generaría prop drilling. useContext permite que cualquier componente consuma el tema directamente sin ensuciar la jerarquía.

3. useEffect
Uso en el proyecto: Sincronizar favoritos con localStorage, simular carga de API con AbortController, registrar atajos de teclado y simular progreso con setInterval.
¿Por qué no useState simple?: useState no puede manejar efectos secundarios ni sincronización con sistemas externos (DOM, APIs, localStorage). Además, useEffect permite usar la función de cleanup (return) para limpiar intervalos y event listeners, evitando memory leaks al desmontar.

4. useMemo
Uso en el proyecto: Calcular la lista filteredSongs y las estadísticas (stats).
¿Por qué no useState simple?: Filtrar y ordenar arrays es costoso O(n log n). Si se calculara en el cuerpo del componente, se ejecutaría en cada render (incluso si solo cambió el tema). useMemo memoriza el resultado y solo lo recalcula si cambian sus dependencias.

5. useCallback
Uso en el proyecto: Estabilizar handlers como handlePlay, handleFavorite y handleAddToQueue.
¿Por qué no useState simple?: Las funciones inline crean una nueva referencia en cada render, rompiendo la optimización de hijos memoizados. useCallback devuelve la misma referencia mientras sus dependencias no cambien, evitando re-renders innecesarios.

6. useRef
Uso en el proyecto: searchRef para auto-focus en el input, y progressRef para la barra de progreso.
¿Por qué no useState simple?: Guardar referencias DOM o valores de progreso en useState dispararía un re-render completo en cada actualización. useRef persiste el valor entre renders y permite manipular el DOM directamente sin afectar el ciclo de renderizado.

7. Hooks Personalizados (useLocalStorage y useDebounce)
Uso en el proyecto: useLocalStorage para persistencia de favoritos, y useDebounce para retrasar la búsqueda 300ms.
¿Por qué no useState simple?: Encapsular esta lógica en funciones reutilizables separa la lógica de negocio de la UI (Composition over inheritance), haciendo el código más limpio y testeable. Además, useDebounce requiere cleanup (clearTimeout) que useState no maneja.
```
