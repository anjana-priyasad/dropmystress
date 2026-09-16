import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="px-6 pb-10 text-center text-xs leading-relaxed text-mist/35">
      DropMyStress is a place to breathe, not a substitute for professional care.
      <br />
      If you&apos;re in crisis or thinking about harming yourself,{" "}
      <Link href="/help" className="text-mist/60 underline underline-offset-2 hover:text-white">
        find help right now
      </Link>
      .
    </footer>
  );
}
