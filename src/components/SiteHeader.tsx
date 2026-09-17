"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, LayoutGrid, LifeBuoy, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

const LINKS = [
  { href: "/tools", label: "Tools", icon: LayoutGrid },
  { href: "/me", label: "My space", icon: Heart },
  { href: "/help", label: "Get help", icon: LifeBuoy },
] as const;

export default function SiteHeader({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close the mobile menu after navigating.
  if (open && openedAt !== pathname) setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={`glass sticky top-3 z-40 px-3 py-2 transition-[border-radius] sm:px-4 ${open ? "rounded-3xl" : "rounded-[2rem]"}`}>
      <div className="flex items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Main">
            {LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 whitespace-nowrap text-mist/70 transition-colors hover:bg-ink/5 hover:text-ink aria-[current=page]:bg-ink/8 aria-[current=page]:text-ink"
              >
                <Icon className="size-4" aria-hidden /> {label}
              </Link>
            ))}
          </nav>
          {children}
          <button
            type="button"
            onClick={() => {
              setOpenedAt(pathname);
              setOpen(!open);
            }}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-9 items-center justify-center rounded-full border border-ink/10 text-mist/80 transition-colors hover:text-ink md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Main"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden md:hidden"
          >
            <ul className="flex flex-col gap-1 pt-3 pb-2">
              {LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-mist/80 transition-colors hover:bg-ink/5 hover:text-ink aria-[current=page]:bg-ink/8 aria-[current=page]:text-ink"
                  >
                    <Icon className="size-4 text-calm" aria-hidden /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
