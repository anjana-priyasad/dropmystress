"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Shuffle, X } from "lucide-react";
import { createId, useLocalStorage } from "@/hooks/useLocalStorage";
import { Button, inputClass } from "@/components/ui";
import ListenButton from "@/components/ListenButton";
import { useSpeakOnChange } from "@/hooks/useVoice";

type Note = { id: string; text: string; at: string; color: number };

const NO_NOTES: Note[] = [];
const NOTE_COLORS = ["bg-amber-200", "bg-rose-200", "bg-teal-200", "bg-indigo-200", "bg-lime-200", "bg-orange-200"];
const JAR_SLOTS = 48;

const PROMPTS = [
  "Something that made you smile today",
  "A person you're glad exists",
  "A small comfort you enjoyed",
  "Something your body did for you",
  "A problem that's already behind you",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function GratitudeJar() {
  const [notes, setNotes] = useLocalStorage("dms.gratitude", NO_NOTES);
  const [draft, setDraft] = useState("");
  const [promptIndex, setPromptIndex] = useState(0);
  const [pulled, setPulled] = useState<Note | null>(null);
  const [showAll, setShowAll] = useState(false);
  useSpeakOnChange(pulled ? `From your jar: ${pulled.text}` : null);

  function add() {
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [{ id: createId(), text, at: new Date().toISOString(), color: prev.length % NOTE_COLORS.length }, ...prev]);
    setDraft("");
    setPromptIndex((i) => (i + 1) % PROMPTS.length);
  }

  function pullOne() {
    if (!notes.length) return;
    let next = notes[Math.floor(Math.random() * notes.length)];
    if (notes.length > 1 && pulled && next.id === pulled.id) {
      next = notes[(notes.indexOf(next) + 1) % notes.length];
    }
    setPulled(next);
  }

  // Oldest first, so new notes land on top of the pile.
  const visible = notes.slice(0, JAR_SLOTS).reverse();

  return (
    <div className="grid items-start gap-10 md:grid-cols-[1fr_16rem]">
      <div className="flex flex-col gap-6">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="gratitude" className="text-mist/70">
              {PROMPTS[promptIndex]}…
            </label>
            <ListenButton text={`${PROMPTS[promptIndex]}. However small it is, write it down and drop it in the jar.`} />
          </div>
          <div className="flex gap-2">
            <input
              id="gratitude"
              value={draft}
              maxLength={200}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="However small it is"
              className={inputClass}
            />
            <Button type="submit" variant="primary" disabled={!draft.trim()} aria-label="Add to jar">
              <Plus className="size-4" />
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={pullOne} disabled={!notes.length}>
            <Shuffle className="size-4" /> Pull a note from the jar
          </Button>
          <span className="text-sm text-mist/45">
            {notes.length} {notes.length === 1 ? "good thing" : "good things"} collected
          </span>
        </div>

        <AnimatePresence mode="wait">
          {pulled && (
            <motion.figure
              key={pulled.id}
              initial={{ opacity: 0, y: 20, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              exit={{ opacity: 0, y: -10 }}
              className={`${NOTE_COLORS[pulled.color]} relative rounded-lg p-5 text-slate-800 shadow-xl`}
            >
              <button
                type="button"
                onClick={() => setPulled(null)}
                aria-label="Put the note back"
                className="absolute top-2 right-2 rounded-full p-1 text-slate-600 hover:bg-black/5"
              >
                <X className="size-4" />
              </button>
              <blockquote className="pr-6 font-serif text-lg">{pulled.text}</blockquote>
              <figcaption className="mt-2 text-xs text-slate-600">{formatDate(pulled.at)}</figcaption>
            </motion.figure>
          )}
        </AnimatePresence>

        {notes.length > 0 && (
          <div>
            <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)} aria-expanded={showAll}>
              {showAll ? "Hide all notes" : "See all notes"}
            </Button>
            {showAll && (
              <ul className="mt-3 flex flex-col gap-1.5">
                {notes.map((n) => (
                  <li key={n.id} className="group flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-mist/5">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${NOTE_COLORS[n.color]}`} aria-hidden />
                    <span className="flex-1 text-mist/85">{n.text}</span>
                    <span className="text-xs text-mist/35">{formatDate(n.at)}</span>
                    <button
                      type="button"
                      onClick={() => setNotes((prev) => prev.filter((x) => x.id !== n.id))}
                      aria-label={`Delete "${n.text}"`}
                      className="text-mist/30 opacity-0 group-hover:opacity-100 hover:text-mist focus-visible:opacity-100"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <p className="text-xs text-mist/40">Your notes are saved only in this browser.</p>
      </div>

      {/* The jar */}
      <div className="mx-auto flex w-56 flex-col items-center" aria-hidden>
        <div className="h-5 w-32 rounded-t-lg rounded-b-sm border border-mist/20 bg-amber-900/40" />
        <div className="h-3 w-36 border-x border-mist/15 bg-mist/5" />
        <div className="relative flex h-72 w-56 flex-wrap-reverse content-start items-end gap-1.5 overflow-hidden rounded-[2.5rem] border border-mist/20 bg-gradient-to-br from-mist/10 via-transparent to-mist/5 p-4 shadow-inner">
          <AnimatePresence initial={false}>
            {visible.map((n, i) => (
              <motion.span
                key={n.id}
                initial={{ y: -300, opacity: 0, rotate: 30 }}
                animate={{ y: 0, opacity: 0.9, rotate: ((i * 37) % 50) - 25 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 14, stiffness: 90 }}
                className={`${NOTE_COLORS[n.color]} h-5 w-7 rounded-sm shadow`}
              />
            ))}
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-y-6 left-4 w-3 rounded-full bg-white/10 blur-[2px]" />
        </div>
      </div>
    </div>
  );
}
