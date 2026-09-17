"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useStepTimer } from "@/hooks/useStepTimer";
import { playBell } from "@/lib/audio";
import { Button, ProgressBar } from "@/components/ui";
import ListenButton from "@/components/ListenButton";
import { preloadSpeech, speak, stopSpeaking } from "@/lib/voice";

export type GuidedStep = {
  title: string;
  instruction: string;
  seconds: number;
  /** Colours the ring: "tense" steps glow warm, everything else stays calm. */
  tone?: "tense" | "calm";
};

type Props = {
  steps: GuidedStep[];
  intro: string;
  outro: string;
  note?: string;
};

const RING_RADIUS = 88;

/** What the voice guide says for a step. Drops list numbering like "1 · ". */
const stepSpeech = (step: GuidedStep) => `${step.title.replace(/^\d+\s*·\s*/, "")}. ${step.instruction}`;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

export default function GuidedSession({ steps, intro, outro, note }: Props) {
  const [chime, setChime] = useState(true);
  const durations = useMemo(() => steps.map((s) => s.seconds), [steps]);
  const timer = useStepTimer(durations, (i) => {
    if (chime) playBell({ volume: i === -1 ? 0.22 : 0.1, duration: i === -1 ? 5 : 2 });
    if (i === -1) {
      void speak(outro);
      return;
    }
    void speak(stepSpeech(steps[i]));
    const next = steps[i + 1];
    preloadSpeech(next ? [stepSpeech(next)] : [outro]);
  });

  // Generate the whole session's voice up front so each step speaks right on time.
  useEffect(() => {
    preloadSpeech([...steps.map(stepSpeech), outro]);
    return () => stopSpeaking();
  }, [steps, outro]);

  const step = steps[timer.index];
  const totalSeconds = durations.reduce((a, b) => a + b, 0);
  const elapsed =
    durations.slice(0, timer.index).reduce((a, b) => a + b, 0) +
    (step.seconds - timer.remainingMs / 1000);
  const isTense = step.tone === "tense";
  const active = timer.status === "running" || timer.status === "paused";

  return (
    <div className="flex flex-col items-center gap-8">
      {timer.status === "idle" && (
        <div className="flex max-w-lg flex-col items-center gap-6 text-center">
          <p className="text-lg leading-relaxed text-mist/80">{intro}</p>
          <ListenButton text={intro} />
          <p className="text-sm text-mist/45">
            {steps.length} steps · about {Math.round(totalSeconds / 60)} min
          </p>
          <Button variant="primary" onClick={timer.start}>
            <Play className="size-4" /> Begin
          </Button>
        </div>
      )}

      {active && (
        <>
          <div className="relative flex size-56 items-center justify-center">
            <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="100" cy="100" r={RING_RADIUS} className="fill-none stroke-mist/10" strokeWidth="4" />
              <circle
                cx="100"
                cy="100"
                r={RING_RADIUS}
                className={`fill-none transition-[stroke-dashoffset,stroke] duration-200 ease-linear ${
                  isTense ? "stroke-orange-600" : "stroke-calm"
                }`}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH * (1 - timer.stepProgress)}
              />
            </svg>
            <motion.div
              className={`absolute inset-6 rounded-full blur-2xl ${isTense ? "bg-orange-400/15" : "bg-calm/10"}`}
              animate={{ scale: isTense ? 0.85 : 1.05 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <span className="relative text-5xl font-light tabular-nums text-ink/90">
              {Math.ceil(timer.remainingMs / 1000)}
            </span>
          </div>

          <div className="min-h-32 max-w-lg text-center" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={timer.index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45 }}
              >
                <p className="mb-2 text-xs tracking-widest text-mist/40 uppercase">
                  Step {timer.index + 1} of {steps.length}
                </p>
                <h3 className="mb-3 font-serif text-2xl text-ink/90">{step.title}</h3>
                <p className="text-lg leading-relaxed text-mist/75">{step.instruction}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="w-full max-w-sm">
            <ProgressBar value={elapsed / totalSeconds} label="Session progress" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {timer.status === "running" ? (
              <Button
                onClick={() => {
                  stopSpeaking();
                  timer.pause();
                }}
              >
                <Pause className="size-4" /> Pause
              </Button>
            ) : (
              <Button variant="primary" onClick={timer.resume}>
                <Play className="size-4" /> Resume
              </Button>
            )}
            <Button variant="ghost" onClick={timer.skip}>
              <SkipForward className="size-4" /> Skip
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                stopSpeaking();
                timer.reset();
              }}
            >
              <RotateCcw className="size-4" /> Restart
            </Button>
          </div>
        </>
      )}

      {timer.status === "done" && (
        <motion.div
          className="flex max-w-lg flex-col items-center gap-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-serif text-2xl leading-snug text-ink/90 italic">{outro}</p>
          <Button onClick={timer.start}>
            <RotateCcw className="size-4" /> Go again
          </Button>
        </motion.div>
      )}

      <div className="flex flex-col items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setChime(!chime)} aria-pressed={chime}>
          {chime ? <Bell className="size-4" /> : <BellOff className="size-4" />}
          {chime ? "Soft chime between steps" : "Chime off"}
        </Button>
        {note && <p className="max-w-md text-center text-xs text-mist/40">{note}</p>}
      </div>
    </div>
  );
}
