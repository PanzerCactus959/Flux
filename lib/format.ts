import { formatUnits, parseUnits } from "viem";
import { USDC_DECIMALS } from "./contracts";

/** Parse a human USDC string ("12.5") into 6-decimal base units. */
export function parseUsdc(value: string): bigint {
  return parseUnits(value || "0", USDC_DECIMALS);
}

/** Format 6-decimal base units to a human string with up to `dp` decimals. */
export function formatUsdc(value: bigint, dp = 2): string {
  const full = formatUnits(value, USDC_DECIMALS);
  const n = Number(full);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

/** Truncate an address: 0x1234…cDeF */
export function shortAddr(addr?: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Compact, human duration between two unix-second timestamps. */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0s";
  const units: [number, string][] = [
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
    [1, "s"],
  ];
  const parts: string[] = [];
  let rem = Math.floor(seconds);
  for (const [size, label] of units) {
    if (rem >= size) {
      const v = Math.floor(rem / size);
      rem -= v * size;
      parts.push(`${v}${label}`);
    }
    if (parts.length === 2) break;
  }
  return parts.join(" ");
}

/**
 * Vested base units at time `nowSec`, mirroring the contract's _vested():
 * linear between start and end, clamped, frozen if cancelled.
 */
export function vestedAt(
  s: {
    deposited: bigint;
    withdrawn: bigint;
    startTime: number;
    endTime: number;
    cancelled: boolean;
  },
  nowSec: number,
): bigint {
  if (s.cancelled) return s.withdrawn;
  if (nowSec <= s.startTime) return 0n;
  if (nowSec >= s.endTime) return s.deposited;
  const elapsed = BigInt(nowSec - s.startTime);
  const duration = BigInt(s.endTime - s.startTime);
  return (s.deposited * elapsed) / duration;
}

/** Tokens-per-second flow rate for display ("$0.0023 / sec"). */
export function flowRatePerSec(deposited: bigint, startTime: number, endTime: number): number {
  const dur = endTime - startTime;
  if (dur <= 0) return 0;
  return Number(formatUnits(deposited, USDC_DECIMALS)) / dur;
}
