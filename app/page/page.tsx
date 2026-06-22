"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { Button, Field } from "@/components/ui";
import { DURATION_PRESETS } from "@/lib/paylink";
import { buildPagePath, ACCENTS, initials, type Tier, type FluxProfile } from "@/lib/fluxpage";

const inputCls =
  "w-full rounded-xl border border-surface-line bg-ink-900 px-3.5 py-2.5 text-content-hi placeholder:text-content-faint focus:border-flow-peri";

const ACCENT_KEYS: FluxProfile["accent"][] = ["aqua", "peri", "violet"];

export default function PageBuilder() {
  const { address, isConnected } = useAccount();

  const [to, setTo] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [accent, setAccent] = useState<FluxProfile["accent"]>("aqua");
  const [tiers, setTiers] = useState<Tier[]>([
    { label: "Coffee", amount: "5", durationSec: 604800 },
    { label: "Supporter", amount: "20", durationSec: 2592000 },
  ]);
  const [copied, setCopied] = useState(false);

  const recipient = to || address || "";
  const recipientValid = isAddress(recipient);
  const validTiers = tiers.filter((t) => t.label.trim() && Number(t.amount) > 0);
  const ready = recipientValid && name.trim().length > 0 && validTiers.length > 0;

  const path = useMemo(() => {
    if (!ready) return "";
    return buildPagePath({
      to: recipient,
      name: name.trim(),
      bio: bio.trim() || undefined,
      accent,
      tiers: validTiers,
    });
  }, [ready, recipient, name, bio, accent, validTiers]);

  const link = useMemo(() => {
    if (!path) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${path}`;
  }, [path]);

  function setTier(i: number, patch: Partial<Tier>) {
    setTiers((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function addTier() {
    if (tiers.length >= 4) return;
    setTiers((prev) => [...prev, { label: "", amount: "", durationSec: 2592000 }]);
  }
  function removeTier(i: number) {
    setTiers((prev) => prev.filter((_, idx) => idx !== i));
  }
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
        <h1 className="font-display text-2xl font-semibold text-content-hi">Create your Flux Page</h1>
        <p className="mt-1 text-sm text-content-muted">
          A shareable page where anyone can stream USDC to you — like a tip page, but the money
          flows by the second. Set your own tiers below.
        </p>

        {!isConnected && (
          <div className="mt-6 rounded-xl2 border border-surface-line bg-surface p-5 text-sm text-content-muted">
            Connect your wallet to auto-fill your address.
            <div className="mt-3">
              <ConnectButton label="Connect wallet" showBalance={false} chainStatus="none" />
            </div>
          </div>
        )}

        <div className="mt-8 space-y-5">
          <Field label="Pay to" hint="Defaults to your connected wallet.">
            <input
              className={inputCls}
              placeholder="0x…"
              spellCheck={false}
              value={to || address || ""}
              onChange={(e) => setTo(e.target.value.trim())}
            />
          </Field>

          <Field label="Display name">
            <input
              className={inputCls}
              placeholder="e.g. Alex Rivers"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Bio (optional)">
            <input
              className={inputCls}
              placeholder="e.g. Indie dev building on Arc"
              value={bio}
              maxLength={80}
              onChange={(e) => setBio(e.target.value)}
            />
          </Field>

          <Field label="Accent">
            <div className="flex gap-3">
              {ACCENT_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => setAccent(k)}
                  aria-label={k ?? ""}
                  className={`h-9 w-9 rounded-full border-2 transition ${
                    accent === k ? "scale-110" : "border-transparent opacity-70"
                  }`}
                  style={{
                    backgroundColor: ACCENTS[k ?? "aqua"],
                    borderColor: accent === k ? "#fff" : "transparent",
                  }}
                />
              ))}
            </div>
          </Field>

          {/* Tiers */}
          <div>
            <div className="mb-2 text-sm font-medium text-content-hi">Tiers</div>
            <div className="space-y-3">
              {tiers.map((t, i) => (
                <div key={i} className="rounded-xl border border-surface-line bg-surface p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wide text-content-faint">
                      Tier {i + 1}
                    </span>
                    {tiers.length > 1 && (
                      <button
                        onClick={() => removeTier(i)}
                        className="text-xs text-content-muted hover:text-danger"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input
                      className={inputCls}
                      placeholder="Label (e.g. Coffee)"
                      value={t.label}
                      maxLength={24}
                      onChange={(e) => setTier(i, { label: e.target.value })}
                    />
                    <input
                      className={inputCls}
                      inputMode="decimal"
                      placeholder="Amount (USDC)"
                      value={t.amount}
                      onChange={(e) => setTier(i, { amount: e.target.value.replace(/[^0-9.]/g, "") })}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DURATION_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => setTier(i, { durationSec: p.seconds })}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                          t.durationSec === p.seconds
                            ? "border-flow-peri bg-flow-peri/10 text-content-hi"
                            : "border-surface-line text-content-muted hover:text-content"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {tiers.length < 4 && (
              <button
                onClick={addTier}
                className="mt-3 text-sm text-flow-peri hover:text-flow-aqua"
              >
                + Add tier
              </button>
            )}
          </div>
        </div>

        {/* Generated link */}
        <div className="mt-8 rounded-xl2 border border-surface-line bg-surface p-5">
          <div className="text-xs uppercase tracking-wide text-content-faint">Your page link</div>
          {ready ? (
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
            <p className="mt-2 text-sm text-danger">
              Add a valid address, a display name, and at least one tier with an amount.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
