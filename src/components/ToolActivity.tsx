"use client";

import { useEffect, useState } from "react";
import { Heart, Share2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { dateKey } from "@/hooks/useToday";
import { ACTIVE_DAYS_KEY, FAVOURITES_KEY, NO_RECENT, NO_SLUGS, RECENT_KEY, withActiveDay, withRecent } from "@/lib/activity";

/** Remembers that this tool was opened today, for "Recently used" and the streak in My space. */
export function RecordToolVisit({ slug }: { slug: string }) {
  const [, setRecent] = useLocalStorage(RECENT_KEY, NO_RECENT);
  const [, setDays] = useLocalStorage(ACTIVE_DAYS_KEY, NO_SLUGS);

  useEffect(() => {
    setRecent((recent) => withRecent(recent, slug));
    setDays((days) => withActiveDay(days, dateKey(new Date())));
  }, [slug, setRecent, setDays]);

  return null;
}

const pill =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-calm/70";

export function FavouriteButton({ slug }: { slug: string }) {
  const [favourites, setFavourites] = useLocalStorage(FAVOURITES_KEY, NO_SLUGS);
  const saved = favourites.includes(slug);

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => setFavourites((list) => (list.includes(slug) ? list.filter((s) => s !== slug) : [slug, ...list]))}
      className={`${pill} ${
        saved
          ? "border-rose-300/40 bg-rose-300/10 text-rose-600"
          : "border-ink/12 text-mist/70 hover:border-rose-300/40 hover:text-ink"
      }`}
    >
      <Heart className={`size-4 ${saved ? "fill-current" : ""}`} aria-hidden />
      {saved ? "Saved to My space" : "Save"}
    </button>
  );
}

export function ShareButton({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the visitor closed the share sheet */
    }
  }

  return (
    <button type="button" onClick={share} className={`${pill} border-ink/12 text-mist/70 hover:border-ink/25 hover:text-ink`}>
      <Share2 className="size-4" aria-hidden />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
