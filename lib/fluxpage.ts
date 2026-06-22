/** Flux Page — a shareable streaming-payment profile encoded entirely in the URL. */
import { buildPayPath } from "./paylink";

export type Tier = { label: string; amount: string; durationSec: number };
export type FluxProfile = {
  to: string;
  name: string;
  bio?: string;
  accent?: "aqua" | "peri" | "violet";
  tiers: Tier[];
};

export const ACCENTS: Record<string, string> = {
  aqua: "#36E0C8",
  peri: "#6E8BFF",
  violet: "#B57BFF",
};

function toB64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeProfile(p: FluxProfile): string {
  return toB64Url(JSON.stringify(p));
}

export function decodeProfile(d: string): FluxProfile | null {
  try {
    const p = JSON.parse(fromB64Url(d)) as FluxProfile;
    if (!p || typeof p.to !== "string" || !Array.isArray(p.tiers)) return null;
    return p;
  } catch {
    return null;
  }
}

export function buildPagePath(p: FluxProfile): string {
  return `/p?d=${encodeProfile(p)}`;
}

/** Each tier links straight into the existing /pay checkout. */
export function tierPayPath(to: string, tier: Tier): string {
  return buildPayPath({
    to,
    amount: tier.amount || undefined,
    durationSec: tier.durationSec || undefined,
    label: tier.label || undefined,
  });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
