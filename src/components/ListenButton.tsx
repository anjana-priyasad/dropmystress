"use client";

import { Speech, Square } from "lucide-react";
import { useSpeakingText } from "@/hooks/useVoice";
import { speak, stopSpeaking } from "@/lib/voice";

export default function ListenButton({ text, label = "Listen", className = "" }: { text: string; label?: string; className?: string }) {
  const speaking = useSpeakingText() === text;

  return (
    <button
      type="button"
      onClick={() => (speaking ? stopSpeaking() : void speak(text, { force: true }))}
      aria-label={speaking ? "Stop reading aloud" : `${label}: read this aloud`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-mist/12 px-3 py-1.5 text-sm text-mist/65 transition-colors hover:border-calm/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-calm/70 ${
        speaking ? "border-calm/40 text-calm" : ""
      } ${className}`}
    >
      {speaking ? <Square className="size-3.5 fill-current" /> : <Speech className="size-4" />}
      {speaking ? "Stop" : label}
    </button>
  );
}
