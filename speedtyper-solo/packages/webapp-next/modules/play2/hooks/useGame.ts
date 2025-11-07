import { useEffect, useMemo } from "react";
import { Game } from "../services/Game";
import { useConnectionStore } from "../state/connection-store";
import { nextLanguage, previousLanguage } from "../state/settings-store";
import { useInitialRaceIdQueryParam } from "./useGameIdQueryParam";

export const useGame = () => {
  const raceIdQueryParam = useInitialRaceIdQueryParam();
  const socket = useConnectionStore((s) => s.socket);

  const game = useMemo(
    () => socket && new Game(socket, raceIdQueryParam),
    [socket, raceIdQueryParam]
  );

  // Effect to initialize the game state after the game object is created.
  // This prevents state updates during the render cycle.
  useEffect(() => {
    if (game) {
      game.initialize();
    }
  }, [game]);

  // Game-specific Keyboard Handler
  useEffect(() => {
    if (!game) return;

    const handleKeyboard = (event: KeyboardEvent) => {
      // These shortcuts should only be active when a game exists.
      if (event.altKey && event.key === "ArrowRight") {
        event.preventDefault();
        nextLanguage();
        game.next();
      } else if (event.altKey && event.key === "ArrowLeft") {
        event.preventDefault();
        previousLanguage();
        game.next();
      } else if (event.key === "Tab" && !event.shiftKey) {
        // Allow Shift+Tab for accessibility
        event.preventDefault();
        game.next();
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    // Cleanup function to remove the event listener when the component unmounts
    // or when the 'game' object changes.
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [game]); // Dependency array ensures this effect runs only when 'game' is instantiated or changes.

  return game;
};