"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger" | "subtle";

const variants: Record<Variant, string> = {
  primary:
    "bg-flow-peri text-ink-base hover:brightness-110 font-medium shadow-[0_0_24px_-6px_rgba(110,139,255,0.6)]",
  danger: "bg-transparent text-danger border border-danger/40 hover:bg-danger/10",
  ghost: "bg-transparent text-content hover:bg-surface-raised border border-surface-line",
  subtle: "bg-surface-raised text-content-hi hover:bg-surface-line",
};

export function Button({
  children,
  variant = "primary",
  loading,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export function Logo({ size = 26 }: { size?: number }) {
  // Three offset "currents" flowing right — the brand's one idea: value in motion.
  const id = "fluxgrad";
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="32" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#36E0C8" />
            <stop offset="0.5" stopColor="#6E8BFF" />
            <stop offset="1" stopColor="#B57BFF" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="#141829" />
        <path
          d="M7 11.5h13.5c2.2 0 4 1.8 4 4"
          stroke={`url(#${id})`}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path d="M7 16.5h11" stroke={`url(#${id})`} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M7 21.5h7.5" stroke={`url(#${id})`} strokeWidth="2.6" strokeLinecap="round" opacity="0.7" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight text-content-hi">Flux</span>
    </span>
  );
}

export function StatusPill({ kind }: { kind: "live" | "scheduled" | "done" | "cancelled" }) {
  const map = {
    live: ["Streaming", "text-flow-aqua", "bg-flow-aqua/10"],
    scheduled: ["Scheduled", "text-content-muted", "bg-surface-line/60"],
    done: ["Completed", "text-flow-peri", "bg-flow-peri/10"],
    cancelled: ["Cancelled", "text-content-muted", "bg-surface-line/60"],
  } as const;
  const [label, color, bg] = map[kind];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${color} ${bg}`}>
      {kind === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {label}
    </span>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-content-hi">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-content-muted">{hint}</span>}
    </label>
  );
}
