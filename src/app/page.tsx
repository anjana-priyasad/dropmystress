"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowDown, ArrowRight, RotateCcw } from "lucide-react";
import VentBox from "@/components/VentBox";
import ReleaseAnimation from "@/components/ReleaseAnimation";
import EmpathyMessage from "@/components/EmpathyMessage";
import BreathingBubble from "@/components/BreathingBubble";
import SoundToggle from "@/components/SoundToggle";
import VoiceToggle from "@/components/VoiceToggle";
import { speak, stopSpeaking } from "@/lib/voice";
import WallOfHope from "@/components/WallOfHope";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ToolCard from "@/components/ToolCard";
import { TOOLS, getTool } from "@/lib/tools";
import { createBurnScene, type BurnScene } from "@/lib/burn-scene";
import { fetchEmpathyMessage } from "@/lib/empathy-client";

type Phase = "vent" | "releasing" | "released";

const AFTER_RELEASE_SLUGS = ["grounding", "worry-sorter", "soundscapes"];
const FEATURED_SLUGS = ["breathing", "brain-dump", "unsent-letter", "bubble-wrap", "mood-tracker", "sand-garden"];
const pick = (slugs: string[]) => slugs.map((slug) => getTool(slug)).filter((t) => t !== undefined);

export default function Home() {
  const [phase, setPhase] = useState<Phase>("vent");
  const [text, setText] = useState("");
  const [scene, setScene] = useState<BurnScene | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const pendingRequest = useRef<AbortController | null>(null);

  // Read the comforting message aloud once it's on screen.
  useEffect(() => {
    if (phase === "released" && message) void speak(message);
  }, [phase, message]);

  function handleRelease() {
    const vent = text.trim();
    if (!vent) return;

    // Ask for the empathy message now so it's ready when the flames die down.
    pendingRequest.current?.abort();
    const controller = new AbortController();
    pendingRequest.current = controller;
    setMessage(null);
    fetchEmpathyMessage(vent, controller.signal)
      .then(setMessage)
      .catch(() => {
        /* aborted because the user started over */
      });

    setScene(createBurnScene(text));
    setText(""); // the words are gone the moment they hit the fire
    setPhase("releasing");
  }

  function handleBurnComplete() {
    setScene(null);
    setPhase("released");
  }

  function ventAgain() {
    stopSpeaking();
    pendingRequest.current?.abort();
    setMessage(null);
    setPhase("vent");
  }

  return (
    <main className="relative overflow-x-hidden">
      <BackgroundGlow />

      <section className="relative flex min-h-dvh flex-col px-5 py-6 sm:px-8">
        <SiteHeader>
          <VoiceToggle />
          <SoundToggle />
        </SiteHeader>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-10">
          <AnimatePresence mode="wait">
            {phase === "vent" && (
              <motion.div
                key="vent"
                className="flex flex-col gap-8"
                exit={{ opacity: 0, transition: { duration: 0.01 } }}
              >
                <motion.h1
                  className="text-center font-serif text-3xl text-white/85 sm:text-4xl"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  Put it down here.
                </motion.h1>
                <VentBox value={text} onChange={setText} onRelease={handleRelease} />
              </motion.div>
            )}

            {phase === "releasing" && scene && (
              <motion.div
                key="releasing"
                className="flex flex-col gap-8"
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
              >
                <motion.p
                  className="text-center font-serif text-3xl text-white/60 italic sm:text-4xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 3, times: [0, 0.2, 0.7, 1] }}
                >
                  Letting it go…
                </motion.p>
                <ReleaseAnimation scene={scene} onComplete={handleBurnComplete} />
                {/* Holds the space of the vent box's button row so the box doesn't jump. */}
                <div aria-hidden className="h-[4.5rem]" />
              </motion.div>
            )}

            {phase === "released" && (
              <motion.div
                key="released"
                className="flex flex-col items-center gap-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <EmpathyMessage message={message} />

                <motion.div
                  className="flex flex-col items-center gap-10"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
                >
                  <BreathingBubble />

                  <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                    <button
                      type="button"
                      onClick={ventAgain}
                      className="inline-flex items-center gap-2 rounded-full border border-mist/10 px-4 py-2 text-mist/60 transition-colors hover:border-mist/25 hover:text-mist focus-visible:outline-2 focus-visible:outline-calm/60"
                    >
                      <RotateCcw className="size-4" />
                      Let go of something else
                    </button>
                    <a
                      href="#more-tools"
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-mist/50 transition-colors hover:text-mist focus-visible:outline-2 focus-visible:outline-calm/60"
                    >
                      <ArrowDown className="size-4" />
                      More ways to unwind
                    </a>
                  </div>

                  <div className="w-full">
                    <p className="mb-3 text-center text-sm text-mist/45">Still feeling it? Try one of these next.</p>
                    <ul className="grid gap-3 sm:grid-cols-3">
                      {pick(AFTER_RELEASE_SLUGS).map((tool) => (
                        <li key={tool.slug}>
                          <ToolCard tool={tool} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section id="more-tools" aria-labelledby="more-tools-title" className="mx-auto w-full max-w-5xl scroll-mt-8 px-6 pt-24">
        <div className="mb-10 text-center">
          <h2 id="more-tools-title" className="mb-3 font-serif text-3xl text-white/85">
            {TOOLS.length} tools for calmer days
          </h2>
          <p className="mx-auto max-w-lg text-mist/55">
            Breathe, ground yourself, sort your thoughts, or just pop some bubble wrap. Private, free, and no sign-up.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pick(FEATURED_SLUGS).map((tool) => (
            <li key={tool.slug}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 rounded-full border border-mist/15 px-5 py-2.5 text-mist/80 transition-colors hover:border-mist/30 hover:text-white"
          >
            See all {TOOLS.length} tools <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <WallOfHope />

      <SiteFooter />
    </main>
  );
}

function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-lavender/[0.06] blur-3xl" />
      <div className="absolute -bottom-52 -left-32 size-[36rem] rounded-full bg-calm/[0.05] blur-3xl" />
    </div>
  );
}
