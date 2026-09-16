"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Lock, Shuffle, X } from "lucide-react";
import { createId, useLocalStorage } from "@/hooks/useLocalStorage";
import { Button, EmptyState } from "@/components/ui";
import ListenButton from "@/components/ListenButton";
import { useSpeakOnChange } from "@/hooks/useVoice";

type Entry = { id: string; prompt: string; text: string; at: string };

const NO_ENTRIES: Entry[] = [];

const PROMPTS = [
  "What's taking up the most space in your mind right now?",
  "What would you like to let go of today?",
  "Describe a moment today, however small, when you felt okay.",
  "What is one thing you handled better than you give yourself credit for?",
  "If your stress could talk, what would it be trying to tell you?",
  "What do you need more of this week? What do you need less of?",
  "Write about a place where you feel completely safe.",
  "What's something you're looking forward to, even a little?",
  "Who could you reach out to this week, and what would you say?",
  "What would you tell a friend going through exactly what you are?",
  "What boundaries would make your days feel lighter?",
  "What's one thing within your control that you could change tomorrow?",
  "What have you survived before that once felt impossible?",
  "Describe your ideal slow, quiet morning.",
  "What are you carrying that isn't actually yours to carry?",
  "What does rest look like for you — really?",
  "Write about something that made you laugh recently.",
  "Which of your worries today is a fact, and which is a guess?",
  "What are three things you appreciate about yourself?",
  "What would today look like if you were a little gentler with yourself?",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function JournalPrompts() {
  const [entries, setEntries] = useLocalStorage("dms.journal", NO_ENTRIES);
  const [promptIndex, setPromptIndex] = useState(0);
  const [text, setText] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const prompt = PROMPTS[promptIndex];
  useSpeakOnChange(prompt);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  function nextPrompt() {
    let next = Math.floor(Math.random() * PROMPTS.length);
    if (next === promptIndex) next = (next + 1) % PROMPTS.length;
    setPromptIndex(next);
  }

  function save() {
    if (!text.trim()) return;
    setEntries((prev) => [{ id: createId(), prompt, text: text.trim(), at: new Date().toISOString() }, ...prev]);
    setText("");
    nextPrompt();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <AnimatePresence mode="wait">
            <motion.h3
              key={promptIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="font-serif text-2xl leading-snug text-white/90"
            >
              {prompt}
            </motion.h3>
          </AnimatePresence>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            <ListenButton text={prompt} />
            <Button variant="ghost" size="sm" onClick={nextPrompt}>
              <Shuffle className="size-4" /> New prompt
            </Button>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label={prompt}
          rows={10}
          placeholder="Start anywhere. There's no wrong answer."
          className="w-full resize-y rounded-2xl border border-mist/12 bg-night/60 p-5 font-serif text-lg leading-relaxed text-slate-100 outline-none placeholder:text-mist/30 focus:border-calm/40"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-xs text-mist/40">
            <Lock className="size-3.5" /> Saved only on this device · {words} words
          </span>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {savedFlash && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-calm" role="status">
                  Saved
                </motion.span>
              )}
            </AnimatePresence>
            <Button variant="primary" onClick={save} disabled={!text.trim()}>
              Save entry
            </Button>
          </div>
        </div>
      </div>

      <section aria-labelledby="past-entries" className="border-t border-mist/10 pt-8">
        <h3 id="past-entries" className="mb-4 font-serif text-xl text-white/85">
          Past entries
        </h3>
        {entries.length === 0 ? (
          <EmptyState>Your entries will appear here.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => {
              const open = openId === entry.id;
              return (
                <li key={entry.id} className="rounded-2xl border border-mist/10">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : entry.id)}
                      aria-expanded={open}
                      className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left"
                    >
                      <ChevronDown className={`size-4 shrink-0 text-mist/40 transition-transform ${open ? "rotate-180" : ""}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-white/85">{entry.prompt}</span>
                        <span className="block text-xs text-mist/40">{formatDate(entry.at)}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Delete this entry? This can't be undone.")) {
                          setEntries((prev) => prev.filter((e) => e.id !== entry.id));
                        }
                      }}
                      aria-label="Delete entry"
                      className="mr-3 rounded-full p-1.5 text-mist/30 hover:text-mist"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  {open && (
                    <p className="border-t border-mist/10 px-5 py-4 font-serif whitespace-pre-wrap text-mist/80">{entry.text}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
