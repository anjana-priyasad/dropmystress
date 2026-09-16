"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { getSpeakingText, preloadSpeech, speak, stopSpeaking } from "@/lib/voice";

export type BreathPhase = { label: string; seconds: number; scale: number };

export const RESTING_SCALE = 0.55;
const BREATH_EASE = [0.37, 0, 0.63, 1] as const; // easeInOutSine: lung-like, no hard edges

// Box breathing: 4s inhale → 4s hold (full) → 4s exhale → 4s hold (empty).
export const BOX_BREATHING: BreathPhase[] = [
  { label: "Breathe in", seconds: 4, scale: 1 },
  { label: "Hold", seconds: 4, scale: 1 },
  { label: "Breathe out", seconds: 4, scale: RESTING_SCALE },
  { label: "Hold", seconds: 4, scale: RESTING_SCALE },
];

type Cycle = { phaseIndex: number; secondsLeft: number; breaths: number };

/** Pass a new `key` along with new `phases` so the exercise restarts cleanly. */
export default function BreathingBubble({ phases = BOX_BREATHING }: { phases?: BreathPhase[] }) {
  const reduceMotion = useReducedMotion();
  const [running, setRunning] = useState(false);
  const start: Cycle = { phaseIndex: 0, secondsLeft: phases[0].seconds, breaths: 0 };
  const [cycle, setCycle] = useState<Cycle>(start);

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => {
      setCycle((c) => {
        if (c.secondsLeft > 1) return { ...c, secondsLeft: c.secondsLeft - 1 };
        const next = (c.phaseIndex + 1) % phases.length;
        return {
          phaseIndex: next,
          secondsLeft: phases[next].seconds,
          breaths: next === 0 ? c.breaths + 1 : c.breaths,
        };
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [running, phases]);

  // Voice guide: say each phase as it begins.
  useEffect(() => {
    if (running) void speak(phases[cycle.phaseIndex].label);
  }, [running, cycle.phaseIndex, cycle.breaths, phases]);

  useEffect(() => {
    preloadSpeech([...new Set(phases.map((p) => p.label))]);
    // Only silence our own cues, so we don't cut off other guidance.
    return () => {
      if (phases.some((p) => p.label === getSpeakingText())) stopSpeaking();
    };
  }, [phases]);

  function toggle() {
    if (running) {
      stopSpeaking();
      setCycle((c) => ({ ...start, breaths: c.breaths }));
    }
    setRunning(!running);
  }

  const phase = phases[cycle.phaseIndex];
  const targetScale = running ? phase.scale : RESTING_SCALE;
  const transition = running
    ? { duration: phase.seconds, ease: BREATH_EASE }
    : { duration: 1.2, ease: "easeOut" as const };

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={toggle}
        aria-label={running ? "Stop breathing exercise" : "Start breathing exercise"}
        className="group relative flex size-72 items-center justify-center rounded-full outline-none sm:size-80"
      >
        {!reduceMotion && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-calm/15 blur-3xl"
            initial={{ scale: RESTING_SCALE, opacity: 0.4 }}
            animate={{ scale: targetScale * 1.1, opacity: running ? 0.9 : 0.4 }}
            transition={transition}
          />
        )}

        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-calm/30 bg-gradient-to-br from-calm/25 via-lavender/15 to-transparent shadow-[0_0_80px_-10px] shadow-calm/30 transition-colors group-hover:border-calm/50 group-focus-visible:border-calm"
          initial={{ scale: RESTING_SCALE }}
          animate={{ scale: targetScale }}
          transition={transition}
        />

        <span className="relative flex flex-col items-center gap-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={running ? `${cycle.phaseIndex}-${phase.label}` : "idle"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4 }}
              className="font-serif text-xl text-white/90 italic"
            >
              {running ? phase.label : "Tap to breathe"}
            </motion.span>
          </AnimatePresence>
          <span className="h-5 text-sm tabular-nums text-mist/60">
            {running ? cycle.secondsLeft : ""}
          </span>
        </span>
      </button>

      <p aria-live="polite" className="sr-only">
        {running ? `${phase.label} for ${phase.seconds} seconds` : ""}
      </p>

      <div className="flex items-center gap-3 text-sm text-mist/50">
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:text-mist focus-visible:outline-2 focus-visible:outline-calm/60"
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          {running ? "Stop" : "Start"}
        </button>
        <span aria-hidden>·</span>
        <span className="tabular-nums">
          {cycle.breaths} {cycle.breaths === 1 ? "full breath" : "full breaths"}
        </span>
      </div>
    </div>
  );
}
