"use client";

import { useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { StreamCard } from "@/components/StreamCard";
import { NewStreamDialog } from "@/components/NewStreamDialog";
import { Button } from "@/components/ui";
import { useMyStreams, isConfigured } from "@/lib/useStreams";
import { arcTestnet } from "@/lib/chain";

export default function AppPage() {
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
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24">
        {!isConnected ? (
          <ConnectPrompt />
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
                  <StreamCard key={s.id.toString()} stream={s} role={tab} onChanged={refetch} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />

      <NewStreamDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={refetch} />
    </div>
  );
}

function ConnectPrompt() {
  return (
    <div className="mx-auto mt-24 max-w-md rounded-xl2 border border-surface-line bg-surface p-8 text-center">
      <h1 className="font-display text-2xl font-semibold text-content-hi">Connect your wallet</h1>
      <p className="mb-6 mt-2 text-sm text-content-muted">
        Connect on Arc Testnet to open streams and watch incoming payments flow in real time.
      </p>
      <div className="flex justify-center">
        <ConnectButton label="Connect wallet" />
      </div>
    </div>
  );
}

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
      Set <code className="text-content-hi">NEXT_PUBLIC_STREAMVAULT_ADDRESS</code> in your
      environment, then redeploy. Until then there is nothing to read on-chain.
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
        {tab === "incoming" ? "No one is streaming to you yet." : "You haven't opened any streams."}
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
