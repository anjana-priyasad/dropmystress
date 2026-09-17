"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { BookOpen, Clock, Download, Feather, Flame, Heart, Scale, Sprout, Trash2, Upload } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { Button, EmptyState } from "@/components/ui";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { dateKey, useToday } from "@/hooks/useToday";
import { ACTIVE_DAYS_KEY, FAVOURITES_KEY, NO_RECENT, NO_SLUGS, RECENT_KEY, currentStreak } from "@/lib/activity";
import { clearAllStorage, importStorage, readAllStorage } from "@/lib/storage";
import { getTool, type Tool } from "@/lib/tools";

type Dated = { at: string; day?: string };
type MoodEntry = Dated & { mood: number };
const NO_ITEMS: Dated[] = [];
const NO_MOODS: MoodEntry[] = [];
const MOOD_EMOJI = ["😣", "😔", "😐", "🙂", "😄"];

const toTools = (slugs: string[]) => slugs.map((slug) => getTool(slug)).filter((t): t is Tool => t !== undefined);

function greeting(today: string | null) {
  if (!today) return "Welcome back";
  const hour = new Date().getHours();
  if (hour < 5) return "Still up? Be gentle with yourself";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function daysBefore(day: string, count: number) {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() - count);
  return dateKey(date);
}

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export default function MySpace() {
  const today = useToday();
  const [favouriteSlugs] = useLocalStorage(FAVOURITES_KEY, NO_SLUGS);
  const [recent] = useLocalStorage(RECENT_KEY, NO_RECENT);
  const [activeDays] = useLocalStorage(ACTIVE_DAYS_KEY, NO_SLUGS);
  const [moods] = useLocalStorage("dms.mood", NO_MOODS);
  const [gratitude] = useLocalStorage("dms.gratitude", NO_ITEMS);
  const [journal] = useLocalStorage("dms.journal", NO_ITEMS);
  const [released] = useLocalStorage("dms.worries-released", 0);

  const allDays = [...activeDays, ...moods.map((m) => m.day ?? m.at.slice(0, 10))];
  const streak = today ? currentStreak(allDays, today) : 0;
  const favourites = toTools(favouriteSlugs);
  const latestMood = moods[0];
  const weekStart = today ? daysBefore(today, 6) : null;
  const moodsThisWeek = weekStart ? moods.filter((m) => (m.day ?? m.at.slice(0, 10)) >= weekStart) : [];
  const weekAverage = moodsThisWeek.length ? moodsThisWeek.reduce((a, m) => a + m.mood, 0) / moodsThisWeek.length : null;

  return (
    <div className="flex flex-col gap-6">
      <section className="glass relative overflow-hidden rounded-[2.5rem] p-7 sm:p-10">
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-calm/15 blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 text-xs tracking-[0.25em] text-calm uppercase">My space</p>
            <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">{greeting(today)}.</h1>
            <p className="mt-3 max-w-md text-mist/65">
              Your favourite tools, your streak, and your progress — kept only in this browser, never on our servers.
            </p>
          </div>
          <div className="flex items-center gap-5 rounded-3xl bg-ink/[0.04] p-5 ring-1 ring-ink/8">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ember/30 to-rose-400/20 ring-1 ring-ember/30">
              <Flame className="size-8 text-ember" aria-hidden />
            </span>
            <div>
              <p className="font-serif text-4xl text-ink tabular-nums">
                {streak} <span className="text-lg text-mist/60">{streak === 1 ? "day" : "days"}</span>
              </p>
              <p className="text-sm text-mist/60">{streak > 0 ? "calm streak — keep it going" : "Use any tool today to start a streak"}</p>
            </div>
          </div>
        </div>
      </section>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Feather className="size-5 text-sky-600" />} value={moods.length} label="Mood check-ins" href="/tools/mood-tracker" />
        <Stat icon={<Sprout className="size-5 text-rose-500" />} value={gratitude.length} label="Gratitude notes" href="/tools/gratitude-jar" />
        <Stat icon={<BookOpen className="size-5 text-lavender" />} value={journal.length} label="Journal entries" href="/tools/journal" />
        <Stat icon={<Scale className="size-5 text-calm" />} value={released} label="Worries let go" href="/tools/worry-sorter" />
      </ul>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="glass rounded-[2rem] p-6" aria-labelledby="fav-title">
          <h2 id="fav-title" className="mb-4 flex items-center gap-2 font-medium text-ink">
            <Heart className="size-4 text-rose-500" aria-hidden /> Favourite tools
          </h2>
          {favourites.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {favourites.map((tool) => (
                <li key={tool.slug}>
                  <ToolCard tool={tool} compact />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>
              Tap <Heart className="inline size-3.5" aria-label="Save" /> on any tool to keep it here.{" "}
              <Link href="/tools" className="text-calm underline-offset-2 hover:underline">
                Browse tools
              </Link>
            </EmptyState>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <section className="glass rounded-[2rem] p-6" aria-labelledby="mood-title">
            <h2 id="mood-title" className="mb-4 flex items-center gap-2 font-medium text-ink">
              <Feather className="size-4 text-sky-600" aria-hidden /> Mood
            </h2>
            {latestMood ? (
              <div className="flex items-center gap-4">
                <span className="text-5xl" aria-hidden>
                  {MOOD_EMOJI[latestMood.mood - 1]}
                </span>
                <div className="text-sm text-mist/70">
                  <p>Last check-in {timeAgo(latestMood.at)}</p>
                  {weekAverage !== null && (
                    <p>
                      This week&apos;s average: <span className="text-ink">{weekAverage.toFixed(1)} / 5</span>
                    </p>
                  )}
                  <Link href="/tools/mood-tracker" className="mt-1 inline-block text-calm hover:underline">
                    Check in now →
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState>
                No check-ins yet.{" "}
                <Link href="/tools/mood-tracker" className="text-calm hover:underline">
                  Log how you feel
                </Link>
              </EmptyState>
            )}
          </section>

          <section className="glass rounded-[2rem] p-6" aria-labelledby="recent-title">
            <h2 id="recent-title" className="mb-3 flex items-center gap-2 font-medium text-ink">
              <Clock className="size-4 text-lavender" aria-hidden /> Recently used
            </h2>
            {recent.length ? (
              <ul className="flex flex-col divide-y divide-ink/5">
                {recent.slice(0, 5).map((r) => {
                  const tool = getTool(r.slug);
                  if (!tool) return null;
                  return (
                    <li key={r.slug}>
                      <Link href={`/tools/${tool.slug}`} className="flex items-center justify-between gap-3 py-2.5 text-sm text-mist/80 hover:text-ink">
                        {tool.name}
                        <span className="text-xs text-mist/45">{timeAgo(r.at)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState>Tools you open will show up here.</EmptyState>
            )}
          </section>
        </div>
      </div>

      <DataControls />
    </div>
  );
}

function Stat({ icon, value, label, href }: { icon: ReactNode; value: number; label: string; href: string }) {
  return (
    <li>
      <Link href={href} className="glass flex h-full flex-col gap-3 rounded-3xl p-5 transition-transform hover:-translate-y-0.5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-ink/5" aria-hidden>
          {icon}
        </span>
        <span>
          <span className="block font-serif text-3xl text-ink tabular-nums">{value}</span>
          <span className="text-sm text-mist/60">{label}</span>
        </span>
      </Link>
    </li>
  );
}

function DataControls() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function exportData() {
    const blob = new Blob([JSON.stringify(readAllStorage(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dropmystress-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Backup downloaded.");
  }

  async function importData(file: File) {
    try {
      const count = importStorage(JSON.parse(await file.text()));
      setStatus(count ? `Restored ${count} saved items.` : "That file doesn't look like a DropMyStress backup.");
    } catch {
      setStatus("That file couldn't be read.");
    }
  }

  return (
    <section className="glass rounded-[2rem] p-6 sm:p-8" aria-labelledby="data-title">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 id="data-title" className="font-medium text-ink">
            Your data, your device
          </h2>
          <p className="mt-1 max-w-lg text-sm text-mist/60">
            Journals, moods and favourites are stored only in this browser. Back them up to move to another device, or
            erase everything in one tap.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={exportData}>
            <Download className="size-4" aria-hidden /> Export backup
          </Button>
          <Button size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" aria-hidden /> Restore
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importData(file);
              e.target.value = "";
            }}
          />
          {confirming ? (
            <>
              <Button
                size="sm"
                className="border-rose-300/40 bg-rose-400/15 text-rose-700 hover:bg-rose-400/25"
                onClick={() => {
                  clearAllStorage();
                  setConfirming(false);
                  setStatus("Everything has been erased from this browser.");
                }}
              >
                <Trash2 className="size-4" aria-hidden /> Yes, erase all
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" className="hover:border-rose-300/40 hover:text-rose-600" onClick={() => setConfirming(true)}>
              <Trash2 className="size-4" aria-hidden /> Erase all
            </Button>
          )}
        </div>
      </div>
      {status && (
        <p role="status" className="mt-4 text-sm text-calm">
          {status}
        </p>
      )}
    </section>
  );
}
