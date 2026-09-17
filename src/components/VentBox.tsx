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
        className={`${VENT_SURFACE_CLASS} resize-none shadow-[0_30px_70px_-35px_rgba(31,64,80,0.35),inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-[border-color,box-shadow] placeholder:text-mist/35 focus:border-calm/35 focus:shadow-[0_0_0_5px_rgba(31,127,113,0.12),0_30px_70px_-35px_rgba(31,64,80,0.35)]`}
      />

      <div className="flex flex-col items-center gap-3">
        <motion.button
          type="submit"
          disabled={!canRelease}
          whileHover={canRelease ? { scale: 1.03 } : undefined}
          whileTap={canRelease ? { scale: 0.97 } : undefined}
          className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_12px_40px_-10px] shadow-orange-500/50 transition-[opacity,box-shadow] hover:shadow-orange-500/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <Flame className="size-5 transition-transform group-enabled:group-hover:-rotate-12" />
          Burn my stress
        </motion.button>
        <p className="text-xs text-mist/45">
          or press <kbd className="font-sans">⌘</kbd>/<kbd className="font-sans">Ctrl</kbd> + Enter
        </p>
      </div>
    </motion.form>
  );
}
