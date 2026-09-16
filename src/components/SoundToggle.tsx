"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useAmbientSound } from "@/hooks/useAmbientSound";

export default function SoundToggle() {
  const { playing, toggle } = useAmbientSound();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      className="inline-flex items-center gap-2 rounded-full border border-mist/10 bg-dusk/60 px-3 py-2 whitespace-nowrap sm:px-4 text-sm text-mist/60 backdrop-blur transition-colors hover:border-calm/30 hover:text-mist focus-visible:outline-2 focus-visible:outline-calm/60 aria-pressed:text-calm"
    >
      {playing ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
      <span className="hidden sm:inline">{playing ? "Ocean sounds on" : "Ocean sounds"}</span>
      <span className="sr-only sm:hidden">Ocean sounds</span>
    </button>
  );
}
