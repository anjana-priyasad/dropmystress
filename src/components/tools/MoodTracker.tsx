"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createId, useLocalStorage } from "@/hooks/useLocalStorage";
import { dateKey, useToday } from "@/hooks/useToday";
import { Button, Chip, EmptyState, inputClass } from "@/components/ui";
import ListenButton from "@/components/ListenButton";
import { speak, stopSpeaking } from "@/lib/voice";

const CHECKIN_SPEECH = "How are you feeling right now? Choose the face that fits best. If you like, add what's affecting your mood.";

type Entry = { id: string; at: string; day: string; mood: number; tags: string[]; note: string };

const NO_ENTRIES: Entry[] = [];
const DAYS_SHOWN = 14;
const BAR_COLOR = "#11a594"; // validated for the dark chart surface
const BAR_HOVER = "#2dd4bf";

const MOODS = [
  { value: 1, label: "Awful", emoji: "😣" },
  { value: 2, label: "Low", emoji: "😔" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Great", emoji: "😄" },
];

const TAGS = ["Work", "Study", "Sleep", "Family", "Friends", "Relationship", "Health", "Money", "Exercise", "Weather", "News", "Alone time"];

const moodLabel = (value: number) => MOODS[Math.round(value) - 1]?.label ?? "";

function lastDays(today: string, count: number) {
  const [y, m, d] = today.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(y, m - 1, d - (count - 1 - i));
    return { key: dateKey(date), date };
  });
}

function topTags(entries: Entry[]) {
  const counts = new Map<string, number>();
  entries.forEach((e) => e.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
}

export default function MoodTracker() {
  const [entries, setEntries] = useLocalStorage("dms.mood", NO_ENTRIES);
  const today = useToday();
  const [mood, setMood] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [hovered, setHovered] = useState<number | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  function save() {
    if (!mood) return;
    const now = new Date();
    setEntries((prev) => [{ id: createId(), at: now.toISOString(), day: dateKey(now), mood, tags, note: note.trim() }, ...prev]);
    setMood(null);
    setTags([]);
    setNote("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
    void speak("Saved. Thank you for checking in with yourself.");
  }

  useEffect(() => () => stopSpeaking(), []);

  const days = useMemo(() => {
    if (!today) return [];
    return lastDays(today, DAYS_SHOWN).map(({ key, date }) => {
      const dayEntries = entries.filter((e) => e.day === key);
      const avg = dayEntries.length ? dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length : null;
      return { key, date, avg, count: dayEntries.length };
    });
  }, [entries, today]);

  const lowTags = topTags(entries.filter((e) => e.mood <= 2));
  const highTags = topTags(entries.filter((e) => e.mood >= 4));

  return (
    <div className="flex flex-col gap-10">
      {/* Check-in */}
      <section aria-labelledby="checkin" className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <h3 id="checkin" className="text-center font-serif text-2xl text-white/90">
          How are you feeling right now?
        </h3>
        <ListenButton text={CHECKIN_SPEECH} className="self-center" />
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Mood">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={mood === m.value}
              onClick={() => setMood(m.value)}
              className={`flex flex-col items-center gap-1 rounded-2xl border py-3 transition-all focus-visible:outline-2 focus-visible:outline-calm/70 ${
                mood === m.value ? "scale-105 border-calm/60 bg-calm/10" : "border-mist/10 hover:border-mist/25"
              }`}
            >
              <span className="text-3xl" aria-hidden>
                {m.emoji}
              </span>
              <span className="text-xs text-mist/70">{m.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {mood && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-4 overflow-hidden">
              <div>
                <p className="mb-2 text-sm text-mist/60">What&apos;s affecting it? (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((t) => (
                    <Chip key={t} selected={tags.includes(t)} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>
              <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="A short note (optional)" aria-label="Note" className={inputClass} />
              <Button variant="primary" className="self-end" onClick={save}>
                Save check-in
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        {justSaved && (
          <p role="status" className="text-center text-sm text-calm">
            Saved. Thanks for checking in with yourself.
          </p>
        )}
      </section>

      {/* Last 14 days */}
      <section aria-labelledby="mood-chart" className="rounded-3xl border border-mist/10 bg-night/40 p-5 sm:p-6">
        <h3 id="mood-chart" className="font-medium text-white/90">
          Average mood, last {DAYS_SHOWN} days
        </h3>
        <p className="mb-6 text-sm text-mist/50">Hover or tap a day for details.</p>

        <div className="relative flex gap-3">
          {/* Y axis */}
          <div className="flex h-44 flex-col justify-between py-0 text-right text-xs text-mist/45" aria-hidden>
            <span className="-translate-y-1/2">Great</span>
            <span>Okay</span>
            <span className="translate-y-1/2">Awful</span>
          </div>

          <div className="relative flex-1">
            {/* Gridlines at 5, 3, 1 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-mist/10" />
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-mist/10" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-mist/20" />

            <div className="flex h-44 items-end">
              {days.map((day, i) => {
                const height = day.avg ? ((day.avg - 1) / 4) * 100 : 0;
                const isHovered = hovered === i;
                return (
                  <button
                    key={day.key}
                    type="button"
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setHovered(isHovered ? null : i)}
                    aria-label={`${day.date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}: ${
                      day.avg ? `${moodLabel(day.avg)}, average ${day.avg.toFixed(1)} of 5 from ${day.count} check-ins` : "no check-ins"
                    }`}
                    className="relative flex h-full flex-1 items-end justify-center outline-none focus-visible:bg-mist/5"
                  >
                    {day.avg ? (
                      <span
                        className="block w-full max-w-6 rounded-t transition-colors"
                        style={{ height: `max(${height}%, 4px)`, backgroundColor: isHovered ? BAR_HOVER : BAR_COLOR }}
                      />
                    ) : (
                      <span className="mb-0 block h-px w-2 bg-mist/20" />
                    )}
                    {isHovered && (
                      <span
                        className={`pointer-events-none absolute bottom-full z-10 mb-2 w-max rounded-xl border border-mist/15 bg-dusk px-3 py-2 text-left shadow-xl ${
                          i < 3 ? "left-0" : i > days.length - 4 ? "right-0" : "left-1/2 -translate-x-1/2"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-white">
                          {day.avg ? `${moodLabel(day.avg)} · ${day.avg.toFixed(1)}` : "No check-ins"}
                        </span>
                        <span className="block text-xs text-mist/55">
                          {day.date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                          {day.count > 0 && ` · ${day.count} check-in${day.count > 1 ? "s" : ""}`}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex text-xs text-mist/40" aria-hidden>
              {days.map((day, i) => (
                <span key={day.key} className="flex-1 text-center">
                  {i === days.length - 1 ? "Today" : i % 2 === 1 ? day.date.toLocaleDateString(undefined, { weekday: "short" }) : ""}
                </span>
              ))}
            </div>
          </div>
        </div>

        {(lowTags.length > 0 || highTags.length > 0) && (
          <div className="mt-6 grid gap-3 border-t border-mist/10 pt-5 text-sm sm:grid-cols-2">
            {highTags.length > 0 && (
              <p className="text-mist/70">
                <span className="text-mist/45">Often on good days:</span> {highTags.join(", ")}
              </p>
            )}
            {lowTags.length > 0 && (
              <p className="text-mist/70">
                <span className="text-mist/45">Often on hard days:</span> {lowTags.join(", ")}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Recent check-ins (also serves as the chart's table view) */}
      <section aria-labelledby="recent-checkins">
        <h3 id="recent-checkins" className="mb-3 font-serif text-xl text-white/85">
          Recent check-ins
        </h3>
        {entries.length === 0 ? (
          <EmptyState>Your check-ins will show up here. They&apos;re saved only in this browser.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {entries.slice(0, 15).map((e) => {
              const m = MOODS[e.mood - 1];
              return (
                <li key={e.id} className="group flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-mist/5">
                  <span className="text-xl" aria-hidden>
                    {m.emoji}
                  </span>
                  <span className="w-12 text-sm text-white/85">{m.label}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-mist/55">
                    {[e.tags.join(", "), e.note].filter(Boolean).join(" — ")}
                  </span>
                  <span className="text-xs text-mist/35">
                    {new Date(e.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEntries((prev) => prev.filter((x) => x.id !== e.id))}
                    aria-label="Delete check-in"
                    className="text-mist/30 opacity-0 group-hover:opacity-100 hover:text-mist focus-visible:opacity-100"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
