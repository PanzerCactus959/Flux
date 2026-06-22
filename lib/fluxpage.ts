/** Flux Page — a shareable streaming-payment profile encoded compactly in the URL. */
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

// Compact codes keep the encoded link short.
const ACC_TO: Record<string, string> = { aqua: "a", peri: "p", violet: "v" };
const ACC_FROM: Record<string, FluxProfile["accent"]> = { a: "aqua", p: "peri", v: "violet" };
const DUR_TO: Record<number, number> = { 3600: 0, 86400: 1, 604800: 2, 2592000: 3 };
const DUR_FROM: Record<number, number> = { 0: 3600, 1: 86400, 2: 604800, 3: 2592000 };

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
  // Short keys + duration codes; drop the "0x" prefix and empty fields.
  const o: Record<string, unknown> = {
    t: p.to.startsWith("0x") ? p.to.slice(2) : p.to,
    n: p.name,
    a: ACC_TO[p.accent ?? "aqua"] ?? "a",
    k: p.tiers.map((tr) => [tr.label, tr.amount, DUR_TO[tr.durationSec] ?? tr.durationSec]),
  };
  if (p.bio) o.b = p.bio;
  return toB64Url(JSON.stringify(o));
}

export function decodeProfile(d: string): FluxProfile | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o: any = JSON.parse(fromB64Url(d));
    // Accept both the compact format and the older verbose one.
    const rawTo: string = o.t ?? o.to;
    if (typeof rawTo !== "string") return null;
    const to = rawTo.startsWith("0x") ? rawTo : `0x${rawTo}`;
    const tiersRaw: unknown[] = o.k ?? o.tiers ?? [];
    if (!Array.isArray(tiersRaw)) return null;
    const tiers: Tier[] = tiersRaw.map((x) => {
      if (Array.isArray(x)) {
        const dc = Number(x[2]);
        return { label: String(x[0]), amount: String(x[1]), durationSec: DUR_FROM[dc] ?? dc };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = x as any;
      return { label: String(t.label), amount: String(t.amount), durationSec: Number(t.durationSec) };
    });
    return {
      to,
      name: String(o.n ?? o.name ?? ""),
      bio: o.b ?? o.bio ?? undefined,
      accent: ACC_FROM[o.a] ?? o.accent ?? "aqua",
      tiers,
    };
  } catch {
    return null;
  }
}

export function buildPagePath(p: FluxProfile): string {
  return `/p?d=${encodeProfile(p)}`;
}

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
