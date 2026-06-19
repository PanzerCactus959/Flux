"use client";

import { useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { Button, Field } from "@/components/ui";
import { useBridge, useSupportedChains } from "@/lib/useBridge";
import { arcTestnet } from "@/lib/chain";

const SOURCE = "Arc_Testnet";
const inputCls =
  "w-full rounded-xl border border-surface-line bg-ink-900 px-3.5 py-2.5 text-content-hi placeholder:text-content-faint focus:border-flow-peri";

const STEP_LABELS: Record<string, string> = {
  approve: "Approving USDC",
  burn: "Burning on Arc",
  fetchAttestation: "Waiting for Circle attestation",
  mint: "Minting on destination",
};

export default function BridgePage() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const onArc = chainId === arcTestnet.id;

  const chains = useSupportedChains();
  const { bridge, pending, error, result, clear } = useBridge();

  const destinations = useMemo(
    () => chains.filter((c) => c.type === "evm" && c.isTestnet && c.chain !== SOURCE),
    [chains],
  );

  const [toChain, setToChain] = useState("");
  const [amount, setAmount] = useState("");

  const amountValid = Number(amount) > 0;
  const canBridge = isConnected && onArc && !!toChain && amountValid && !pending;

  async function go() {
    if (!canBridge) return;
    try {
      await bridge({ fromChain: SOURCE, toChain, amount });
    } catch {
      /* error shown via state */
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const steps: any[] = result?.steps ?? [];
  const succeeded = result?.state === "success";

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-24 pt-10">
        <h1 className="font-display text-2xl font-semibold text-content-hi">Bridge USDC out</h1>
        <p className="mt-1 text-sm text-content-muted">
          Move USDC you&apos;ve received on Arc to another chain via Circle CCTP — your USDC is
          burned on Arc and minted natively on the destination. No wrapped tokens.
        </p>

        {/* Risk note */}
        <div className="mt-5 rounded-xl border border-amber/30 bg-amber/5 p-4 text-xs leading-relaxed text-content-muted">
          ⚠️ This moves real (testnet) funds and cannot be reversed. Test with a tiny amount first.
          You may need a little gas on the destination chain for the mint step, and your wallet may
          ask to switch networks during the process.
        </div>

        <div className="mt-7 space-y-5">
          <Field label="From">
            <div className="rounded-xl border border-surface-line bg-ink-900 px-3.5 py-2.5 text-content">
              Arc Testnet
            </div>
          </Field>

          <Field label="To" hint="Destination chain (testnet) where USDC will be minted.">
            <select
              className={inputCls}
              value={toChain}
              onChange={(e) => setToChain(e.target.value)}
            >
              <option value="">Select a chain…</option>
              {destinations.map((c) => (
                <option key={c.chain} value={c.chain}>
                  {c.name}
                </option>
              ))}
            </select>
            {destinations.length === 0 && (
              <span className="mt-1 block text-xs text-content-faint">
                Loading supported chains… (requires the Bridge Kit package installed)
              </span>
            )}
          </Field>

          <Field label="Amount (USDC)">
            <input
              className={inputCls}
              inputMode="decimal"
              placeholder="e.g. 0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          </Field>
        </div>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        {/* Progress */}
        {steps.length > 0 && (
          <div className="mt-5 space-y-2 rounded-xl border border-surface-line bg-surface p-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-content">{STEP_LABELS[s.name] ?? s.name}</span>
                <span
                  className={
                    s.state === "success"
                      ? "text-flow-aqua"
                      : s.state === "pending"
                        ? "text-content-muted"
                        : "text-content-faint"
                  }
                >
                  {s.state === "success" ? "✓" : s.state}
                </span>
              </div>
            ))}
          </div>
        )}

        {succeeded && (
          <p className="mt-4 text-sm text-flow-aqua">
            ✓ Bridged {result?.amount ? "" : ""}successfully. USDC has been minted on the destination
            chain.
          </p>
        )}

        <div className="mt-6">
          {!isConnected ? (
            <ConnectButton label="Connect wallet" />
          ) : !onArc ? (
            <p className="text-sm text-content-muted">
              Switch to Arc Testnet (chain {arcTestnet.id}) to bridge from Arc.
            </p>
          ) : (
            <Button onClick={go} loading={pending} disabled={!canBridge} className="w-full">
              {pending ? "Bridging…" : "Bridge USDC"}
            </Button>
          )}
          {(succeeded || error) && !pending && (
            <button
              onClick={clear}
              className="mt-3 w-full text-center text-xs text-content-muted hover:text-content-hi"
            >
              Start another transfer
            </button>
          )}
        </div>

        <p className="mt-6 text-xs text-content-faint">
          Powered by Circle CCTP. Attestation can take from a few seconds up to a couple of minutes
          depending on the route.
        </p>
      </main>
      <Footer />
    </div>
  );
}
