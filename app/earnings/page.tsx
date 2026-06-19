"use client";

import { useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { StreamCard } from "@/components/StreamCard";
import { Button } from "@/components/ui";
import { useMyStreams, isConfigured, type StreamRecord } from "@/lib/useStreams";
import { arcTestnet } from "@/lib/chain";
import { USDC_DECIMALS } from "@/lib/contracts";
import { formatUsdc, shortAddr, flowRatePerSec } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";

function claimableFloat(s: StreamRecord, nowSec: number): number {
  const deposited = Number(formatUnits(s.deposited, USDC_DECIMALS));
  const withdrawn = Number(formatUnits(s.withdrawn, USDC_DECIMALS));
  if (s.cancelled) return 0;
  let vested: number;
  if (nowSec <= s.startTime) vested = 0;
  else if (nowSec >= s.endTime) vested = deposited;
  else vested = (deposited * (nowSec - s.startTime)) / (s.endTime - s.startTime);
  return Math.max(0, vested - withdrawn);
}

function LiveClaimableTotal({ streams }: { streams: StreamRecord[] }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const now = Date.now() / 1000;
      let sum = 0;
      for (const s of streams) sum += claimableFloat(s, now);
      setV(sum);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [streams]);
  const [whole, frac] = v.toFixed(6).split(".");
  return (
    <span className="tnum font-mono text-flow-aqua">
      {whole}
      <span className="text-content-muted">.{frac}</span>
    </span>
  );
}

function statusLabel(s: StreamRecord, now: number): string {
  if (s.cancelled) return "cancelled";
  if (now < s.startTime) return "scheduled";
  if (now >= s.endTime) return "completed";
  return "streaming";
}

export default function EarningsPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const onArc = chainId === arcTestnet.id;
  const { streams, isLoading, refetch } = useMyStreams(address);

  const incoming = useMemo(
    () => streams.filter((s) => s.recipient.toLowerCase() === address?.toLowerCase()),
    [streams, address],
  );

  const received = useMemo(
    () => incoming.reduce((acc, s) => acc + s.withdrawn, 0n),
    [incoming],
  );
  const ratePerDay = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return incoming
      .filter((s) => !s.cancelled && now < s.endTime)
      .reduce((acc, s) => acc + flowRatePerSec(s.deposited, s.startTime, s.endTime) * 86400, 0);
  }, [incoming]);
  const activeCount = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return incoming.filter((s) => !s.cancelled && now >= s.startTime && now < s.endTime).length;
  }, [incoming]);

  function exportCsv() {
    const now = Math.floor(Date.now() / 1000);
    const header = [
      "Stream ID",
      "From",
      "Deposited (USDC)",
      "Withdrawn (USDC)",
      "Claimable now (USDC)",
      "Start (UTC)",
      "End (UTC)",
      "Status",
    ];
    const rows = incoming.map((s) => [
      s.id.toString(),
      s.sender,
      formatUsdc(s.deposited, 6),
      formatUsdc(s.withdrawn, 6),
      claimableFloat(s, now).toFixed(6),
      new Date(s.startTime * 1000).toISOString(),
      new Date(s.endTime * 1000).toISOString(),
      statusLabel(s, now),
    ]);
    downloadCsv(`flux-earnings-${Date.now()}.csv`, [header, ...rows]);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24">
        {!isConnected ? (
          <Prompt />
        ) : !isConfigured || !onArc ? (
          <Notice>
            {!isConfigured
              ? "Contract address not set."
              : `Switch to Arc Testnet (chain ${arcTestnet.id}) to see your earnings.`}
          </Notice>
        ) : (
          <section className="pt-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-content-hi">Earnings</h1>
                <p className="mt-1 text-sm text-content-muted">
                  Everything streaming to {shortAddr(address)}.
                </p>
              </div>
              <Button variant="subtle" onClick={exportCsv} disabled={incoming.length === 0}>
                Export CSV
              </Button>
            </div>

            {/* Headline live figure */}
            <div className="mb-8 rounded-xl2 border border-surface-line bg-surface p-7">
              <div className="text-xs uppercase tracking-wide text-content-faint">
                Claimable across all streams
              </div>
              <div className="mt-2 text-4xl font-semibold sm:text-5xl">
                <LiveClaimableTotal streams={incoming} />{" "}
                <span className="text-base text-content-muted">USDC</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-4 border-t border-surface-line pt-5 text-sm">
                <Stat label="Received so far" value={`${formatUsdc(received)} USDC`} />
                <Stat label="Active streams" value={String(activeCount)} />
                <Stat
                  label="Inflow rate"
                  value={ratePerDay > 0 ? `≈ ${ratePerDay.toFixed(2)} USDC/day` : "—"}
                />
              </div>
            </div>

            {isLoading && incoming.length === 0 ? (
              <p className="text-content-muted">Loading…</p>
            ) : incoming.length === 0 ? (
              <div className="rounded-xl2 border border-dashed border-surface-line p-12 text-center text-content-muted">
                No one is streaming to you yet. Share a payment link to get started.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {incoming.map((s) => (
                  <StreamCard key={s.id.toString()} stream={s} role="incoming" onChanged={refetch} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-content-faint">{label}</div>
      <div className="mt-0.5 font-medium text-content-hi">{value}</div>
    </div>
  );
}

function Prompt() {
  return (
    <div className="mx-auto mt-24 max-w-md rounded-xl2 border border-surface-line bg-surface p-8 text-center">
      <h1 className="font-display text-2xl font-semibold text-content-hi">Connect your wallet</h1>
      <p className="mb-6 mt-2 text-sm text-content-muted">
        See every USDC stream flowing to you in real time.
      </p>
      <div className="flex justify-center">
        <ConnectButton label="Connect wallet" />
      </div>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-24 max-w-md rounded-xl2 border border-surface-line bg-surface p-6 text-center text-sm text-content-muted">
      {children}
    </div>
  );
}
