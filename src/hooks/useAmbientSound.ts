"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createSoundChannel, getAudioContext, type SoundChannel } from "@/lib/audio";

const VOLUME = 0.35;
const FADE_SECONDS = 1.5;

/** Toggles a soft ocean ambience with gentle fades. */
export function useAmbientSound() {
  const channelRef = useRef<SoundChannel | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (!channelRef.current) {
      channelRef.current = createSoundChannel(ctx, "ocean");
      channelRef.current.output.connect(ctx.destination);
    }
    const gain = channelRef.current.output.gain;
    const now = ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(playing ? 0 : VOLUME, now + FADE_SECONDS);
    setPlaying(!playing);
  }, [playing]);

  useEffect(() => {
    return () => channelRef.current?.stop();
  }, []);

  return { playing, toggle };
}
