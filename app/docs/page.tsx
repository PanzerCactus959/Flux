"use client";

import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { LINKS } from "@/lib/links";

const TOC = [
  { id: "overview", label: "What is Flux" },
  { id: "how", label: "How streaming works" },
  { id: "start", label: "Getting started" },
  { id: "stream", label: "Open a stream" },
  { id: "withdraw", label: "Withdraw & cancel" },
  { id: "request", label: "Payment links" },
  { id: "earnings", label: "Earnings & export" },
  { id: "bridge", label: "Bridge out (CCTP)" },
  { id: "faq", label: "FAQ" },
];

const NETWORK = [
  ["Network name", "Arc Testnet"],
  ["Chain ID", "5042002"],
  ["RPC URL", "https://rpc.testnet.arc.network"],
  ["Currency symbol", "USDC"],
  ["Block explorer", "https://testnet.arcscan.app"],
];

const FAQ = [
  ["Is this real money?", "No. Flux currently runs on Arc Testnet using test USDC from a faucet. Nothing here uses real funds."],
  ["Is the contract audited?", "Not yet. Treat Flux as an early, experimental project and do not use it with real value."],
  ["Are there any fees?", "There is no protocol fee in this version. You only pay network gas — and on Arc, gas is paid in USDC."],
  ["Why does opening a stream need two transactions?", "The first approves the contract to move your USDC; the second actually opens the stream. This is standard for ERC-20 tokens."],
  ["Can I stream to my own address?", "No. The recipient must be different from the sender."],
  ["What happens to the money if a stream is cancelled?", "It settles instantly and fairly: the recipient keeps everything already streamed, and the sender is refunded the rest — all in one transaction."],
  ["Which token does Flux use?", "USDC, via its 6-decimal ERC-20 interface on Arc."],
];

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-12">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-content-hi">
          Flux Docs
        </h1>
        <p className="mt-3 text-lg text-content-muted">
          Everything you need to stream USDC on Arc — what Flux is, how it works, and how to use
          every feature.
        </p>

        {/* Table of contents */}
        <nav className="mt-8 rounded-xl2 border border-surface-line bg-surface p-5">
          <div className="mb-3 text-xs uppercase tracking-wide text-content-faint">On this page</div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {TOC.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="text-sm text-flow-peri hover:text-flow-aqua">
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* What is Flux */}
        <Section id="overview" title="What is Flux">
          <P>
            Flux is a payment-streaming app on Arc. Instead of paying in a single lump, money flows
            continuously — second by second — in USDC.
          </P>
          <P>
            The sender escrows funds once; they vest linearly to the recipient over a chosen window.
            The recipient can withdraw whatever has streamed at any time, and either party can
            cancel, which settles both sides fairly in a single transaction.
          </P>
          <Bullets
            items={[
              "Real-time: value moves every second, not once a month.",
              "Non-custodial: only the smart contract holds the escrow — no middleman.",
              "Fair cancellation: recipient keeps what streamed, sender reclaims the rest.",
              "Built on Arc, where USDC is the native gas token and settlement is sub-second.",
              "Currently live on Arc Testnet (test funds only).",
            ]}
          />
        </Section>

        {/* How it works */}
        <Section id="how" title="How streaming works">
          <Steps
            items={[
              ["Create a stream", "The sender escrows USDC and sets a start and end time."],
              ["It vests linearly", "At any moment, the vested amount = total × time elapsed ÷ duration. Halfway through, half is the recipient's."],
              ["Withdraw anytime", "The recipient pulls whatever has vested but not yet been withdrawn — at second one or day thirty."],
              ["Cancel anytime", "Either party can stop the stream. The recipient keeps the streamed portion; the sender is refunded the remainder."],
            ]}
          />
        </Section>

        {/* Getting started */}
        <Section id="start" title="Getting started">
          <P>You need three things before your first stream:</P>
          <Bullets
            items={[
              "A web3 wallet such as MetaMask or Rabby.",
              "Arc Testnet added to that wallet (details below).",
              "Some testnet USDC — used both for gas and to stream.",
            ]}
          />
          <h3 className="mt-6 font-display text-lg font-semibold text-content-hi">Add Arc Testnet</h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-surface-line">
            {NETWORK.map(([k, v], i) => (
              <div
                key={k}
                className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:justify-between ${
                  i % 2 ? "bg-ink-900/40" : ""
                }`}
              >
                <span className="text-sm text-content-muted">{k}</span>
                <span className="break-all font-mono text-sm text-content-hi">{v}</span>
              </div>
            ))}
          </div>
          <h3 className="mt-6 font-display text-lg font-semibold text-content-hi">Get testnet USDC</h3>
          <P>
            On Arc, USDC is the gas token, so you need a little just to transact. Grab some from
            Circle&apos;s faucet, then come back to Flux.
          </P>
          <ExtLink href={LINKS.faucet}>Open the Circle faucet →</ExtLink>
        </Section>

        {/* Open a stream */}
        <Section id="stream" title="Open a stream">
          <Steps
            items={[
              ["Go to Dashboard", "Connect your wallet and make sure you are on Arc Testnet."],
              ["New stream", "Enter the recipient address, the amount, and a duration."],
              ["Approve USDC", "Your wallet asks to approve the contract to move your USDC."],
              ["Confirm", "A second wallet prompt opens the stream. From here it flows automatically."],
            ]}
          />
          <Note>You will see two wallet prompts: one to approve, one to open the stream.</Note>
        </Section>

        {/* Withdraw & cancel */}
        <Section id="withdraw" title="Withdraw & cancel">
          <P>
            <B>Withdraw</B> — as the recipient, open the stream in Dashboard (Incoming) or Earnings
            and press Withdraw. You receive everything that has streamed so far.
          </P>
          <P>
            <B>Cancel</B> — either the sender or the recipient can cancel. In one transaction the
            recipient keeps the streamed portion and the sender is refunded the rest. A cancelled
            stream cannot be restarted.
          </P>
        </Section>

        {/* Payment links */}
        <Section id="request" title="Payment links (get paid)">
          <P>
            A Flux payment link is how other people stream USDC to you — it is not you paying.
          </P>
          <Steps
            items={[
              ["Create a link", "On the Request page, set an amount and duration (or leave them open), then copy the link."],
              ["Share it", "Send the link to whoever should pay you."],
              ["They pay", "They open the link, connect their own wallet, and start the stream."],
              ["You get paid, live", "USDC flows to your wallet every second — watch it in Earnings."],
            ]}
          />
          <Note>You cannot pay your own address — the payer must use a different wallet.</Note>
        </Section>

        {/* Earnings */}
        <Section id="earnings" title="Earnings & export">
          <P>
            The Earnings page shows everything streaming to you: a live claimable total, how much you
            have received, your active streams, and your inflow rate per day.
          </P>
          <P>
            Use <B>Export CSV</B> to download a record of your incoming streams — handy for
            bookkeeping or taxes.
          </P>
        </Section>

        {/* Bridge */}
        <Section id="bridge" title="Bridge out (CCTP)">
          <P>
            The Bridge page moves USDC you have received on Arc to another chain using Circle CCTP.
            Your USDC is burned on Arc and minted natively on the destination — no wrapped tokens.
          </P>
          <Bullets
            items={[
              "This moves funds across chains and cannot be reversed — test with a tiny amount first.",
              "You may need a little gas on the destination chain for the final mint step.",
              "Your wallet may ask to switch networks during the process.",
              "CCTP moves USDC chain-to-chain, not to a bank. To cash out, bridge to a chain with an exchange or Circle Mint, then off-ramp there.",
            ]}
          />
        </Section>

        {/* FAQ */}
        <Section id="faq" title="FAQ">
          <div className="space-y-5">
            {FAQ.map(([q, a]) => (
              <div key={q}>
                <div className="font-medium text-content-hi">{q}</div>
                <P>{a}</P>
              </div>
            ))}
          </div>
        </Section>

        {/* Resources */}
        <Section id="resources" title="Resources">
          <div className="flex flex-wrap gap-3">
            <ExtLink href={LINKS.github}>GitHub</ExtLink>
            <ExtLink href={LINKS.explorer}>Arc explorer</ExtLink>
            <ExtLink href={LINKS.faucet}>Testnet faucet</ExtLink>
            <Link href="/app" className="text-sm text-flow-peri hover:text-flow-aqua">
              Launch the app →
            </Link>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

/* ── small presentational helpers ──────────────────────────────────────── */

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-content-hi">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 leading-relaxed text-content-muted">{children}</p>;
}

function B({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-content-hi">{children}</span>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5 text-content-muted">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-flow-aqua" />
          <span className="leading-relaxed">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Steps({ items }: { items: [string, string][] }) {
  return (
    <ol className="mt-3 space-y-4">
      {items.map(([t, d], i) => (
        <li key={i} className="flex gap-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-raised font-mono text-sm text-flow-peri">
            {i + 1}
          </span>
          <div>
            <div className="font-medium text-content-hi">{t}</div>
            <div className="mt-0.5 leading-relaxed text-content-muted">{d}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border border-flow-peri/30 bg-flow-peri/5 px-4 py-3 text-sm text-content-muted">
      {children}
    </div>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-sm text-flow-peri hover:text-flow-aqua">
      {children}
    </a>
  );
}
