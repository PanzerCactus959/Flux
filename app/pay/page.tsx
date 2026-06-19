"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isAddress } from "viem";
import { useAccount, useChainId, useConfig } from "wagmi";
import { readContract } from "@wagmi/core";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { Button, Field } from "@/components/ui";
import { useTx, humanizeError } from "@/lib/useTx";
import {
  STREAMVAULT_ADDRESS,
  streamVaultAbi,
  USDC_ADDRESS,
  usdcAbi,
  USDC_SYMBOL,
} from "@/lib/contracts";
import { parseUsdc, shortAddr, formatDuration } from "@/lib/format";
import { DURATION_PRESETS } from "@/lib/paylink";
import { arcTestnet } from "@/lib/chain";

const inputCls =
  "w-full rounded-xl border border-surface-line bg-ink-900 px-3.5 py-2.5 text-content-hi placeholder:text-content-faint focus:border-flow-peri";

export default function PayPage() {
  return (
    <Suspense fallback={<Shell><p className="text-content-muted">Loading…</p></Shell>}>
      <PayInner />
    </Suspense>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-24 pt-12">{children}</main>
      <Footer />
    </div>
  );
}

function PayInner() {
  const params = useSearchParams();
  const to = (params.get("to") || "").trim();
  const fixedAmount = params.get("amt") || "";
  const fixedDur = params.get("dur") ? Number(params.get("dur")) : 0;
  const label = params.get("label") || "";

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const onArc = chainId === arcTestnet.id;
  const config = useConfig();
  const { run, pending } = useTx();

  const [amount, setAmount] = useState(fixedAmount);
  const [seconds, setSeconds] = useState(fixedDur || DURATION_PRESETS[1].seconds);
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const toValid = isAddress(to);
  const isSelf = address && to.toLowerCase() === address.toLowerCase();
  const amountValid = useMemo(() => {
    try {
      return parseUsdc(amount) > 0n;
    } catch {
      return false;
    }
  }, [amount]);
  const canSend = toValid && !isSelf && amountValid && seconds > 0 && isConnected && onArc;

  async function send() {
    if (!canSend || !address) return;
    setError(null);
    const amt = parseUsdc(amount);
    try {
      const allowance = (await readContract(config, {
        address: USDC_ADDRESS,
        abi: usdcAbi,
        functionName: "allowance",
        args: [address, STREAMVAULT_ADDRESS],
      })) as bigint;

      if (allowance < amt) {
        setStep(`Approving ${USDC_SYMBOL}…`);
        await run({
          address: USDC_ADDRESS,
          abi: usdcAbi as never,
          functionName: "approve",
          args: [STREAMVAULT_ADDRESS, amt],
        });
      }

      setStep("Opening stream…");
      const start = BigInt(Math.floor(Date.now() / 1000));
      const end = start + BigInt(seconds);
      await run({
        address: STREAMVAULT_ADDRESS,
        abi: streamVaultAbi as never,
        functionName: "createStream",
        args: [to as `0x${string}`, amt, start, end],
      });
      setStep(null);
      setDone(true);
    } catch (e) {
      setStep(null);
      setError(humanizeError(e));
    }
  }

  if (!toValid) {
    return (
      <Shell>
        <Card>
          <h1 className="font-display text-xl font-semibold text-content-hi">Invalid link</h1>
          <p className="mt-2 text-sm text-content-muted">
            This payment link is missing a valid recipient address.
          </p>
          <Link href="/request" className="mt-4 inline-block">
            <Button variant="ghost">Create your own link</Button>
          </Link>
        </Card>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <Card>
          <div className="text-3xl">✓</div>
          <h1 className="mt-2 font-display text-xl font-semibold text-content-hi">Stream opened</h1>
          <p className="mt-2 text-sm text-content-muted">
            {amount} {USDC_SYMBOL} is now streaming to {shortAddr(to)} over{" "}
            {formatDuration(seconds)}.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href="/app">
              <Button>View in dashboard</Button>
            </Link>
          </div>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <div className="text-xs uppercase tracking-wide text-content-faint">Payment request</div>
        <h1 className="mt-1 font-display text-xl font-semibold text-content-hi">
          Stream USDC to {shortAddr(to)}
        </h1>
        {label && <p className="mt-1 text-sm text-flow-aqua">“{label}”</p>}

        <div className="mt-6 space-y-5 text-left">
          <Field label={`Amount (${USDC_SYMBOL})`}>
            <input
              className={inputCls}
              inputMode="decimal"
              placeholder="100"
              value={amount}
              disabled={!!fixedAmount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          </Field>

          <Field label="Duration">
            {fixedDur ? (
              <div className="rounded-xl border border-surface-line bg-ink-900 px-3.5 py-2.5 text-content">
                {formatDuration(fixedDur)}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
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
            )}
          </Field>
        </div>

        {isSelf && (
          <p className="mt-4 text-sm text-danger">This link pays your own address — connect a different wallet.</p>
        )}
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <div className="mt-6">
          {!isConnected ? (
            <ConnectButton label="Connect to pay" />
          ) : !onArc ? (
            <p className="text-sm text-content-muted">
              Switch to Arc Testnet (chain {arcTestnet.id}) to continue.
            </p>
          ) : (
            <Button onClick={send} loading={pending} disabled={!canSend} className="w-full">
              {step ?? `Stream ${amount || "—"} ${USDC_SYMBOL}`}
            </Button>
          )}
        </div>

        <p className="mt-4 text-xs text-content-faint">
          Approve USDC, then open the stream. Cancel anytime to reclaim the unstreamed amount.
        </p>
      </Card>
    </Shell>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl2 border border-surface-line bg-surface p-7 text-center">{children}</div>
  );
}
