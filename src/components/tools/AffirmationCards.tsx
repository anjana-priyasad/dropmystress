"use client";

import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Shuffle } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button, Chip } from "@/components/ui";
import ListenButton from "@/components/ListenButton";
import { useSpeakOnChange } from "@/hooks/useVoice";

const AFFIRMATIONS = [
  "I don't have to have everything figured out to be okay.",
  "This feeling is temporary. I've felt this way before, and it passed.",
  "I can do hard things, one small step at a time.",
  "Rest is productive. I'm allowed to slow down.",
  "I am more than my worst day.",
  "It's okay to ask for help.",
  "I'm doing the best I can with what I have right now.",
  "I can't control everything, but I can control my next breath.",
  "My worth isn't measured by my productivity.",
  "I'm allowed to say no.",
  "Mistakes are how I learn, not proof that I'm failing.",
  "I've survived every difficult day so far.",
  "I can be a work in progress and still be enough.",
  "I choose to be as patient with myself as I'd be with a friend.",
  "Not every thought I have is true.",
  "Small progress is still progress.",
  "I'm allowed to feel what I feel.",
  "Today, I only need to do the next right thing.",
  "I can let go of what I can't change.",
  "I bring something good to the people around me.",
  "Peace doesn't mean no storms. It means I can find calm within them.",
  "I give myself permission to take up space.",
  "The pressure I feel doesn't define my ability.",
  "Tomorrow is a fresh start, and so is this moment.",
];

const NO_FAVOURITES: number[] = [];

export default function AffirmationCards() {
  const [order, setOrder] = useState(() => AFFIRMATIONS.map((_, i) => i));
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [favourites, setFavourites] = useLocalStorage("dms.affirmation-favourites", NO_FAVOURITES);

  const deck = favouritesOnly ? order.filter((i) => favourites.includes(i)) : order;
  const safePosition = deck.length ? position % deck.length : 0;
  const current = deck[safePosition];
  const isFavourite = current !== undefined && favourites.includes(current);
  const currentText = current === undefined ? null : AFFIRMATIONS[current];
  useSpeakOnChange(currentText);

  function go(step: number) {
    if (!deck.length) return;
    setDirection(step);
    setPosition((safePosition + step + deck.length) % deck.length);
  }

  function shuffle() {
    const next = [...order];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
    setPosition(0);
    setDirection(1);
  }

  function toggleFavourite() {
    if (current === undefined) return;
    setFavourites((prev) => (prev.includes(current) ? prev.filter((i) => i !== current) : [...prev, current]));
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -80) go(1);
    else if (info.offset.x > 80) go(-1);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-8">
      <div className="flex flex-wrap justify-center gap-2">
        <Chip selected={!favouritesOnly} onClick={() => { setFavouritesOnly(false); setPosition(0); }}>
          All cards
        </Chip>
        <Chip selected={favouritesOnly} onClick={() => { setFavouritesOnly(true); setPosition(0); }}>
          Favourites ({favourites.length})
        </Chip>
      </div>

      <div className="relative h-72 w-full">
        {/* A hint of the rest of the deck. */}
        <div aria-hidden className="absolute inset-x-6 top-3 bottom-[-0.75rem] rounded-3xl border border-mist/8 bg-dusk/40" />
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          {current === undefined ? (
            <motion.div key="empty" className="absolute inset-0 flex items-center justify-center rounded-3xl border border-mist/10 bg-dusk p-8 text-center text-mist/50">
              Tap “Save” on any card to keep it in your favourites.
            </motion.div>
          ) : (
            <motion.div
              key={current}
              custom={direction}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={onDragEnd}
              initial={{ opacity: 0, x: direction * 120, rotate: direction * 6 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: direction * -120, rotate: direction * -6 }}
              transition={{ type: "spring", damping: 22, stiffness: 180 }}
              className="absolute inset-0 flex cursor-grab items-center justify-center rounded-3xl border border-lavender/20 bg-gradient-to-br from-dusk via-dusk to-lavender/10 p-8 text-center shadow-2xl shadow-black/40 active:cursor-grabbing"
            >
              <p className="font-serif text-2xl leading-snug text-white/90 sm:text-3xl" aria-live="polite">
                {AFFIRMATIONS[current]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="ghost" onClick={() => go(-1)} aria-label="Previous card" disabled={deck.length < 2}>
          <ChevronLeft className="size-5" />
        </Button>
        <Button onClick={toggleFavourite} aria-pressed={isFavourite} disabled={current === undefined}>
          <Heart className={`size-4 ${isFavourite ? "fill-rose-400 text-rose-400" : ""}`} />
          {isFavourite ? "Saved" : "Save"}
        </Button>
        {currentText && <ListenButton text={currentText} />}
        <Button onClick={shuffle} disabled={favouritesOnly}>
          <Shuffle className="size-4" /> Shuffle
        </Button>
        <Button variant="ghost" onClick={() => go(1)} aria-label="Next card" disabled={deck.length < 2}>
          <ChevronRight className="size-5" />
        </Button>
      </div>
      <p className="text-sm text-mist/40 tabular-nums">
        {deck.length ? `${safePosition + 1} / ${deck.length}` : "No favourites yet"} · swipe or use the arrows
      </p>
    </div>
  );
}
