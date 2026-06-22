"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui";
import { decodeProfile, tierPayPath, ACCENTS, initials, type FluxProfile } from "@/lib/fluxpage";
import { useMyStreams, isConfigured } from "@/lib/useStreams";
import { shortAddr, formatDuration, flowRatePerSec } from "@/lib/format";

export default function PublicPage() {
  return (
    <Suspense fallback={<Shell><p className="text-content-muted">Loading…</p></Shell>}>
      <PageInner />
    </Suspense>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-24 pt-12">{children}</main>
      <Footer />
    </div>
  );
}

function PageInner() {
  const params = useSearchParams();
  const profile = useMemo(() => decodeProfile(params.get("d") || ""), [params]);

  if (!profile) {
    return (
      <Shell>
        <div className="rounded-xl2 border border-surface-line bg-surface p-7 text-center">
          <h1 className="font-display text-xl font-semibold text-content-hi">Page not found</h1>
          <p className="mt-2 text-sm text-content-muted">This Flux Page link looks invalid.</p>
          <Link href="/page" className="mt-4 inline-block">
            <Button variant="ghost">Create your own →</Button>
          </Link>
        </div>
      </Shell>
    );
  }

  const accentColor = ACCENTS[profile.accent ?? "aqua"];

  return (
    <Shell>
      {/* Profile header */}
      <div className="flex flex-col items-center text-center">
        <div
          className="grid h-20 w-20 place-items-center rounded-full font-display text-2xl font-semibold"
          style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
        >
          {initials(profile.name)}
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-content-hi">{profile.name}</h1>
        {profile.bio && <p className="mt-1 text-content-muted">{profile.bio}</p>}
        <p className="mt-1 font-mono text-xs text-content-faint">{shortAddr(profile.to)}</p>
        {isConfigured && <LiveInflow to={profile.to} accent={accentColor} />}
      </div>

      {/* Tiers */}
      <div className="mt-8 space-y-3">
        <div className="text-center text-xs uppercase tracking-wide text-content-faint">
          Pick a tier to start streaming
        </div>
        {profile.tiers.map((t, i) => (
          <Link
            key={i}
            href={tierPayPath(profile.to, t)}
            className="flex items-center justify-between rounded-xl2 border border-surface-line bg-surface px-5 py-4 transition hover:border-flow-peri"
          >
            <div>
              <div className="font-medium text-content-hi">{t.label}</div>
              <div className="text-sm text-content-muted">over {formatDuration(t.durationSec)}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg text-content-hi">{t.amount} USDC</div>
              <div className="text-xs" style={{ color: accentColor }}>
                Stream →
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-content-faint">
        Powered by Flux — stream USDC on Arc. You will connect your own wallet to pay.
      </p>
    </Shell>
  );
}

function LiveInflow({ to, accent }: { to: string; accent: string }) {
  const { streams } = useMyStreams(to as `0x${string}`);
  const ratePerDay = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return streams
      .filter(
        (s) =>
          s.recipient.toLowerCase() === to.toLowerCase() && !s.cancelled && now < s.endTime,
      )
      .reduce((acc, s) => acc + flowRatePerSec(s.deposited, s.startTime, s.endTime) * 86400, 0);
  }, [streams, to]);

  if (ratePerDay <= 0) return null;
  return (
    <div className="mt-3 text-sm" style={{ color: accent }}>
      ≈ {ratePerDay.toFixed(2)} USDC/day streaming in right now
    </div>
  );
}
