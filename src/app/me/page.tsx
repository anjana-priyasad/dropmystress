import type { Metadata } from "next";
import MySpace from "@/components/MySpace";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "My Space",
    description: "Your favourite stress-relief tools, calm streak and progress — stored privately in your own browser.",
    path: "/me",
  }),
  robots: { index: false, follow: true },
};

export default function MySpacePage() {
  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-6xl px-4 pt-3 pb-6 sm:px-8">
        <SiteHeader />
        <div className="pt-10 sm:pt-14">
          <MySpace />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
