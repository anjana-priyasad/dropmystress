import Link from "next/link";

/** A single drop landing in still water — the brand mark. */
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="dms-drop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5cc2b0" />
          <stop offset="55%" stopColor="#1f9a88" />
          <stop offset="100%" stopColor="#6a6fd6" />
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="33" rx="15" ry="3.6" fill="none" stroke="#5f63c9" strokeOpacity="0.3" strokeWidth="1.5" />
      <ellipse cx="20" cy="33" rx="8.5" ry="2" fill="none" stroke="#1f7f71" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M20 3.5c5.6 7 9.5 12.4 9.5 17.2A9.5 9.5 0 0 1 10.5 20.7C10.5 15.9 14.4 10.5 20 3.5Z" fill="url(#dms-drop)" />
      <path d="M15.2 20.5a4.8 4.8 0 0 0 3.2 4.6" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="DropMyStress home"
      className="group inline-flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-calm/70"
    >
      <LogoMark className="size-8 transition-transform duration-500 group-hover:-translate-y-0.5" />
      <span className="text-[1.05rem] font-semibold tracking-tight text-ink">
        Drop<span className="font-serif font-normal italic text-calm">My</span>Stress
      </span>
    </Link>
  );
}
