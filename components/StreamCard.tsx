"use client";

import { useMemo } from "react";
import { Button, StatusPill } from "./ui";
import { LiveAmount } from "./LiveAmount";
import { useTx } from "@/lib/useTx";
import { STREAMVAULT_ADDRESS, streamVaultAbi, USDC_SYMBOL } from "@/lib/contracts";
import { formatUsdc, shortAddr, flowRatePerSec, formatDuration } from "@/lib/format";
import type { StreamRecord } from "@/lib/useStreams";

type Status = "scheduled" | "live" | "done" | "cancelled";

function statusOf(s: StreamRecord, nowSec: number): Status {
  if (s.cancelled) return "cancelled";
  if (nowSec < s.startTime) return "scheduled";
  if (nowSec >= s.endTime) return "done";
  return "live";
}

export function StreamCard({
  stream,
  role,
  onChanged,
}: {
  stream: StreamRecord;
  role: "incoming" | "outgoing";
  onChanged: () => void;
}) {
  const { run, pending, error } = useTx();
  const nowSec = Math.floor(Date.now() / 1000);
  const status = statusOf(stream, nowSec);

  const counterpart = role === "incoming" ? stream.sender : stream.recipient;
  const progress = useMemo(() => {
    if (stream.cancelled) return Number(stream.withdrawn) / Math.max(1, Number(stream.deposited));
    if (nowSec <= stream.startTime) return 0;
    if (nowSec >= stream.endTime) return 1;
    return (nowSec - stream.startTime) / (stream.endTime - stream.startTime);
  }, [stream, nowSec]);

  const rate = flowRatePerSec(stream.deposited, stream.startTime, stream.endTime);
  const remaining = Math.max(0, stream.endTime - nowSec);

  async function withdraw() {
    await run({
      address: STREAMVAULT_ADDRESS,
      abi: streamVaultAbi as never,
      functionName: "withdraw",
      args: [stream.id],
    });
    onChanged();
  }
  async function cancel() {
    await run({
      address: STREAMVAULT_ADDRESS,
      abi: streamVaultAbi as never,
      functionName: "cancel",
      args: [stream.id],
    });
    onChanged();
  }

  const accent = role === "incoming" ? "text-flow-aqua" : "text-amber";
  const isActive = status === "live" || status === "scheduled";

  return (
    <div className="animate-fadeUp rounded-xl2 border border-surface-line bg-surface p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-content-muted">
            <span>#{stream.id.toString()}</span>
            <span>·</span>
            <span>{role === "incoming" ? "from" : "to"}</span>
            <span className="font-mono text-content">{shortAddr(counterpart)}</span>
          </div>
          <div className="mt-1 text-sm text-content-muted">
            {formatUsdc(stream.deposited)} {USDC_SYMBOL} over{" "}
            {formatDuration(stream.endTime - stream.startTime)}
            {rate > 0 && (
              <span className="text-content-faint">
                {" "}
                · {rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4)}/s
              </span>
            )}
          </div>
        </div>
        <StatusPill kind={status} />
      </div>

      {/* The live figure — the thing you watch. */}
      <div className="mb-1 flex items-baseline gap-2">
        <span className={`text-3xl font-semibold ${accent}`}>
          <LiveAmount stream={stream} mode={role === "incoming" ? "claimable" : "vested"} />
        </span>
        <span className="text-sm text-content-muted">{USDC_SYMBOL}</span>
      </div>
      <div className="mb-4 text-xs text-content-muted">
        {role === "incoming" ? (
          <>
            claimable now · {formatUsdc(stream.withdrawn)} withdrawn of{" "}
            {formatUsdc(stream.deposited)}
          </>
        ) : (
          <>streamed so far of {formatUsdc(stream.deposited)}</>
        )}
      </div>

      {/* Flow meter */}
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-ink-900">
        <div
          className={`h-full rounded-full ${isActive && !stream.cancelled ? "current-bar animate-flow" : "bg-surface-line"}`}
          style={{ width: `${Math.min(100, Math.max(0, progress * 100)).toFixed(2)}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        {role === "incoming" && status !== "cancelled" && (
          <Button onClick={withdraw} loading={pending} disabled={status === "scheduled"}>
            Withdraw
          </Button>
        )}
        {status !== "cancelled" && status !== "done" && (
          <Button variant="danger" onClick={cancel} loading={pending}>
            {role === "outgoing" ? "Cancel & refund" : "Stop stream"}
          </Button>
        )}
        {status === "live" && (
          <span className="ml-auto text-xs text-content-faint">{formatDuration(remaining)} left</span>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-danger">{error}</p>}
    </div>
  );
}
