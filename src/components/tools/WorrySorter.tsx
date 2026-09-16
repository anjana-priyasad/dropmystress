"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Feather, HelpCircle, ListChecks, X } from "lucide-react";
import { createId, useLocalStorage } from "@/hooks/useLocalStorage";
import { Button, EmptyState, FieldLabel, inputClass } from "@/components/ui";
import ListenButton from "@/components/ListenButton";
import { useSpeakOnChange } from "@/hooks/useVoice";

const STAGE_SPEECH: Record<Stage, string> = {
  write: "What are you worried about? Write it down, then we'll sort it together.",
  ask: "Is there anything you can do about this?",
  partly:
    "Let's split it in two. Most worries have a piece you can influence, and a piece you can't. Focus only on the part that's yours, even if it's tiny.",
  plan: "What's one small step you could take? Make it small enough to do in the next day or two.",
  released:
    "Then it's not yours to carry. Worrying about it won't change it. When it comes back, and it might, gently remind yourself: I already set this down.",
  planned: "You have a plan. Now that it's written down, you don't need to keep rehearsing it in your head.",
};

type ActionItem = { id: string; worry: string; step: string; done: boolean };
type Stage = "write" | "ask" | "plan" | "partly" | "released" | "planned";

const NO_ACTIONS: ActionItem[] = [];

export default function WorrySorter() {
  const [stage, setStage] = useState<Stage>("write");
  const [worry, setWorry] = useState("");
  const [step, setStep] = useState("");
  const [actions, setActions] = useLocalStorage("dms.worry-actions", NO_ACTIONS);
  const [released, setReleased] = useLocalStorage("dms.worries-released", 0);
  useSpeakOnChange(STAGE_SPEECH[stage]);

  function reset() {
    setWorry("");
    setStep("");
    setStage("write");
  }

  function savePlan() {
    setActions((prev) => [{ id: createId(), worry: worry.trim(), step: step.trim(), done: false }, ...prev]);
    setStage("planned");
  }

  function letGo() {
    setReleased((n) => n + 1);
    setStage("released");
  }

  const fade = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.35 },
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <div className="min-h-64">
        <ListenButton text={STAGE_SPEECH[stage]} className="mb-4" />
        <AnimatePresence mode="wait">
          {stage === "write" && (
            <motion.form
              key="write"
              {...fade}
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (worry.trim()) setStage("ask");
              }}
            >
              <FieldLabel htmlFor="worry">What are you worried about?</FieldLabel>
              <textarea
                id="worry"
                rows={3}
                autoFocus
                value={worry}
                onChange={(e) => setWorry(e.target.value)}
                placeholder="e.g. I won't finish the project before the deadline."
                className={inputClass}
              />
              <Button type="submit" variant="primary" className="self-end" disabled={!worry.trim()}>
                Sort this worry
              </Button>
            </motion.form>
          )}

          {stage === "ask" && (
            <motion.div key="ask" {...fade} className="flex flex-col items-center gap-6 text-center">
              <p className="max-w-lg rounded-2xl border border-mist/10 bg-night/40 px-5 py-3 text-mist/70 italic">“{worry}”</p>
              <h3 className="font-serif text-2xl text-white/90">Is there anything you can do about this?</h3>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="primary" onClick={() => setStage("plan")}>
                  <Check className="size-4" /> Yes, something
                </Button>
                <Button onClick={() => setStage("partly")}>
                  <HelpCircle className="size-4" /> Partly / not sure
                </Button>
                <Button onClick={letGo}>
                  <X className="size-4" /> No, it&apos;s out of my hands
                </Button>
              </div>
            </motion.div>
          )}

          {stage === "partly" && (
            <motion.div key="partly" {...fade} className="flex flex-col items-center gap-6 text-center">
              <h3 className="font-serif text-2xl text-white/90">Split it in two</h3>
              <p className="max-w-lg text-mist/70">
                Most worries have a piece you can influence and a piece you can&apos;t. Focus only on the part that&apos;s
                yours — even if it&apos;s tiny, like asking a question or preparing a little.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="primary" onClick={() => setStage("plan")}>
                  Plan for my part
                </Button>
                <Button onClick={letGo}>Let the rest go</Button>
              </div>
            </motion.div>
          )}

          {stage === "plan" && (
            <motion.form
              key="plan"
              {...fade}
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (step.trim()) savePlan();
              }}
            >
              <h3 className="font-serif text-2xl text-white/90">What&apos;s one small step you could take?</h3>
              <p className="text-mist/60">Make it small enough to do in the next day or two.</p>
              <input
                autoFocus
                value={step}
                onChange={(e) => setStep(e.target.value)}
                placeholder="e.g. Email my manager tomorrow at 10am to agree on priorities."
                aria-label="Your next small step"
                className={inputClass}
              />
              <Button type="submit" variant="primary" className="self-end" disabled={!step.trim()}>
                Add to my action list
              </Button>
            </motion.form>
          )}

          {stage === "released" && (
            <motion.div key="released" {...fade} className="relative flex flex-col items-center gap-5 text-center">
              <motion.div
                initial={{ y: 0, opacity: 1, rotate: 0 }}
                animate={{ y: -120, opacity: 0, rotate: -12 }}
                transition={{ duration: 2.2, ease: "easeIn" }}
                className="rounded-2xl border border-mist/15 bg-night/60 px-5 py-3 text-mist/70 italic"
                aria-hidden
              >
                “{worry}”
              </motion.div>
              <Feather className="size-7 text-calm/70" aria-hidden />
              <h3 className="font-serif text-2xl text-white/90">Then it&apos;s not yours to carry.</h3>
              <p className="max-w-md text-mist/65">
                Worrying about it won&apos;t change it. When it comes back, and it might, notice it, and gently remind
                yourself: I already set this down.
              </p>
              <Button onClick={reset}>Sort another worry</Button>
            </motion.div>
          )}

          {stage === "planned" && (
            <motion.div key="planned" {...fade} className="flex flex-col items-center gap-5 text-center">
              <ListChecks className="size-7 text-calm/70" aria-hidden />
              <h3 className="font-serif text-2xl text-white/90">You have a plan.</h3>
              <p className="max-w-md text-mist/65">
                Now that it&apos;s written down, you don&apos;t need to keep rehearsing it in your head.
              </p>
              <Button onClick={reset}>Sort another worry</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section aria-labelledby="action-list" className="border-t border-mist/10 pt-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 id="action-list" className="font-serif text-xl text-white/85">
            My action steps
          </h3>
          <span className="text-sm text-mist/45 tabular-nums">{released} {released === 1 ? "worry" : "worries"} let go</span>
        </div>
        {actions.length === 0 ? (
          <EmptyState>Steps you plan will appear here. They&apos;re saved only in this browser.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {actions.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-2xl border border-mist/10 p-3.5">
                <input
                  type="checkbox"
                  checked={a.done}
                  onChange={() => setActions((prev) => prev.map((x) => (x.id === a.id ? { ...x, done: !x.done } : x)))}
                  aria-label={`Mark "${a.step}" as done`}
                  className="mt-1 size-4 accent-calm"
                />
                <div className="min-w-0 flex-1">
                  <p className={a.done ? "text-mist/40 line-through" : "text-white/90"}>{a.step}</p>
                  <p className="truncate text-xs text-mist/40">For: {a.worry}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActions((prev) => prev.filter((x) => x.id !== a.id))}
                  aria-label={`Remove "${a.step}"`}
                  className="rounded-full p-1 text-mist/35 hover:text-mist"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
