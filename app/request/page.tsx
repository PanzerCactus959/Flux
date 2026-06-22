"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { Button, Field } from "@/components/ui";
import { buildPayPath, DURATION_PRESETS } from "@/lib/paylink";

const inputCls =
  "w-full rounded-xl border border-surface-line bg-ink-900 px-3.5 py-2.5 text-content-hi placeholder:text-content-faint focus:border-flow-peri";

export default function RequestPage() {
  const { address, isConnected } = useAccount();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [seconds, setSeconds] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState(false);

  // Default the recipient to the connected wallet.
  const recipient = to || address || "";
  const recipientValid = isAddress(recipient);

  const path = useMemo(() => {
    if (!recipientValid) return "";
    return buildPayPath({
      to: recipient,
      amount: amount || undefined,
      durationSec: seconds || undefined,
      label: label || undefined,
    });
  }, [recipient, recipientValid, amount, seconds, label]);

  const link = useMemo(() => {
    if (!path) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${path}`;
  }, [path]);

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-24 pt-10">
        <h1 className="font-display text-2xl font-semibold text-content-hi">Request a stream</h1>
        <p className="mt-1 text-sm text-content-muted">
          Create a link. Anyone who opens it can stream USDC to you on Arc — no contract changes,
          just share and get paid.
        </p>

        <Link
          href="/page"
          className="mt-4 inline-block rounded-xl border border-surface-line bg-surface px-4 py-2.5 text-sm text-content-muted transition hover:border-flow-peri hover:text-content-hi"
        >
          Want a permanent page with tiers instead? Create your Flux Page →
        </Link>

        {!isConnected && (
          <div className="mt-6 rounded-xl2 border border-surface-line bg-surface p-5 text-sm text-content-muted">
            Tip: connect your wallet to auto-fill your address as the recipient.
            <div className="mt-3">
              <ConnectButton label="Connect wallet" showBalance={false} chainStatus="none" />
            </div>
          </div>
        )}

        <div className="mt-8 space-y-5">
          <Field label="Pay to" hint="Defaults to your connected wallet. Edit to request to another address.">
            <input
              className={inputCls}
              placeholder="0x…"
              spellCheck={false}
              value={to || address || ""}
              onChange={(e) => setTo(e.target.value.trim())}
            />
          </Field>

          <Field label="Amount (optional)" hint="Leave blank to let the payer choose.">
            <input
              className={inputCls}
              inputMode="decimal"
              placeholder="e.g. 100"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          </Field>

          <Field label="Duration (optional)">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSeconds(null)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  seconds === null
                    ? "border-flow-peri bg-flow-peri/10 text-content-hi"
                    : "border-surface-line text-content-muted hover:text-content"
                }`}
              >
                Payer chooses
              </button>
              {DURATION_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setSeconds(p.seconds)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                    seconds === p.seconds
                      ? "border-flow-peri bg-flow-peri/10 text-content-hi"
                      : "border-surface-line text-content-muted hover:text-content"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Note (optional)" hint="Shown to the payer, e.g. “March retainer”.">
            <input
              className={inputCls}
              placeholder="What's this for?"
              value={label}
              maxLength={60}
              onChange={(e) => setLabel(e.target.value)}
            />
          </Field>
        </div>

        {/* Generated link */}
        <div className="mt-8 rounded-xl2 border border-surface-line bg-surface p-5">
          <div className="text-xs uppercase tracking-wide text-content-faint">Your payment link</div>
          {recipientValid ? (
            <>
              <div className="mt-2 break-all rounded-lg bg-ink-900 p-3 font-mono text-sm text-content">
                {link}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={copy}>{copied ? "Copied ✓" : "Copy link"}</Button>
                <Link href={path || "#"}>
                  <Button variant="ghost">Preview</Button>
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-danger">Enter a valid recipient address to generate a link.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
