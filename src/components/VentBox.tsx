"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { VENT_SURFACE_CLASS } from "@/lib/vent-surface";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onRelease: () => void;
};

export default function VentBox({ value, onChange, onRelease }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canRelease = value.trim().length > 0;

  useEffect(() => {
    textareaRef.current?.focus({ preventScroll: true });
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canRelease) {
      e.preventDefault();
      onRelease();
    }
  }

  return (
    <motion.form
      className="flex w-full flex-col items-center gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onSubmit={(e) => {
        e.preventDefault();
        if (canRelease) onRelease();
      }}
    >
      <label htmlFor="vent" className="sr-only">
        What&apos;s weighing on you?
      </label>
      <textarea
        id="vent"
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={5000}
        spellCheck={false}
        placeholder="What's weighing on you? Let it all out. Nothing you write here is saved."
        className={`${VENT_SURFACE_CLASS} resize-none shadow-2xl shadow-black/40 outline-none transition-colors placeholder:text-mist/30 focus:border-calm/30`}
      />

      <div className="flex flex-col items-center gap-3">
        <motion.button
          type="submit"
          disabled={!canRelease}
          whileHover={canRelease ? { scale: 1.03 } : undefined}
          whileTap={canRelease ? { scale: 0.97 } : undefined}
          className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-400/90 to-rose-400/90 px-7 py-3.5 font-medium text-night shadow-lg shadow-orange-500/20 transition-[opacity,box-shadow] hover:shadow-orange-500/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
        >
          <Flame className="size-5 transition-transform group-enabled:group-hover:-rotate-12" />
          Burn my stress
        </motion.button>
        <p className="text-xs text-mist/35">
          or press <kbd className="font-sans">⌘</kbd>/<kbd className="font-sans">Ctrl</kbd> + Enter
        </p>
      </div>
    </motion.form>
  );
}
