"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TimerStatus = "idle" | "running" | "paused" | "done";

/**
 * Runs through a list of step durations (in seconds) using wall-clock time,
 * so it stays accurate even if the tab is throttled.
 */
export function useStepTimer(durations: readonly number[], onStepStart?: (index: number) => void) {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [index, setIndex] = useState(0);
  const [endsAt, setEndsAt] = useState(0);
  const [remainingMs, setRemainingMs] = useState((durations[0] ?? 0) * 1000);

  const onStepStartRef = useRef(onStepStart);
  useEffect(() => {
    onStepStartRef.current = onStepStart;
  });

  const goTo = useCallback(
    (next: number, now: number) => {
      if (next >= durations.length) {
        setStatus("done");
        setRemainingMs(0);
        onStepStartRef.current?.(-1);
        return;
      }
      setIndex(next);
      setEndsAt(now + durations[next] * 1000);
      setRemainingMs(durations[next] * 1000);
      onStepStartRef.current?.(next);
    },
    [durations],
  );

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      const now = Date.now();
      const left = endsAt - now;
      if (left <= 0) goTo(index + 1, now);
      else setRemainingMs(left);
    }, 200);
    return () => clearInterval(id);
  }, [status, endsAt, index, goTo]);

  const start = useCallback(() => {
    setStatus("running");
    goTo(0, Date.now());
  }, [goTo]);

  const pause = useCallback(() => {
    setStatus("paused");
    setRemainingMs(Math.max(0, endsAt - Date.now()));
  }, [endsAt]);

  const resume = useCallback(() => {
    setEndsAt(Date.now() + remainingMs);
    setStatus("running");
  }, [remainingMs]);

  const skip = useCallback(() => goTo(index + 1, Date.now()), [goTo, index]);

  const reset = useCallback(() => {
    setStatus("idle");
    setIndex(0);
    setRemainingMs((durations[0] ?? 0) * 1000);
  }, [durations]);

  const stepDurationMs = (durations[index] ?? 0) * 1000;

  return {
    status,
    index,
    remainingMs,
    stepProgress: stepDurationMs ? 1 - remainingMs / stepDurationMs : 0,
    start,
    pause,
    resume,
    skip,
    reset,
  };
}
