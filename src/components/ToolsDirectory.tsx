"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { CATEGORIES, TOOLS, type ToolCategory } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import { Chip, EmptyState } from "@/components/ui";

const CATEGORY_IDS = Object.keys(CATEGORIES) as ToolCategory[];

export default function ToolsDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");

  const q = query.trim().toLowerCase();
  const matches = TOOLS.filter(
    (t) =>
      (category === "all" || t.category === category) &&
      (!q || `${t.name} ${t.tagline} ${t.description} ${t.keywords}`.toLowerCase().includes(q)),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="relative mx-auto w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-mist/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools — e.g. sleep, anxious, work"
            aria-label="Search tools"
            className="w-full rounded-full border border-mist/12 bg-dusk/60 py-3 pr-4 pl-11 text-slate-100 outline-none placeholder:text-mist/35 focus:border-calm/40"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filter by category">
          <Chip selected={category === "all"} onClick={() => setCategory("all")}>
            All ({TOOLS.length})
          </Chip>
          {CATEGORY_IDS.map((id) => (
            <Chip key={id} selected={category === id} onClick={() => setCategory(id)}>
              {CATEGORIES[id].label}
            </Chip>
          ))}
        </div>
      </div>

      {matches.length === 0 ? (
        <EmptyState>No tools match that. Try a different word.</EmptyState>
      ) : (
        <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false} mode="popLayout">
            {matches.map((tool) => (
              <motion.li
                key={tool.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <ToolCard tool={tool} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
