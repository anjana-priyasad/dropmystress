/**
 * Spoken guidance. Uses natural AI voice audio from /api/voice when the server
 * has an OpenAI key, and falls back to the browser's built-in speech otherwise.
 */
import { readStorage } from "./storage";

export const VOICE_ENABLED_KEY = "dms.voice-enabled";

const SERVER_TIMEOUT_MS = 8000;
const BROWSER_START_TIMEOUT_MS = 3000;
const PRELOAD_CONCURRENCY = 2;
const MAX_CONSECUTIVE_FAILURES = 3;

let serverVoice: "unknown" | "available" | "unavailable" = "unknown";
let availabilityCheck: Promise<void> | null = null;
let consecutiveFailures = 0;

/** Asks the server once per visit whether natural voice audio is configured. */
function checkServerVoice(): Promise<void> {
  availabilityCheck ??= fetch("/api/voice")
    .then((res) => res.json())
    .then((data: { available?: boolean }) => {
      if (!data.available) serverVoice = "unavailable";
    })
    .catch(() => {
      serverVoice = "unavailable";
    });
  return availabilityCheck;
}
const audioUrls = new Map<string, Promise<string | null>>();
let token = 0;
let currentAudio: HTMLAudioElement | null = null;
let speakingText: string | null = null;
let voiceProblem = false;
// Chrome can garbage-collect an utterance mid-sentence unless something holds on to it.
let currentUtterance: SpeechSynthesisUtterance | null = null;
const listeners = new Set<() => void>();

function setSpeaking(text: string | null) {
  speakingText = text;
  listeners.forEach((l) => l());
}

function setVoiceProblem(problem: boolean) {
  if (voiceProblem === problem) return;
  voiceProblem = problem;
  listeners.forEach((l) => l());
}

/** True when the last attempt to speak never produced any sound. */
export function getVoiceProblem() {
  return voiceProblem;
}

export function subscribeSpeaking(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSpeakingText() {
  return speakingText;
}

export function isVoiceEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const raw = readStorage(VOICE_ENABLED_KEY);
  if (raw === null) return true;
  try {
    return JSON.parse(raw) !== false;
  } catch {
    return true;
  }
}

function fetchAudio(text: string): Promise<string | null> {
  if (serverVoice === "unavailable") return Promise.resolve(null);
  const cached = audioUrls.get(text);
  if (cached) return cached;

  const pending = checkServerVoice()
    .then(() => {
      if (serverVoice === "unavailable") throw new Error("server voice unavailable");
      return fetch(`/api/voice?text=${encodeURIComponent(text)}`, { signal: AbortSignal.timeout(SERVER_TIMEOUT_MS) });
    })
    .then(async (res) => {
      if (res.status === 501) {
        serverVoice = "unavailable";
        return null;
      }
      if (!res.ok) throw new Error(`voice ${res.status}`);
      serverVoice = "available";
      consecutiveFailures = 0;
      return URL.createObjectURL(await res.blob());
    })
    .catch(() => {
      audioUrls.delete(text);
      // After repeated failures (e.g. an invalid key), stop waiting on the server for every line.
      if (serverVoice !== "unavailable" && ++consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        serverVoice = "unavailable";
      }
      return null;
    });
  audioUrls.set(text, pending);
  return pending;
}

const preloadQueue: string[] = [];
let preloadsRunning = 0;

function pumpPreloads() {
  while (preloadsRunning < PRELOAD_CONCURRENCY && preloadQueue.length) {
    const text = preloadQueue.shift()!;
    preloadsRunning++;
    void fetchAudio(text).finally(() => {
      preloadsRunning--;
      pumpPreloads();
    });
  }
}

/**
 * Warm up audio for lines that are likely to be spoken soon, a couple at a time
 * so a long session doesn't hit provider rate limits. Earlier lines go first.
 */
export function preloadSpeech(texts: string[]) {
  if (!isVoiceEnabled()) return;
  for (const text of texts) {
    if (text && !audioUrls.has(text) && !preloadQueue.includes(text)) preloadQueue.push(text);
  }
  pumpPreloads();
}

function pickBrowserVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  const preferences = [/natural/i, /neural/i, /premium|enhanced/i, /siri/i, /samantha|ava|allison|serena|karen|moira/i, /google (uk|us) english/i, /aria|jenny|sonia|libby/i];
  for (const pattern of preferences) {
    const match = voices.find((v) => pattern.test(v.name));
    if (match) return match;
  }
  return voices.find((v) => v.default) ?? voices[0];
}

function speakWithBrowser(text: string, myToken: number, attempt = 0) {
  if (!("speechSynthesis" in window)) {
    setSpeaking(null);
    setVoiceProblem(true);
    return;
  }
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  // The retry uses the system default voice, in case the preferred one is broken.
  const voice = attempt === 0 ? pickBrowserVoice() : undefined;
  if (voice) utterance.voice = voice;
  utterance.rate = 0.88;
  utterance.pitch = 1;

  let started = false;
  utterance.onstart = () => {
    started = true;
    setVoiceProblem(false);
  };
  utterance.onend = () => {
    if (myToken === token && currentUtterance === utterance) setSpeaking(null);
  };
  utterance.onerror = (event) => {
    if (event.error === "interrupted" || event.error === "canceled") return;
    if (myToken === token && !started) retryOrGiveUp();
  };

  const retryOrGiveUp = () => {
    if (myToken !== token || started) return;
    synth.cancel();
    if (attempt === 0) {
      speakWithBrowser(text, myToken, 1);
    } else {
      setSpeaking(null);
      setVoiceProblem(true);
    }
  };

  currentUtterance = utterance;
  // A paused or stuck speech queue silently swallows new lines; resume clears that.
  synth.resume();
  synth.speak(utterance);
  setTimeout(retryOrGiveUp, BROWSER_START_TIMEOUT_MS);
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  token++;
  currentAudio?.pause();
  currentAudio = null;
  currentUtterance = null;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  if (speakingText !== null) setSpeaking(null);
}

/**
 * Speak a line, interrupting anything already playing.
 * `force` speaks even when the voice guide is switched off (e.g. a Listen button).
 */
export async function speak(text: string, { force = false } = {}) {
  if (typeof window === "undefined" || !text.trim()) return;
  stopSpeaking();
  if (!force && !isVoiceEnabled()) return;

  const myToken = ++token;
  setSpeaking(text);
  const url = await fetchAudio(text);
  if (myToken !== token) return;

  if (!url) {
    speakWithBrowser(text, myToken);
    return;
  }
  const audio = new Audio(url);
  currentAudio = audio;
  audio.onended = () => {
    if (myToken === token) setSpeaking(null);
  };
  audio.onerror = () => {
    if (myToken === token) speakWithBrowser(text, myToken);
  };
  audio
    .play()
    .then(() => setVoiceProblem(false))
    .catch(() => {
      // Autoplay can be blocked before the user has interacted with the page.
      if (myToken === token) {
        setSpeaking(null);
        setVoiceProblem(true);
      }
    });
}
