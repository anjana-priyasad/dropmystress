"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Heart, Search } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { FAVOURITES_KEY, NO_RECENT, NO_SLUGS, RECENT_KEY } from "@/lib/activity";
import { CATEGORIES, TOOLS, getTool, type Tool, type ToolCategory } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import { Chip, EmptyState } from "@/components/ui";

const CATEGORY_IDS = Object.keys(CATEGORIES) as ToolCategory[];

export default function ToolsDirectory() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const [favouriteSlugs] = useLocalStorage(FAVOURITES_KEY, NO_SLUGS);
  const [recent] = useLocalStorage(RECENT_KEY, NO_RECENT);
  const favourites = toTools(favouriteSlugs);
  const recentTools = toTools(recent.map((r) => r.slug)).slice(0, 4);

  const q = query.trim().toLowerCase();
  const matches = TOOLS.filter(
    (t) =>
      (category === "all" || t.category === category) &&
      (!q || `${t.name} ${t.tagline} ${t.description} ${t.keywords}`.toLowerCase().includes(q)),
  );

  return (
    <div className="flex flex-col gap-8">
      {(favourites.length > 0 || recentTools.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {favourites.length > 0 && <ShortcutRow icon={Heart} title="Your favourites" tools={favourites.slice(0, 4)} />}
          {recentTools.length > 0 && <ShortcutRow icon={Clock} title="Recently used" tools={recentTools} />}
        </div>
      )}
      <div className="glass flex flex-col gap-4 rounded-[2rem] p-4 sm:p-5">
        <div className="relative mx-auto w-full max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-mist/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools — e.g. sleep, anxious, work"
            aria-label="Search tools"
            className="w-full rounded-full border border-ink/10 bg-canvas/50 py-3 pr-4 pl-11 text-ink outline-none placeholder:text-mist/35 focus:border-calm/40"
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

const toTools = (slugs: string[]) => slugs.map((slug) => getTool(slug)).filter((t): t is Tool => t !== undefined);

function ShortcutRow({ icon: Icon, title, tools }: { icon: typeof Heart; title: string; tools: Tool[] }) {
  return (
    <section className="glass rounded-[2rem] p-4 sm:p-5" aria-label={title}>
      <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-medium text-ink">
        <Icon className="size-4 text-rose-500" aria-hidden /> {title}
      </h2>
      <ul className="grid grid-cols-2 gap-2">
        {tools.map((tool) => {
          const ToolIcon = tool.icon;
          const cat = CATEGORIES[tool.category];
          return (
            <li key={tool.slug}>
              <Link
                href={`/tools/${tool.slug}`}
                className="flex items-center gap-2.5 rounded-2xl bg-ink/[0.03] px-3 py-2.5 text-sm text-mist/85 ring-1 ring-ink/5 transition-colors hover:bg-ink/[0.07] hover:text-ink"
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${cat.iconBg}`}>
                  <ToolIcon className={`size-4 ${cat.accent}`} aria-hidden />
                </span>
                <span className="truncate">{tool.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
