"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function EmpathyMessage({ message }: { message: string | null }) {
  return (
    <div className="flex min-h-28 items-center justify-center px-2" aria-live="polite">
      <AnimatePresence mode="wait">
        {message ? (
          <motion.p
            key="message"
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-xl text-center font-serif text-2xl leading-snug text-white/90 italic sm:text-3xl"
          >
            {message}
          </motion.p>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-2"
            role="status"
            aria-label="Finding the right words"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-2 rounded-full bg-calm/60"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
