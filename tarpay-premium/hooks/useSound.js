/**
 * useSound — Premium payment sound effects
 * Uses expo-av for audio feedback on key interactions
 */
import { useCallback, useRef } from "react";

export function useSound() {
  const playSuccess = useCallback(async () => {
    try {
      const { Audio } = await import("expo-av");
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: false });
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/success.mp3"),
        { shouldPlay: true, volume: 0.7 }
      );
      sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) sound.unloadAsync(); });
    } catch { /* silent — asset might not exist */ }
  }, []);

  const playError = useCallback(async () => {
    try {
      const { Audio } = await import("expo-av");
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/error.mp3"),
        { shouldPlay: true, volume: 0.5 }
      );
      sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) sound.unloadAsync(); });
    } catch {}
  }, []);

  return { playSuccess, playError };
}
