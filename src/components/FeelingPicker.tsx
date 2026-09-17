"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ToolCard from "@/components/ToolCard";
import { getTool } from "@/lib/tools";

const FEELINGS = [
  { id: "anxious", emoji: "😰", label: "Anxious", note: "Anxiety lives in the body first. Slow your breath, then come back to the room.", slugs: ["breathing", "grounding", "worry-sorter"] },
  { id: "overwhelmed", emoji: "🌊", label: "Overwhelmed", note: "Too much at once? Get it out of your head and pick just one next step.", slugs: ["brain-dump", "worry-sorter", "breathing"] },
  { id: "angry", emoji: "😤", label: "Angry", note: "Anger needs somewhere to go. Let it out safely — then let your body settle.", slugs: ["unsent-letter", "stress-ball", "bubble-wrap"] },
  { id: "sad", emoji: "🌧️", label: "Low or sad", note: "Be gentle with yourself today. Small kindnesses count.", slugs: ["self-compassion", "journal", "gratitude-jar"] },
  { id: "sleep", emoji: "🌙", label: "Can't sleep", note: "Quiet the body and give your mind something soft to rest on.", slugs: ["body-scan", "soundscapes", "muscle-relaxation"] },
  { id: "tense", emoji: "🪨", label: "Tense & tight", note: "Stress hides in shoulders, jaw and back. Let's loosen it.", slugs: ["muscle-relaxation", "stretch-break", "stress-ball"] },
  { id: "restless", emoji: "🌀", label: "Restless", note: "Give your hands something to do while your mind slows down.", slugs: ["sand-garden", "bubble-wrap", "meditation-timer"] },
  { id: "okay", emoji: "🌿", label: "Doing okay", note: "Lovely. A quick check-in now makes the hard days easier to read later.", slugs: ["mood-tracker", "gratitude-jar", "stress-check"] },
] as const;

type FeelingId = (typeof FEELINGS)[number]["id"];

export default function FeelingPicker() {
  const [selected, setSelected] = useState<FeelingId | null>(null);
  const feeling = FEELINGS.find((f) => f.id === selected);

  return (
    <section aria-labelledby="feeling-title" className="mx-auto w-full max-w-5xl scroll-mt-24 px-4 pt-24 sm:px-6">
      <div className="glass relative overflow-hidden rounded-[2.5rem] p-6 sm:p-12">
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-calm/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-lavender/15 blur-3xl" />

        <div className="relative text-center">
          <p className="mb-3 text-xs tracking-[0.25em] text-calm uppercase">Personal picks</p>
          <h2 id="feeling-title" className="font-serif text-3xl text-ink sm:text-4xl">
            How are you feeling right now?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-mist/65">Tap what fits best, and we&apos;ll suggest where to start.</p>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4" role="group" aria-label="How are you feeling?">
          {FEELINGS.map((f) => {
            const active = f.id === selected;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(active ? null : f.id)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-calm/70 ${
                  active
                    ? "border-calm/50 bg-calm/12 text-ink shadow-[0_0_30px_-10px] shadow-calm/60"
                    : "border-ink/8 bg-ink/[0.03] text-mist/80 hover:-translate-y-0.5 hover:border-ink/20 hover:text-ink"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {f.emoji}
                </span>
                <span className="text-sm font-medium sm:text-base">{f.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {feeling && (
            <motion.div
              key={feeling.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="relative mt-8"
              aria-live="polite"
            >
              <p className="mb-5 text-center font-serif text-lg text-ink/90 italic">{feeling.note}</p>
              <ul className="grid gap-3 sm:grid-cols-3">
                {feeling.slugs
                  .map((slug) => getTool(slug))
                  .filter((t) => t !== undefined)
                  .map((tool) => (
                    <li key={tool.slug}>
                      <ToolCard tool={tool} />
                    </li>
                  ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
