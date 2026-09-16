import Link from "next/link";
import { CATEGORIES, type Tool } from "@/lib/tools";

export default function ToolCard({ tool }: { tool: Tool }) {
  const category = CATEGORIES[tool.category];
  const Icon = tool.icon;
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex h-full flex-col gap-4 rounded-2xl border border-mist/8 bg-dusk/50 p-5 transition-all hover:-translate-y-0.5 hover:border-mist/20 hover:bg-dusk focus-visible:outline-2 focus-visible:outline-calm/70"
    >
      <div className="flex items-center justify-between">
        <span className={`flex size-10 items-center justify-center rounded-xl ${category.iconBg}`}>
          <Icon className={`size-5 ${category.accent}`} aria-hidden />
        </span>
        <span className="text-xs text-mist/40">{tool.duration}</span>
      </div>
      <div>
        <h3 className="mb-1 font-medium text-white/90 group-hover:text-white">{tool.name}</h3>
        <p className="text-sm leading-relaxed text-mist/55">{tool.tagline}</p>
      </div>
    </Link>
  );
}
