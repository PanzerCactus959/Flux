"use client";

import { useEffect, useRef, useState } from "react";
import { formatUnits } from "viem";
import { USDC_DECIMALS } from "@/lib/contracts";
import type { StreamRecord } from "@/lib/useStreams";

/**
 * Computes a stream's live value in USDC (as a float) and updates it every
 * animation frame so digits visibly move. This is a *display* interpolation of
 * the same linear formula the contract enforces; the on-chain figures are
 * refetched periodically by the data hooks, so the ticker stays honest.
 *
 * mode "vested"    → total streamed so far (sender's view of what's left their hands)
 * mode "claimable" → vested minus already-withdrawn (recipient's spendable now)
 */
function computeValue(s: StreamRecord, mode: "vested" | "claimable", nowMs: number): number {
  const deposited = Number(formatUnits(s.deposited, USDC_DECIMALS));
  const withdrawn = Number(formatUnits(s.withdrawn, USDC_DECIMALS));
  if (s.cancelled) return mode === "vested" ? withdrawn : 0;

  const nowSec = nowMs / 1000;
  let vested: number;
  if (nowSec <= s.startTime) vested = 0;
  else if (nowSec >= s.endTime) vested = deposited;
  else vested = (deposited * (nowSec - s.startTime)) / (s.endTime - s.startTime);

  return mode === "vested" ? vested : Math.max(0, vested - withdrawn);
}

export function LiveAmount({
  stream,
  mode,
  decimals = 6,
  className = "",
}: {
  stream: StreamRecord;
  mode: "vested" | "claimable";
  decimals?: number;
  className?: string;
}) {
  const [value, setValue] = useState(() => computeValue(stream, mode, Date.now()));
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const active = !stream.cancelled && Date.now() / 1000 < stream.endTime;
    // Static streams (done/cancelled) don't need an animation loop.
    if (!active) {
      setValue(computeValue(stream, mode, Date.now()));
      return;
    }
    const tick = () => {
      setValue(computeValue(stream, mode, Date.now()));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [stream, mode]);

  const [whole, frac] = value
    .toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    .split(".");

  return (
    <span className={`tnum font-mono ${className}`}>
      {whole}
      {frac !== undefined && <span className="text-content-muted">.{frac}</span>}
    </span>
  );
}
