"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { getSpeakingText, getVoiceProblem, speak, stopSpeaking, subscribeSpeaking } from "@/lib/voice";

/** The line currently being spoken, if any. */
export function useSpeakingText(): string | null {
  return useSyncExternalStore(subscribeSpeaking, getSpeakingText, () => null);
}

/** Whether the voice guide recently failed to produce any sound. */
export function useVoiceProblem(): boolean {
  return useSyncExternalStore(subscribeSpeaking, getVoiceProblem, () => false);
}

/**
 * Speaks `text` whenever it changes after the first render (not on page load,
 * where browsers block audio anyway). Stops speaking when the component unmounts.
 */
export function useSpeakOnChange(text: string | null) {
  const previous = useRef(text);
  useEffect(() => {
    if (text && text !== previous.current) void speak(text);
    previous.current = text;
  }, [text]);
  useEffect(() => () => stopSpeaking(), []);
}
