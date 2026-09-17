"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import { playBell } from "@/lib/audio";
import { speak, stopSpeaking } from "@/lib/voice";

const START_SPEECH =
  "Sit comfortably, and let your eyes close if that feels okay. Rest your attention on your breath. When your mind wanders, and it will, gently bring it back. I'll ring the bell when it's time.";
const END_SPEECH = "Your session is complete. Take a slow breath, and open your eyes when you're ready.";
import { Button, Chip } from "@/components/ui";

const DURATIONS = [3, 5, 10, 15, 20];
const INTERVALS = [
  { label: "No interval bells", minutes: 0 },
  { label: "Every minute", minutes: 1 },
  { label: "Every 5 min", minutes: 5 },
];

type Status = "idle" | "running" | "paused" | "done";

function formatTime(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function MeditationTimer() {
  const reduceMotion = useReducedMotion();
  const [minutes, setMinutes] = useState(5);
  const [intervalMinutes, setIntervalMinutes] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [endsAt, setEndsAt] = useState(0);
  const [remainingMs, setRemainingMs] = useState(minutes * 60_000);
  const lastBellAt = useRef(0);
  const speechTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(speechTimer.current);
      stopSpeaking();
    };
  }, []);

  function speakAfter(text: string, delayMs: number) {
    clearTimeout(speechTimer.current);
    speechTimer.current = setTimeout(() => void speak(text), delayMs);
  }

  useEffect(() => {
    if (status !== "running") return;
    const total = minutes * 60_000;
    const id = setInterval(() => {
      const left = endsAt - Date.now();
      if (left <= 0) {
        setStatus("done");
        setRemainingMs(0);
        playBell({ volume: 0.3, duration: 6 });
        setTimeout(() => playBell({ volume: 0.22, duration: 6 }), 1800);
        speakAfter(END_SPEECH, 3500);
        return;
      }
      setRemainingMs(left);
      if (intervalMinutes) {
        const elapsedMinutes = Math.floor((total - left) / 60_000);
        if (elapsedMinutes > 0 && elapsedMinutes % intervalMinutes === 0 && elapsedMinutes !== lastBellAt.current) {
          lastBellAt.current = elapsedMinutes;
          playBell({ volume: 0.12, duration: 3 });
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [status, endsAt, minutes, intervalMinutes]);

  function start() {
    lastBellAt.current = 0;
    setRemainingMs(minutes * 60_000);
    setEndsAt(Date.now() + minutes * 60_000);
    setStatus("running");
    playBell({ volume: 0.28, duration: 6 });
    speakAfter(START_SPEECH, 1500);
  }

  function chooseMinutes(m: number) {
    setMinutes(m);
    setRemainingMs(m * 60_000);
  }

  const progress = 1 - remainingMs / (minutes * 60_000);

  return (
    <div className="flex flex-col items-center gap-8">
      {(status === "idle" || status === "done") && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Duration">
            {DURATIONS.map((m) => (
              <Chip key={m} selected={m === minutes} onClick={() => chooseMinutes(m)}>
                {m} min
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Interval bells">
            {INTERVALS.map((i) => (
              <Chip key={i.minutes} selected={i.minutes === intervalMinutes} onClick={() => setIntervalMinutes(i.minutes)}>
                {i.label}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div className="relative flex size-64 items-center justify-center">
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full border border-lavender/20 bg-gradient-to-br from-lavender/15 via-calm/10 to-transparent"
          animate={
            status === "running" && !reduceMotion
              ? { scale: [0.92, 1, 0.92], opacity: [0.7, 1, 0.7] }
              : { scale: 0.95, opacity: 0.7 }
          }
          transition={status === "running" ? { duration: 10, repeat: Infinity, ease: "easeInOut" } : { duration: 1 }}
        />
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(rgb(95 99 201 / 0.35) ${progress * 360}deg, transparent 0deg)`,
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
          }}
        />
        <div className="relative text-center">
          <p className="text-5xl font-light tabular-nums text-ink/90" aria-live="off">
            {status === "done" ? "0:00" : formatTime(remainingMs)}
          </p>
          <p className="mt-2 text-sm text-mist/50">
            {status === "running" && "Just breathe"}
            {status === "paused" && "Paused"}
            {status === "idle" && "Ready when you are"}
            {status === "done" && "Session complete"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {status === "idle" && (
          <Button variant="primary" onClick={start}>
            <Play className="size-4" /> Begin
          </Button>
        )}
        {status === "running" && (
          <Button
            onClick={() => {
              setRemainingMs(Math.max(0, endsAt - Date.now()));
              setStatus("paused");
            }}
          >
            <Pause className="size-4" /> Pause
          </Button>
        )}
        {status === "paused" && (
          <Button
            variant="primary"
            onClick={() => {
              setEndsAt(Date.now() + remainingMs);
              setStatus("running");
            }}
          >
            <Play className="size-4" /> Resume
          </Button>
        )}
        {(status === "paused" || status === "running") && (
          <Button
            variant="ghost"
            onClick={() => {
              clearTimeout(speechTimer.current);
              stopSpeaking();
              setStatus("idle");
              setRemainingMs(minutes * 60_000);
            }}
          >
            <RotateCcw className="size-4" /> End
          </Button>
        )}
        {status === "done" && (
          <Button variant="primary" onClick={start}>
            <RotateCcw className="size-4" /> Sit again
          </Button>
        )}
      </div>

      <p className="max-w-md text-center text-sm text-mist/45">
        Sit comfortably and rest your attention on your breath. When your mind wanders — and it will —
        gently bring it back. That returning is the practice.
      </p>
    </div>
  );
}
