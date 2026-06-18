import Link from "next/link";
import { Logo, Button } from "./ui";
import { SocialLinks } from "./SocialLinks";
import { LINKS } from "@/lib/links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-surface-line/60 bg-ink-base/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" aria-label="Flux home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-content-muted md:flex">
          <a href="#how" className="transition hover:text-content-hi">How it works</a>
          <a href="#use-cases" className="transition hover:text-content-hi">Use cases</a>
          <a href={LINKS.github} target="_blank" rel="noreferrer" className="transition hover:text-content-hi">
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <SocialLinks />
          </div>
          <Link href="/app">
            <Button>Launch app</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
