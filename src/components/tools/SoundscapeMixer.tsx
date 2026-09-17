"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CloudRain, Flame, Square, WavesHorizontal as Waves, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createSoundChannel, getAudioContext, type SoundChannel, type SoundChannelId } from "@/lib/audio";
import { Button } from "@/components/ui";

const CHANNELS: { id: SoundChannelId; name: string; icon: LucideIcon }[] = [
  { id: "rain", name: "Rain", icon: CloudRain },
  { id: "ocean", name: "Ocean waves", icon: Waves },
  { id: "wind", name: "Wind", icon: Wind },
  { id: "fire", name: "Campfire", icon: Flame },
  { id: "brown", name: "Brown noise", icon: Square },
];

const PRESETS: { name: string; mix: Partial<Record<SoundChannelId, number>> }[] = [
  { name: "Rainy night", mix: { rain: 0.7, wind: 0.25 } },
  { name: "Beach", mix: { ocean: 0.8, wind: 0.2 } },
  { name: "Cabin", mix: { fire: 0.6, rain: 0.35 } },
  { name: "Deep focus", mix: { brown: 0.6 } },
];

type Levels = Record<SoundChannelId, number>;
const SILENT: Levels = { rain: 0, ocean: 0, wind: 0, fire: 0, brown: 0 };
const DEFAULT_LEVEL = 0.5;

export default function SoundscapeMixer() {
  const channels = useRef(new Map<SoundChannelId, SoundChannel>());
  const master = useRef<GainNode | null>(null);
  const [levels, setLevels] = useState<Levels>(SILENT);
  const [masterLevel, setMasterLevel] = useState(0.7);

  useEffect(() => {
    const map = channels.current;
    return () => {
      map.forEach((c) => c.stop());
      map.clear();
      master.current?.disconnect();
    };
  }, []);

  function ensureMaster(ctx: AudioContext) {
    if (!master.current) {
      master.current = ctx.createGain();
      master.current.gain.value = masterLevel;
      master.current.connect(ctx.destination);
    }
    return master.current;
  }

  function setLevel(id: SoundChannelId, level: number) {
    const ctx = getAudioContext();
    if (!ctx) return;
    let channel = channels.current.get(id);
    if (!channel && level > 0) {
      channel = createSoundChannel(ctx, id);
      channel.output.connect(ensureMaster(ctx));
      channels.current.set(id, channel);
    }
    channel?.output.gain.setTargetAtTime(level, ctx.currentTime, 0.25);
    setLevels((prev) => ({ ...prev, [id]: level }));
  }

  function applyPreset(mix: Partial<Levels>) {
    CHANNELS.forEach(({ id }) => setLevel(id, mix[id] ?? 0));
  }

  function changeMaster(level: number) {
    setMasterLevel(level);
    const ctx = getAudioContext();
    if (ctx && master.current) master.current.gain.setTargetAtTime(level, ctx.currentTime, 0.1);
  }

  const anyPlaying = Object.values(levels).some((l) => l > 0);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <Button key={p.name} size="sm" onClick={() => applyPreset(p.mix)}>
            {p.name}
          </Button>
        ))}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {CHANNELS.map(({ id, name, icon: Icon }) => {
          const level = levels[id];
          const on = level > 0;
          return (
            <li key={id} className={`rounded-2xl border p-4 transition-colors ${on ? "border-calm/35 bg-calm/5" : "border-mist/10"}`}>
              <div className="mb-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLevel(id, on ? 0 : DEFAULT_LEVEL)}
                  aria-pressed={on}
                  aria-label={`${on ? "Turn off" : "Turn on"} ${name}`}
                  className={`flex size-11 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-calm/70 ${
                    on ? "bg-calm/20 text-calm" : "bg-mist/5 text-mist/50 hover:text-mist"
                  }`}
                >
                  <motion.span animate={on ? { scale: [1, 1.12, 1] } : { scale: 1 }} transition={on ? { duration: 3, repeat: Infinity } : undefined}>
                    <Icon className="size-5" />
                  </motion.span>
                </button>
                <span className={on ? "text-ink/90" : "text-mist/60"}>{name}</span>
                <span className="ml-auto text-xs text-mist/40 tabular-nums">{Math.round(level * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={level}
                onChange={(e) => setLevel(id, Number(e.target.value))}
                aria-label={`${name} volume`}
                className="w-full accent-calm"
              />
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-mist/10 p-4">
        <label htmlFor="master" className="text-sm text-mist/60">
          Master volume
        </label>
        <input
          id="master"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={masterLevel}
          onChange={(e) => changeMaster(Number(e.target.value))}
          className="min-w-32 flex-1 accent-calm"
        />
        <Button size="sm" onClick={() => applyPreset({})} disabled={!anyPlaying}>
          Stop all
        </Button>
      </div>
      <p className="text-center text-xs text-mist/40">
        Sounds are generated live in your browser. Headphones recommended. Sound stops when you leave this page.
      </p>
    </div>
  );
}
