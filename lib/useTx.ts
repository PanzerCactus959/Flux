"use client";

import { useCallback, useState } from "react";
import { useConfig } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import type { Abi } from "viem";

export function humanizeError(e: unknown): string {
  const err = e as { shortMessage?: string; message?: string; name?: string };
  const msg = err?.shortMessage || err?.message || "Something went wrong.";
  if (/User rejected|denied|rejected the request/i.test(msg)) return "Request cancelled.";
  if (/insufficient funds/i.test(msg)) return "Not enough USDC to cover gas and amount.";
  // Surface the first line only — full traces belong in the console.
  return msg.split("\n")[0];
}

type WriteParams = {
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args: readonly unknown[];
};

/** Run a write tx and wait for inclusion. Single source of pending/error state. */
export function useTx() {
  const config = useConfig();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (params: WriteParams) => {
      setError(null);
      setPending(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hash = await writeContract(config, params as any);
        await waitForTransactionReceipt(config, { hash });
        return hash;
      } catch (e) {
        setError(humanizeError(e));
        throw e;
      } finally {
        setPending(false);
      }
    },
    [config],
  );

  return { run, pending, error, setError };
}
