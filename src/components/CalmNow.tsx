"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Anchor, LifeBuoy, Phone, Waves, X } from "lucide-react";
import BreathingBubble, { RESTING_SCALE, type BreathPhase } from "@/components/BreathingBubble";
import { stopSpeaking } from "@/lib/voice";

/** A longer out-breath than in-breath is the quickest way to settle a racing body. */
const CALMING_BREATH: BreathPhase[] = [
  { label: "Breathe in", seconds: 4, scale: 1 },
  { label: "Breathe out slowly", seconds: 6, scale: RESTING_SCALE },
];

const GROUNDING = [
  "Press your feet into the floor. Notice the ground holding you.",
  "Name 3 things you can see right now.",
  "Unclench your jaw and drop your shoulders.",
  "Remind yourself: this feeling is a wave. It will pass.",
];

export default function CalmNow() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      stopSpeaking();
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        aria-haspopup="dialog"
        aria-label="Calm now"
        className="group fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-calm to-lavender p-3 font-medium text-white sm:py-3 sm:pr-5 sm:pl-3 shadow-[0_10px_40px_-8px] shadow-calm/50 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calm sm:right-6 sm:bottom-6"
      >
        <span className="relative flex size-7 items-center justify-center rounded-full bg-white/20">
          <span aria-hidden className="ripple absolute inset-0 rounded-full border border-white/60" />
          <Waves className="size-4" aria-hidden />
        </span>
        <span className="hidden sm:inline">Calm now</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] overflow-y-auto bg-canvas/70 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="calm-now-title"
              tabIndex={-1}
              className="glass relative mx-auto my-6 w-[calc(100%-2rem)] max-w-2xl rounded-[2rem] p-6 outline-none sm:my-12 sm:p-10"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full text-mist/60 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="size-5" />
              </button>

              <p className="mb-2 text-center text-xs tracking-[0.25em] text-calm uppercase">One minute, just for you</p>
              <h2 id="calm-now-title" className="text-center font-serif text-3xl text-ink sm:text-4xl">
                You&apos;re safe. Let&apos;s slow down.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-center text-mist/70">
                Tap the circle and follow it: in for 4, out for 6. Do it five or six times.
              </p>

              <div className="my-4 flex justify-center">
                <BreathingBubble phases={CALMING_BREATH} />
              </div>

              <div className="rounded-3xl bg-ink/[0.03] p-5 ring-1 ring-ink/8">
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
                  <Anchor className="size-4 text-lavender" aria-hidden /> While you breathe
                </p>
                <ul className="grid gap-2 text-sm text-mist/75 sm:grid-cols-2">
                  {GROUNDING.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-calm/70" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-col items-center gap-3 rounded-3xl border border-rose-300/20 bg-rose-400/[0.06] p-5 text-center sm:flex-row sm:text-left">
                <LifeBuoy className="size-6 shrink-0 text-rose-500" aria-hidden />
                <p className="flex-1 text-sm text-mist/75">
                  Thinking about hurting yourself, or feel unsafe? Please talk to a real person now.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <a
                    href="tel:1926"
                    className="inline-flex items-center gap-1.5 rounded-full bg-rose-300/15 px-3.5 py-2 text-sm font-medium text-rose-600 hover:bg-rose-300/25"
                  >
                    <Phone className="size-3.5" aria-hidden /> 1926 (LK)
                  </a>
                  <Link
                    href="/help"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center rounded-full border border-ink/12 px-3.5 py-2 text-sm text-mist/85 hover:text-ink"
                  >
                    All helplines
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
