"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Feather, Sun, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createId, useLocalStorage } from "@/hooks/useLocalStorage";
import { Button, EmptyState, inputClass } from "@/components/ui";
import ListenButton from "@/components/ListenButton";
import { useSpeakOnChange } from "@/hooks/useVoice";

const INTRO_SPEECH =
  "Write down everything on your mind: tasks, worries, reminders. One per line, and don't filter. Then we'll sort each one into today, later, or not yours to carry.";
const SORT_SPEECH =
  "Now sort each one. Today is only what truly needs you today. Later is important, but can wait. And some things are simply not yours to carry.";

type Bucket = "inbox" | "today" | "later" | "drop";
type Item = { id: string; text: string; bucket: Bucket; done: boolean };

const NO_ITEMS: Item[] = [];

const BUCKETS: { id: Exclude<Bucket, "inbox">; label: string; hint: string; icon: LucideIcon; tone: string }[] = [
  { id: "today", label: "Today", hint: "Only what truly needs you today. Try for 3 or fewer.", icon: Sun, tone: "text-calm" },
  { id: "later", label: "Later", hint: "Important, but it can wait.", icon: Clock, tone: "text-lavender" },
  { id: "drop", label: "Not mine to carry", hint: "Out of your control, or not worth your energy.", icon: Feather, tone: "text-rose-500" },
];

export default function BrainDump() {
  const [draft, setDraft] = useState("");
  const [items, setItems] = useLocalStorage("dms.brain-dump", NO_ITEMS);

  const inbox = items.filter((i) => i.bucket === "inbox");
  useSpeakOnChange(inbox.length > 0 ? SORT_SPEECH : null);

  function dump() {
    const lines = draft.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setItems((prev) => [...prev, ...lines.map((text) => ({ id: createId(), text, bucket: "inbox" as const, done: false }))]);
    setDraft("");
  }

  const move = (id: string, bucket: Bucket) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, bucket } : i)));
  const toggle = (id: string) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="flex flex-col gap-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <label htmlFor="dump" className="text-mist/70">
            Write down everything on your mind — tasks, worries, reminders. One per line. Don&apos;t filter.
          </label>
          <ListenButton text={INTRO_SPEECH} />
        </div>
        <textarea
          id="dump"
          rows={6}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) dump();
          }}
          placeholder={"Reply to Sam's email\nBook dentist\nWorried about rent\nClean the kitchen"}
          className={inputClass}
        />
        <Button variant="primary" className="self-end" onClick={dump} disabled={!draft.trim()}>
          Get it out of my head
        </Button>
      </div>

      <AnimatePresence>
        {inbox.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto w-full max-w-2xl"
            aria-labelledby="to-sort"
          >
            <h3 id="to-sort" className="mb-3 font-serif text-xl text-ink/85">
              Sort each one <span className="text-base text-mist/45">({inbox.length} left)</span>
            </h3>
            <ul className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {inbox.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    exit={{ opacity: 0, x: 30 }}
                    className="flex flex-col gap-2 rounded-2xl border border-mist/10 bg-canvas/40 p-3 sm:flex-row sm:items-center"
                  >
                    <span className="flex-1 text-ink/90">{item.text}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {BUCKETS.map((b) => (
                        <Button key={b.id} size="sm" onClick={() => move(item.id, b.id)}>
                          <b.icon className={`size-3.5 ${b.tone}`} /> {b.label}
                        </Button>
                      ))}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="grid gap-4 md:grid-cols-3">
        {BUCKETS.map((b) => {
          const bucketItems = items.filter((i) => i.bucket === b.id);
          return (
            <section key={b.id} aria-labelledby={`bucket-${b.id}`} className="flex flex-col rounded-2xl border border-mist/10 p-4">
              <h3 id={`bucket-${b.id}`} className="flex items-center gap-2 font-medium text-ink/90">
                <b.icon className={`size-4 ${b.tone}`} /> {b.label}
                <span className="ml-auto text-sm text-mist/40 tabular-nums">{bucketItems.length}</span>
              </h3>
              <p className="mb-3 text-xs text-mist/45">{b.hint}</p>
              {b.id === "today" && bucketItems.length > 3 && (
                <p className="mb-2 rounded-xl bg-amber-300/10 px-3 py-2 text-xs text-amber-700/80">
                  That&apos;s a lot for one day. Could anything move to Later?
                </p>
              )}
              {bucketItems.length === 0 ? (
                <EmptyState>Nothing here</EmptyState>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {bucketItems.map((item) => (
                    <li key={item.id} className="group flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-mist/5">
                      {b.id === "drop" ? (
                        <Feather className="size-3.5 shrink-0 text-rose-500/50" aria-hidden />
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggle(item.id)}
                          aria-label={item.done ? `Mark "${item.text}" not done` : `Mark "${item.text}" done`}
                          className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                            item.done ? "border-calm bg-calm text-canvas" : "border-mist/30"
                          }`}
                        >
                          {item.done && <Check className="size-3" />}
                        </button>
                      )}
                      <span className={`flex-1 text-sm ${item.done || b.id === "drop" ? "text-mist/45 line-through" : "text-mist/85"}`}>
                        {item.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label={`Remove "${item.text}"`}
                        className="text-mist/30 opacity-0 transition-opacity group-hover:opacity-100 hover:text-mist focus-visible:opacity-100"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {b.id === "drop" && bucketItems.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-3 self-start"
                  onClick={() => setItems((prev) => prev.filter((i) => i.bucket !== "drop"))}
                >
                  Release them all
                </Button>
              )}
              {b.id !== "drop" && bucketItems.some((i) => i.done) && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-3 self-start"
                  onClick={() => setItems((prev) => prev.filter((i) => !(i.bucket === b.id && i.done)))}
                >
                  Clear finished
                </Button>
              )}
            </section>
          );
        })}
      </div>
      <p className="text-center text-xs text-mist/40">Your lists are saved only in this browser.</p>
    </div>
  );
}
