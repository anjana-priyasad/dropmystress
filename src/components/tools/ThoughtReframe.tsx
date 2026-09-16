"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button, FieldLabel, ProgressBar, inputClass } from "@/components/ui";
import ListenButton from "@/components/ListenButton";
import { useSpeakOnChange } from "@/hooks/useVoice";

const STEP_SPEECH = [
  "What happened? Briefly describe the situation. Just the facts: who, what, and where.",
  "What went through your mind? Write down the thought that stings the most. Then, how much do you believe it right now?",
  "Minds under stress fall into predictable patterns. Do any of these thinking traps fit your thought? Pick as many as you like, or none.",
  "Let's look at the evidence. On one side, write the facts that support the thought. On the other, the facts that don't fit it.",
  "Now, write a more balanced thought. Ask yourself: what would I tell a friend who had this thought? What's the most likely outcome, not the worst?",
];

const THINKING_TRAPS = [
  { name: "All-or-nothing", hint: "Seeing things as total success or total failure." },
  { name: "Catastrophizing", hint: "Jumping to the worst possible outcome." },
  { name: "Mind reading", hint: "Assuming you know what others think of you." },
  { name: "Fortune telling", hint: "Predicting things will go badly." },
  { name: "Overgeneralizing", hint: "“This always happens.” “I never get it right.”" },
  { name: "Should statements", hint: "Rigid rules about how you or others must be." },
  { name: "Labeling", hint: "“I'm a failure” instead of “I made a mistake.”" },
  { name: "Emotional reasoning", hint: "“I feel it, so it must be true.”" },
  { name: "Discounting positives", hint: "Brushing off what went well." },
  { name: "Personalizing", hint: "Blaming yourself for things outside your control." },
];

type ThoughtRecord = {
  situation: string;
  thought: string;
  beliefBefore: number;
  traps: string[];
  evidenceFor: string;
  evidenceAgainst: string;
  balanced: string;
  beliefAfter: number;
};

const EMPTY: ThoughtRecord = {
  situation: "",
  thought: "",
  beliefBefore: 80,
  traps: [],
  evidenceFor: "",
  evidenceAgainst: "",
  balanced: "",
  beliefAfter: 50,
};

const STEP_TITLES = ["What happened?", "The thought", "Thinking traps", "Look at the evidence", "A balanced view"];

function Slider({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <FieldLabel htmlFor={id}>
        {label} <span className="ml-1 font-medium text-white tabular-nums">{value}%</span>
      </FieldLabel>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-calm"
      />
    </div>
  );
}

export default function ThoughtReframe() {
  const [step, setStep] = useState(0);
  const [record, setRecord] = useState<ThoughtRecord>(EMPTY);
  const set = <K extends keyof ThoughtRecord>(key: K, value: ThoughtRecord[K]) => setRecord((r) => ({ ...r, [key]: value }));

  const finished = step === STEP_TITLES.length;
  const speech = finished
    ? `Here's your reframe. ${record.balanced}. Your belief in the original thought went from ${record.beliefBefore} to ${record.beliefAfter} percent.`
    : STEP_SPEECH[step];
  useSpeakOnChange(speech);
  const canContinue =
    (step === 0 && record.situation.trim()) ||
    (step === 1 && record.thought.trim()) ||
    step === 2 ||
    step === 3 ||
    (step === 4 && record.balanced.trim());

  function toggleTrap(name: string) {
    set("traps", record.traps.includes(name) ? record.traps.filter((t) => t !== name) : [...record.traps, name]);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      {!finished && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-xs tracking-widest text-mist/40 uppercase">
            <span>
              Step {step + 1} of {STEP_TITLES.length}
            </span>
            <span>{STEP_TITLES[step]}</span>
          </div>
          <ListenButton text={speech} className="self-start" />
          <ProgressBar value={step / STEP_TITLES.length} label="Thought record progress" />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-5"
        >
          {step === 0 && (
            <div>
              <FieldLabel htmlFor="situation">Briefly describe the situation. Just the facts — who, what, where.</FieldLabel>
              <textarea
                id="situation"
                rows={4}
                autoFocus
                value={record.situation}
                onChange={(e) => set("situation", e.target.value)}
                placeholder="e.g. My manager asked to “have a quick chat” tomorrow morning."
                className={inputClass}
              />
            </div>
          )}

          {step === 1 && (
            <>
              <div>
                <FieldLabel htmlFor="thought">What went through your mind? What&apos;s the thought that stings most?</FieldLabel>
                <textarea
                  id="thought"
                  rows={3}
                  autoFocus
                  value={record.thought}
                  onChange={(e) => set("thought", e.target.value)}
                  placeholder="e.g. I'm going to get fired."
                  className={inputClass}
                />
              </div>
              <Slider id="belief-before" label="How much do you believe it right now?" value={record.beliefBefore} onChange={(v) => set("beliefBefore", v)} />
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-mist/70">
                Minds under stress fall into predictable patterns. Do any of these fit your thought? Pick as many as you like — or none.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {THINKING_TRAPS.map((trap) => {
                  const selected = record.traps.includes(trap.name);
                  return (
                    <button
                      key={trap.name}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleTrap(trap.name)}
                      className={`rounded-2xl border p-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-calm/70 ${
                        selected ? "border-lavender/50 bg-lavender/10" : "border-mist/10 hover:border-mist/25"
                      }`}
                    >
                      <span className="block font-medium text-white/90">{trap.name}</span>
                      <span className="block text-sm text-mist/55">{trap.hint}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="evidence-for">Facts that support the thought</FieldLabel>
                <textarea
                  id="evidence-for"
                  rows={6}
                  autoFocus
                  value={record.evidenceFor}
                  onChange={(e) => set("evidenceFor", e.target.value)}
                  placeholder="Only things you know for sure."
                  className={inputClass}
                />
              </div>
              <div>
                <FieldLabel htmlFor="evidence-against">Facts that don&apos;t fit the thought</FieldLabel>
                <textarea
                  id="evidence-against"
                  rows={6}
                  value={record.evidenceAgainst}
                  onChange={(e) => set("evidenceAgainst", e.target.value)}
                  placeholder="e.g. My last review was positive. Managers have quick chats for lots of reasons."
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <>
              <div className="rounded-2xl border border-mist/10 bg-night/40 p-4 text-sm text-mist/60">
                <p className="mb-1 text-mist/80">Questions that can help:</p>
                <ul className="list-inside list-disc space-y-0.5">
                  <li>What would I tell a friend who had this thought?</li>
                  <li>What&apos;s the most likely outcome — not the worst or the best?</li>
                  <li>Will this matter in a week? A year?</li>
                </ul>
              </div>
              <div>
                <FieldLabel htmlFor="balanced">Write a more balanced thought</FieldLabel>
                <textarea
                  id="balanced"
                  rows={3}
                  autoFocus
                  value={record.balanced}
                  onChange={(e) => set("balanced", e.target.value)}
                  placeholder="e.g. I don't know what the chat is about. Even if it's feedback, I can handle it."
                  className={inputClass}
                />
              </div>
              <Slider id="belief-after" label="Now, how much do you believe the original thought?" value={record.beliefAfter} onChange={(v) => set("beliefAfter", v)} />
            </>
          )}

          {finished && (
            <div className="flex flex-col gap-6">
              <h3 className="text-center font-serif text-2xl text-white/90">Your reframe</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-mist/10 p-5">
                  <p className="mb-2 text-xs tracking-widest text-mist/40 uppercase">Original thought</p>
                  <p className="text-mist/70 line-through decoration-mist/30">{record.thought}</p>
                </div>
                <div className="rounded-2xl border border-calm/30 bg-calm/5 p-5">
                  <p className="mb-2 text-xs tracking-widest text-calm/70 uppercase">Balanced thought</p>
                  <p className="text-white/90">{record.balanced}</p>
                </div>
              </div>
              <p className="text-center text-mist/70">
                Belief in the original thought:{" "}
                <span className="tabular-nums text-white">{record.beliefBefore}%</span> →{" "}
                <span className="tabular-nums text-calm">{record.beliefAfter}%</span>
                {record.beliefAfter < record.beliefBefore && " — that's real progress."}
              </p>
              {record.traps.length > 0 && (
                <p className="text-center text-sm text-mist/50">Thinking traps spotted: {record.traps.join(", ")}</p>
              )}
              <p className="text-center text-xs text-mist/40">Nothing here is saved. It disappears when you leave.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        {finished ? (
          <Button
            className="mx-auto"
            onClick={() => {
              setRecord(EMPTY);
              setStep(0);
            }}
          >
            <RotateCcw className="size-4" /> Reframe another thought
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canContinue}>
              {step === STEP_TITLES.length - 1 ? "See my reframe" : "Next"} <ArrowRight className="size-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
