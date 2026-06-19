"use client";

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
];

export function TopBar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-surface-line/60 bg-ink-base/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-7">
          <Link href="/" aria-label="Flux home">
            <Logo />
          </Link>
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
        </div>
      </div>
    </header>
  );
}
