import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import Logo from "@/components/Logo";
import { TOOLS } from "@/lib/tools";

const POPULAR = ["breathing", "grounding", "brain-dump", "journal", "soundscapes", "bubble-wrap"];

const EXPLORE = [
  { href: "/tools", label: `All ${TOOLS.length} tools` },
  { href: "/me", label: "My space" },
  { href: "/help", label: "Get help now" },
  { href: "/privacy", label: "Privacy" },
] as const;

export default function SiteFooter() {
  const popular = POPULAR.map((slug) => TOOLS.find((t) => t.slug === slug)).filter((t) => t !== undefined);

  return (
    <footer className="px-4 pt-24 pb-28 sm:px-6">
      <div className="glass mx-auto max-w-6xl rounded-[2.5rem] p-8 sm:p-12">
        <div className="grid gap-10 text-sm sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs leading-relaxed text-mist/60">
              A quiet corner of the internet to vent anonymously, let it go, and breathe. {TOOLS.length} free, private
              stress-relief tools.
            </p>
            <Link
              href="/help"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-rose-300/25 bg-rose-400/[0.07] px-4 py-2 text-rose-600 transition-colors hover:bg-rose-400/15"
            >
              <LifeBuoy className="size-4" aria-hidden /> In crisis? Get help now
            </Link>
          </div>
          <nav aria-label="Popular tools">
            <p className="mb-4 text-xs tracking-[0.2em] text-mist/45 uppercase">Popular tools</p>
            <ul className="flex flex-col gap-2.5">
              {popular.map((tool) => (
                <li key={tool.slug}>
                  <Link href={`/tools/${tool.slug}`} className="text-mist/70 transition-colors hover:text-ink">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Site">
            <p className="mb-4 text-xs tracking-[0.2em] text-mist/45 uppercase">Explore</p>
            <ul className="flex flex-col gap-2.5">
              {EXPLORE.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-mist/70 transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-ink/8 pt-6 text-xs leading-relaxed text-mist/45 sm:flex-row sm:justify-between">
          <p>DropMyStress is a place to breathe, not a substitute for professional care.</p>
          <p>Made with care · free forever</p>
        </div>
      </div>
    </footer>
  );
}
