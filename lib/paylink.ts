/** Encode/decode Flux payment-request links (/pay?to=...&amt=...&dur=...&label=...). */
export type PayRequest = {
  to: string;
  amount?: string; // human USDC, e.g. "100"
  durationSec?: number; // stream length in seconds
  label?: string; // optional note
};

export function buildPayPath(req: PayRequest): string {
  const p = new URLSearchParams();
  p.set("to", req.to);
  if (req.amount) p.set("amt", req.amount);
  if (req.durationSec) p.set("dur", String(req.durationSec));
  if (req.label) p.set("label", req.label);
  return `/pay?${p.toString()}`;
}

export const DURATION_PRESETS: { label: string; seconds: number }[] = [
  { label: "1 hour", seconds: 3600 },
  { label: "1 day", seconds: 86400 },
  { label: "7 days", seconds: 604800 },
  { label: "30 days", seconds: 2592000 },
];
