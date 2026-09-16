"use client";

import { AudioLines, MicOff } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useVoiceProblem } from "@/hooks/useVoice";
import { VOICE_ENABLED_KEY, stopSpeaking } from "@/lib/voice";

/** Shown when the browser refused or failed to speak, so silence isn't a mystery. */
export function VoiceProblemNotice() {
  const problem = useVoiceProblem();
  if (!problem) return null;
  return (
    <p role="status" className="w-full text-sm text-amber-200/80">
      The voice couldn&apos;t play in this browser. Check that your sound is on and this tab isn&apos;t muted, then
      press Listen to try again. Restarting the browser can also help.
    </p>
  );
}

export default function VoiceToggle() {
  const [enabled, setEnabled] = useLocalStorage(VOICE_ENABLED_KEY, true);

  return (
    <button
      type="button"
      onClick={() => {
        if (enabled) stopSpeaking();
        setEnabled(!enabled);
      }}
      aria-pressed={enabled}
      title={enabled ? "Voice guide is on" : "Voice guide is off"}
      className="inline-flex items-center gap-2 rounded-full border border-mist/10 bg-dusk/60 px-3 py-2 text-sm text-mist/60 backdrop-blur transition-colors hover:border-calm/30 hover:text-mist focus-visible:outline-2 focus-visible:outline-calm/60 aria-pressed:text-calm sm:px-4"
    >
      {enabled ? <AudioLines className="size-4" /> : <MicOff className="size-4" />}
      <span className="hidden sm:inline">{enabled ? "Voice guide on" : "Voice guide off"}</span>
      <span className="sr-only sm:hidden">Voice guide</span>
    </button>
  );
}
