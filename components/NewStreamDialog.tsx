"use client";

import { useEffect, useMemo, useState } from "react";
import { isAddress } from "viem";
import { useAccount, useConfig } from "wagmi";
import { readContract } from "@wagmi/core";
import { Button, Field } from "./ui";
import { useTx, humanizeError } from "@/lib/useTx";
import {
  STREAMVAULT_ADDRESS,
  streamVaultAbi,
  USDC_ADDRESS,
  usdcAbi,
  USDC_SYMBOL,
} from "@/lib/contracts";
import { parseUsdc } from "@/lib/format";

const PRESETS: { label: string; seconds: number }[] = [
  { label: "1 hour", seconds: 3600 },
  { label: "1 day", seconds: 86400 },
  { label: "7 days", seconds: 604800 },
  { label: "30 days", seconds: 2592000 },
];

const inputCls =
  "w-full rounded-xl border border-surface-line bg-ink-900 px-3.5 py-2.5 text-content-hi placeholder:text-content-faint focus:border-flow-peri";

export function NewStreamDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { address } = useAccount();
  const config = useConfig();
  const { run, pending } = useTx();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [seconds, setSeconds] = useState(PRESETS[1].seconds);
  const [customDays, setCustomDays] = useState("");
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setRecipient("");
      setAmount("");
      setSeconds(PRESETS[1].seconds);
      setCustomDays("");
      setStep(null);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onClose]);

  const recipientValid = isAddress(recipient) && recipient.toLowerCase() !== address?.toLowerCase();
  const amountValid = useMemo(() => {
    try {
      return parseUsdc(amount) > 0n;
    } catch {
      return false;
    }
  }, [amount]);
  const durationSeconds = customDays ? Math.floor(Number(customDays) * 86400) : seconds;
  const valid = recipientValid && amountValid && durationSeconds > 0;

  async function submit() {
    if (!valid || !address) return;
    setError(null);
    const amt = parseUsdc(amount);
    try {
      // 1. Approve only if the current allowance is short.
      const allowance = (await readContract(config, {
        address: USDC_ADDRESS,
        abi: usdcAbi,
        functionName: "allowance",
        args: [address, STREAMVAULT_ADDRESS],
      })) as bigint;

      if (allowance < amt) {
        setStep(`Approving ${USDC_SYMBOL}…`);
        await run({
          address: USDC_ADDRESS,
          abi: usdcAbi as never,
          functionName: "approve",
          args: [STREAMVAULT_ADDRESS, amt],
        });
      }

      // 2. Open the stream, starting now.
      setStep("Opening stream…");
      const start = BigInt(Math.floor(Date.now() / 1000));
      const end = start + BigInt(durationSeconds);
      await run({
        address: STREAMVAULT_ADDRESS,
        abi: streamVaultAbi as never,
        functionName: "createStream",
        args: [recipient as `0x${string}`, amt, start, end],
      });

      setStep(null);
      onCreated();
      onClose();
    } catch (e) {
      setStep(null);
      setError(humanizeError(e));
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Open a new stream"
        className="animate-fadeUp w-full max-w-md rounded-xl2 border border-surface-line bg-surface p-6"
      >
        <h2 className="font-display text-xl font-semibold text-content-hi">New stream</h2>
        <p className="mb-5 mt-1 text-sm text-content-muted">
          Escrow {USDC_SYMBOL} now; it streams to the recipient continuously.
        </p>

        <div className="space-y-4">
          <Field label="Recipient" hint="An Arc address (0x…). Cannot be yourself.">
            <input
              className={inputCls}
              placeholder="0x…"
              value={recipient}
              spellCheck={false}
              onChange={(e) => setRecipient(e.target.value.trim())}
            />
          </Field>

          <Field label={`Amount (${USDC_SYMBOL})`}>
            <input
              className={inputCls}
              inputMode="decimal"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          </Field>

          <Field label="Duration">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setSeconds(p.seconds);
                    setCustomDays("");
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                    !customDays && seconds === p.seconds
                      ? "border-flow-peri bg-flow-peri/10 text-content-hi"
                      : "border-surface-line text-content-muted hover:text-content"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <input
                className="w-28 rounded-lg border border-surface-line bg-ink-900 px-3 py-1.5 text-sm text-content-hi placeholder:text-content-faint"
                inputMode="decimal"
                placeholder="custom days"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value.replace(/[^0-9.]/g, ""))}
              />
            </div>
          </Field>
        </div>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} loading={pending} disabled={!valid}>
            {step ?? "Open stream"}
          </Button>
        </div>
      </div>
    </div>
  );
}
