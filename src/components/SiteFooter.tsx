import Link from "next/link";
import { TOOLS } from "@/lib/tools";

const POPULAR = ["breathing", "grounding", "brain-dump", "journal", "soundscapes", "bubble-wrap"];

export default function SiteFooter() {
  const popular = POPULAR.map((slug) => TOOLS.find((t) => t.slug === slug)).filter((t) => t !== undefined);

  return (
    <footer className="mt-12 border-t border-mist/8 px-6 pt-12 pb-10">
      <div className="mx-auto grid max-w-5xl gap-8 text-sm sm:grid-cols-3">
        <div>
          <Link href="/" className="font-serif text-lg text-white/75 italic hover:text-white">
            DropMyStress
          </Link>
          <p className="mt-2 leading-relaxed text-mist/45">
            Vent anonymously, let it go, and breathe. {TOOLS.length} free, private stress-relief tools.
          </p>
        </div>
        <nav aria-label="Popular tools">
          <p className="mb-3 text-xs tracking-widest text-mist/40 uppercase">Popular tools</p>
          <ul className="flex flex-col gap-2">
            {popular.map((tool) => (
              <li key={tool.slug}>
                <Link href={`/tools/${tool.slug}`} className="text-mist/60 transition-colors hover:text-white">
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Site">
          <p className="mb-3 text-xs tracking-widest text-mist/40 uppercase">Explore</p>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/tools" className="text-mist/60 transition-colors hover:text-white">
                All {TOOLS.length} tools
              </Link>
            </li>
            <li>
              <Link href="/help" className="text-mist/60 transition-colors hover:text-white">
                Get help now
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-5xl text-center text-xs leading-relaxed text-mist/35">
        DropMyStress is a place to breathe, not a substitute for professional care. If you&apos;re in crisis or thinking
        about harming yourself,{" "}
        <Link href="/help" className="text-mist/60 underline underline-offset-2 hover:text-white">
          find help right now
        </Link>
        .
      </p>
    </footer>
  );
}
