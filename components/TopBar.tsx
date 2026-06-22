"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Logo } from "./ui";
import { SocialLinks } from "./SocialLinks";

const NAV = [
  { href: "/app", label: "Dashboard" },
  { href: "/earnings", label: "Earnings" },
  { href: "/request", label: "Request" },
  { href: "/bridge", label: "Bridge" },
  { href: "/embed", label: "Embed" },
  { href: "/docs", label: "Docs" },
];

export function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-surface-line/60 bg-ink-base/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-7">
          <Link href="/" aria-label="Flux home">
            <Logo />
          </Link>
          {/* Desktop nav */}
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`transition ${
                  pathname === n.href ? "text-content-hi" : "text-content-muted hover:text-content-hi"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <SocialLinks />
          </div>
          <ConnectButton
            showBalance={false}
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
            chainStatus="icon"
          />
          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-lg text-content-hi hover:bg-surface-raised md:hidden"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="border-t border-surface-line/60 bg-ink-base/95 px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-2.5 text-base transition ${
                  pathname === n.href
                    ? "bg-surface-raised text-content-hi"
                    : "text-content-muted hover:bg-surface-raised hover:text-content-hi"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 border-t border-surface-line/60 pt-3">
            <SocialLinks />
          </div>
        </div>
      )}
    </header>
  );
}
