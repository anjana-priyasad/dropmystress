import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES, type Tool } from "@/lib/tools";

export default function ToolCard({ tool, compact = false }: { tool: Tool; compact?: boolean }) {
  const category = CATEGORIES[tool.category];
  const Icon = tool.icon;
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={`glass group relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-ink/[0.06] focus-visible:outline-2 focus-visible:outline-calm/70 ${category.ring}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-90 ${category.glow}`}
      />
      <div className="relative flex items-center justify-between">
        <span className={`flex size-11 items-center justify-center rounded-2xl ring-1 ring-ink/10 ${category.iconBg}`}>
          <Icon className={`size-5 ${category.accent}`} aria-hidden />
        </span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-mist/60">{tool.duration}</span>
          <ArrowUpRight
            className="size-4 text-mist/30 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
            aria-hidden
          />
        </span>
      </div>
      <div className="relative">
        <h3 className="mb-1 font-medium text-ink">{tool.name}</h3>
        {!compact && <p className="text-sm leading-relaxed text-mist/60">{tool.tagline}</p>}
      </div>
    </Link>
  );
}
