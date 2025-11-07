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

  // Game-specific Keyboard Handler
  useEffect(() => {
    if (!game) return;

    const handleKeyboard = (event: KeyboardEvent) => {
      // These shortcuts should only be active when a game exists.
      if (event.altKey && event.key === "ArrowRight") {
        event.preventDefault();
        console.log("[useGame] Alt+Right pressed, calling nextLanguage()");
        nextLanguage();
        console.log("[useGame] Calling game.next() to refresh snippet");
        game.next();
      } else if (event.altKey && event.key === "ArrowLeft") {
        event.preventDefault();
        console.log("[useGame] Alt+Left pressed, calling previousLanguage()");
        previousLanguage();
        console.log("[useGame] Calling game.next() to refresh snippet");
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