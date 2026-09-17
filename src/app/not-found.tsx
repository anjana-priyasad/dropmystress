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
      <div className="mx-auto max-w-3xl px-4 pt-3 pb-6 sm:px-8">
        <SiteHeader />
        <div className="flex flex-col items-center gap-6 py-24 text-center">
          <p className="text-sm tracking-widest text-mist/40 uppercase">404</p>
          <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">This page drifted away.</h1>
          <p className="max-w-md text-mist/60">
            That&apos;s okay — not everything needs to be found. Take a breath, then pick a place to go.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded-full bg-gradient-to-r from-calm to-lavender px-5 py-2.5 font-medium text-canvas shadow-lg shadow-calm/20 hover:shadow-calm/40">
              Vent &amp; let it go
            </Link>
            <Link href="/tools" className="glass rounded-full px-5 py-2.5 text-mist/80 hover:border-mist/30 hover:text-ink">
              Browse all tools
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
