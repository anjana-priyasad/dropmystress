import Link from "next/link";
import type { ReactNode } from "react";
import { LayoutGrid, LifeBuoy } from "lucide-react";

export default function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/" className="font-serif text-lg text-white/70 italic transition-colors hover:text-white">
        DropMyStress
      </Link>
      <nav className="flex items-center gap-1 text-sm sm:gap-2" aria-label="Main">
        <Link href="/tools" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 whitespace-nowrap text-mist/60 transition-colors hover:text-white sm:px-3">
          <LayoutGrid className="size-4" /> Tools
        </Link>
        <Link href="/help" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 whitespace-nowrap text-mist/60 transition-colors hover:text-white sm:px-3">
          <LifeBuoy className="size-4" /> Get help
        </Link>
        {children}
      </nav>
    </header>
  );
}
