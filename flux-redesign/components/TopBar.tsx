"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Logo } from "./ui";
import { SocialLinks } from "./SocialLinks";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-surface-line/60 bg-ink-base/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <Link href="/" aria-label="Flux home">
          <Logo />
        </Link>
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
