import type { Metadata } from "next";
import Link from "next/link";
import { Cloud, EyeOff, HardDrive, Trash2 } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { SITE_NAME, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: `How ${SITE_NAME} handles what you type: no accounts, vents are never stored, and your journals stay in your own browser.`,
  path: "/privacy",
});

const POINTS = [
  {
    icon: EyeOff,
    title: "No accounts, no tracking you",
    text: "You never sign up or give us your name or email. We don't build a profile of you.",
  },
  {
    icon: Cloud,
    title: "Vents are sent once, then gone",
    text: "To write your calm reply, what you type in the vent box is sent once to our AI provider (OpenAI or Google Gemini). We don't save it, log it, or keep a copy.",
  },
  {
    icon: HardDrive,
    title: "Everything else stays on your device",
    text: "Journal entries, mood check-ins, gratitude notes, gardens, favourites and your streak are saved only in this browser's local storage. They never reach our servers.",
  },
  {
    icon: Trash2,
    title: "You're in control",
    text: "Export a backup or erase everything at any time from My space. Clearing your browser data removes it too.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-4xl px-4 pt-3 pb-6 sm:px-8">
        <SiteHeader />
        <div className="py-14 text-center sm:py-20">
          <p className="mb-4 text-xs tracking-[0.25em] text-calm uppercase">Privacy</p>
          <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">
            What you share here <span className="text-gradient italic">stays yours.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-mist/65">
            A place to let go only works if it feels safe. Here&apos;s exactly what happens to your words.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {POINTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="glass rounded-3xl p-6">
              <span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-calm/12 ring-1 ring-ink/10">
                <Icon className="size-5 text-calm" aria-hidden />
              </span>
              <h2 className="mb-2 font-medium text-ink">{title}</h2>
              <p className="text-sm leading-relaxed text-mist/65">{text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center text-sm text-mist/55">
          Manage what&apos;s saved on this device in{" "}
          <Link href="/me" className="text-calm underline-offset-2 hover:underline">
            My space
          </Link>
          .
        </p>
      </div>
      <SiteFooter />
    </main>
  );
}
