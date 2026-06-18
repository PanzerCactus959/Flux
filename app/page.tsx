"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TopBar } from "@/components/TopBar";
import { StreamCard } from "@/components/StreamCard";
import { NewStreamDialog } from "@/components/NewStreamDialog";
import { Button } from "@/components/ui";
import { useMyStreams, isConfigured } from "@/lib/useStreams";
import { arcTestnet } from "@/lib/chain";

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const onArc = chainId === arcTestnet.id;

  const { streams, isLoading, refetch } = useMyStreams(address);
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");
  const [dialogOpen, setDialogOpen] = useState(false);

  const incoming = useMemo(
    () => streams.filter((s) => s.recipient.toLowerCase() === address?.toLowerCase()),
    [streams, address],
  );
  const outgoing = useMemo(
    () => streams.filter((s) => s.sender.toLowerCase() === address?.toLowerCase()),
    [streams, address],
  );
  const list = tab === "incoming" ? incoming : outgoing;

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-5xl px-5 pb-24">
        {!isConnected ? (
          <Hero />
        ) : !isConfigured ? (
          <NotConfigured />
        ) : !onArc ? (
          <WrongNetwork />
        ) : (
          <section className="pt-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-semibold text-content-hi">Your streams</h1>
                <p className="mt-1 text-sm text-content-muted">
                  {incoming.length} incoming · {outgoing.length} outgoing
                </p>
              </div>
              <Button onClick={() => setDialogOpen(true)}>+ New stream</Button>
            </div>

            <div className="mb-6 inline-flex rounded-xl border border-surface-line p-1">
              {(["incoming", "outgoing"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-lg px-4 py-1.5 text-sm capitalize transition ${
                    tab === t ? "bg-surface-raised text-content-hi" : "text-content-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {isLoading && list.length === 0 ? (
              <SkeletonGrid />
            ) : list.length === 0 ? (
              <EmptyTab tab={tab} onNew={() => setDialogOpen(true)} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {list.map((s) => (
                  <StreamCard
                    key={s.id.toString()}
                    stream={s}
                    role={tab}
                    onChanged={refetch}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <NewStreamDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={refetch}
      />
    </div>
  );
}

/* ── Disconnected hero ──────────────────────────────────────────────────── */

function DemoTicker() {
  // Purely illustrative: a value that flows up, to show the idea before connect.
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = Date.now();
    let raf = 0;
    const loop = () => {
      setV(((Date.now() - start) / 1000) * 0.0231); // ~2 USDC/day-ish
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
    <section className="flex flex-col items-center pt-20 text-center sm:pt-28">
      <span className="mb-5 rounded-full border border-surface-line px-3 py-1 text-xs text-content-muted">
        On Arc · USDC streams · settles in under a second
      </span>
      <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-content-hi sm:text-5xl">
        Money that moves by the second.
      </h1>
      <p className="mt-4 max-w-xl text-content-muted">
        Flux streams USDC continuously instead of in lumps — salaries, vesting and subscriptions
        that flow in real time, that the recipient can withdraw anytime, and that the sender can
        stop the moment they choose.
      </p>

      <div className="my-10 w-full max-w-md rounded-xl2 border border-surface-line bg-surface p-6">
        <div className="text-xs uppercase tracking-wide text-content-faint">Streaming now</div>
        <div className="mt-1 text-4xl font-semibold">
          <DemoTicker /> <span className="text-base text-content-muted">USDC</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-900">
          <div className="current-bar animate-flow h-full w-2/3 rounded-full" />
        </div>
      </div>

      <ConnectButton label="Connect to start" />
    </section>
  );
}

/* ── States ─────────────────────────────────────────────────────────────── */

function WrongNetwork() {
  return (
    <Notice title="Switch to Arc Testnet">
      Flux runs on Arc Testnet (chain {arcTestnet.id}). Use the network button in the top right to
      switch, then your streams will appear here.
    </Notice>
  );
}

function NotConfigured() {
  return (
    <Notice title="Contract address not set">
      Deploy StreamVault, then set <code className="text-content-hi">NEXT_PUBLIC_STREAMVAULT_ADDRESS</code> in{" "}
      <code className="text-content-hi">web/.env.local</code> and restart. Until then there is
      nothing to read on-chain.
    </Notice>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-24 max-w-md rounded-xl2 border border-surface-line bg-surface p-6 text-center">
      <h2 className="font-display text-lg font-semibold text-content-hi">{title}</h2>
      <p className="mt-2 text-sm text-content-muted">{children}</p>
    </div>
  );
}

function EmptyTab({ tab, onNew }: { tab: "incoming" | "outgoing"; onNew: () => void }) {
  return (
    <div className="rounded-xl2 border border-dashed border-surface-line p-12 text-center">
      <p className="text-content-muted">
        {tab === "incoming"
          ? "No one is streaming to you yet."
          : "You haven't opened any streams."}
      </p>
      {tab === "outgoing" && (
        <div className="mt-4">
          <Button onClick={onNew}>Open your first stream</Button>
        </div>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl2 border border-surface-line bg-surface p-5">
          <div className="relative overflow-hidden">
            <div className="space-y-3">
              <div className="h-3 w-24 rounded bg-surface-line" />
              <div className="h-8 w-40 rounded bg-surface-line" />
              <div className="h-2 w-full rounded bg-surface-line" />
              <div className="h-9 w-28 rounded bg-surface-line" />
            </div>
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
        </div>
      ))}
    </div>
  );
}
