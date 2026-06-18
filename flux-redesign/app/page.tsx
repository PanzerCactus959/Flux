"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui";
import { LINKS } from "@/lib/links";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <WhyArc />
        <UseCases />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}

function DemoTicker() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = Date.now();
    let raf = 0;
    const loop = () => {
      setV(((Date.now() - start) / 1000) * 0.0231);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const [whole, frac] = v.toFixed(6).split(".");
  return (
    <span className="tnum font-mono text-flow-aqua">
      {whole}
      <span className="text-content-muted">.{frac}</span>
    </span>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-block rounded-full border border-surface-line px-3 py-1 text-xs text-content-muted">
            On Arc · USDC · settles in under a second
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-content-hi sm:text-6xl">
            Money that moves <br className="hidden sm:block" />
            by the <span className="text-flow-aqua">second.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-content-muted">
            Flux streams USDC continuously instead of in lumps — salaries, vesting and
            subscriptions that flow in real time, that the recipient can withdraw anytime, and that
            the sender can stop the moment they choose.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/app">
              <Button className="px-5 py-3 text-base">Launch app →</Button>
            </Link>
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              <Button variant="ghost" className="px-5 py-3 text-base">
                View on GitHub
              </Button>
            </a>
          </div>
        </div>

        <div className="rounded-xl2 border border-surface-line bg-surface p-7">
          <div className="text-xs uppercase tracking-wide text-content-faint">Streaming now</div>
          <div className="mt-2 text-4xl font-semibold sm:text-5xl">
            <DemoTicker /> <span className="text-base text-content-muted">USDC</span>
          </div>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-ink-900">
            <div className="current-bar animate-flow h-full w-2/3 rounded-full" />
          </div>
          <div className="mt-5 flex justify-between text-sm text-content-muted">
            <span>0xA1c2…f9 → 0xBe3d…71</span>
            <span className="text-flow-aqua">live</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", t: "Open a stream", d: "The sender escrows USDC once and sets a window. The full amount locks in a smart contract up front." },
  { n: "02", t: "It flows per second", d: "Funds vest linearly from start to end. Halfway through, half is already the recipient's." },
  { n: "03", t: "Withdraw anytime", d: "Whatever has streamed is already theirs — pull it at second one or day thirty. No approval queue." },
  { n: "04", t: "Cancel, fairly", d: "Either side can cancel. The recipient keeps what streamed; the sender gets the rest back, in one tx." },
];

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 pt-28">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-content-hi">How it works</h2>
      <p className="mt-2 max-w-lg text-content-muted">Four steps. No middleman, no trust required — just math on-chain.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-xl2 border border-surface-line bg-surface p-6">
            <div className="font-mono text-sm text-flow-peri">{s.n}</div>
            <div className="mt-3 font-display text-lg font-semibold text-content-hi">{s.t}</div>
            <p className="mt-2 text-sm leading-relaxed text-content-muted">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  { t: "USDC is native gas", d: "No separate gas token to juggle — you pay and stream in the same asset." },
  { t: "Sub-second finality", d: "Settlement that feels instant, the only way streaming money makes sense." },
  { t: "No token, no lockups", d: "The contract holds only what you escrow. No fees, no governance, no surprises." },
];

function WhyArc() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-28">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-content-hi">Built for real-time money</h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.t} className="rounded-xl2 border border-surface-line bg-surface p-6">
            <div className="current-bar h-9 w-9 rounded-lg" />
            <div className="mt-4 font-display text-lg font-semibold text-content-hi">{f.t}</div>
            <p className="mt-2 text-sm leading-relaxed text-content-muted">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const USE_CASES = [
  { t: "Payroll", d: "Salaries that pay by the second instead of once a month." },
  { t: "Vesting", d: "Token & equity vesting that anyone can verify on-chain." },
  { t: "Subscriptions", d: "Recurring payments that stop the instant you cancel." },
  { t: "Grants", d: "Milestone funding that flows — and can be paused — transparently." },
];

function UseCases() {
  return (
    <section id="use-cases" className="mx-auto max-w-6xl px-5 pt-28">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-content-hi">If it recurs, it should stream</h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {USE_CASES.map((u) => (
          <div key={u.t} className="rounded-xl2 border border-surface-line bg-surface p-6">
            <div className="font-display text-lg font-semibold text-content-hi">{u.t}</div>
            <p className="mt-2 text-sm leading-relaxed text-content-muted">{u.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-28">
      <div className="relative overflow-hidden rounded-xl2 border border-surface-line bg-surface p-10 text-center sm:p-16">
        <div className="current-bar animate-flow pointer-events-none absolute inset-x-0 bottom-0 h-1.5" />
        <h2 className="font-display text-3xl font-semibold tracking-tight text-content-hi sm:text-4xl">Try Flux on Arc testnet</h2>
        <p className="mx-auto mt-3 max-w-md text-content-muted">Grab testnet USDC, open a stream to a friend, and watch it drip in real time.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/app">
            <Button className="px-5 py-3 text-base">Launch app →</Button>
          </Link>
          <a href={LINKS.faucet} target="_blank" rel="noreferrer">
            <Button variant="ghost" className="px-5 py-3 text-base">Get testnet USDC</Button>
          </a>
        </div>
      </div>
    </section>
  );
}
