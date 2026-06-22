import Link from "next/link";
import { Logo } from "./ui";
import { SocialLinks } from "./SocialLinks";
import { LINKS } from "@/lib/links";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-surface-line/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-content-muted">
            Money that moves by the second. Real-time USDC streaming on Arc.
          </p>
          <div className="mt-4">
            <SocialLinks />
          </div>
        </div>

        <div className="flex gap-12 text-sm sm:justify-end">
          <div>
            <div className="mb-3 text-content-faint">Product</div>
            <ul className="space-y-2">
              <li>
                <Link href="/app" className="text-content-muted transition hover:text-content-hi">
                  Launch app
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-content-faint">Resources</div>
            <ul className="space-y-2 text-content-muted">
              <li>
                <Link href="/docs" className="transition hover:text-content-hi">
                  Docs
                </Link>
              </li>
              <li>
                <Link href="/page" className="transition hover:text-content-hi">
                  Flux Page
                </Link>
              </li>
              <li>
                <a href={LINKS.github} target="_blank" rel="noreferrer" className="transition hover:text-content-hi">
                  GitHub
                </a>
              </li>
              <li>
                <a href={LINKS.faucet} target="_blank" rel="noreferrer" className="transition hover:text-content-hi">
                  Testnet faucet
                </a>
              </li>
              <li>
                <a href={LINKS.explorer} target="_blank" rel="noreferrer" className="transition hover:text-content-hi">
                  Explorer
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-surface-line/60">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-5 py-5 text-xs text-content-faint sm:flex-row">
          <span>© 2025 Flux · Built on Arc</span>
          <span>Running on Arc testnet</span>
        </div>
      </div>
    </footer>
  );
}
