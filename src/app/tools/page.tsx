import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ToolsDirectory from "@/components/ToolsDirectory";

export const metadata: Metadata = {
  title: "Tools",
  description: "20 free, private tools for stress relief: breathing, grounding, journaling, soundscapes and more.",
};

export default function ToolsPage() {
  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        <SiteHeader />
        <div className="py-12 text-center sm:py-16">
          <h1 className="mb-3 font-serif text-4xl text-white/90 sm:text-5xl">Tools for calmer days</h1>
          <p className="mx-auto max-w-xl text-mist/60">
            Twenty small, private tools to help you breathe, think clearly, let things out, and check in with yourself.
            No accounts. Nothing leaves your device.
          </p>
        </div>
        <ToolsDirectory />
      </div>
      <div className="mt-16">
        <SiteFooter />
      </div>
    </main>
  );
}
