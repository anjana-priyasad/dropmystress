import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
        <SiteHeader />
        <div className="flex flex-col items-center gap-6 py-24 text-center">
          <p className="text-sm tracking-widest text-mist/40 uppercase">404</p>
          <h1 className="font-serif text-4xl text-white/90">This page drifted away.</h1>
          <p className="max-w-md text-mist/60">
            That&apos;s okay — not everything needs to be found. Take a breath, then pick a place to go.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded-full bg-calm/90 px-5 py-2.5 font-medium text-night hover:bg-calm">
              Vent &amp; let it go
            </Link>
            <Link href="/tools" className="rounded-full border border-mist/15 px-5 py-2.5 text-mist/80 hover:border-mist/30 hover:text-white">
              Browse all tools
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
