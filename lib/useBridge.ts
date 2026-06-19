"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
// Circle Bridge Kit — wraps CCTP V2 (approve → burn → attestation → mint).
// Install: npm install @circle-fin/bridge-kit @circle-fin/adapter-viem-v2
import { BridgeKit } from "@circle-fin/bridge-kit";
import { createAdapterFromProvider } from "@circle-fin/adapter-viem-v2";

const kit = new BridgeKit();

export type SupportedChain = {
  type: string;
  chain: string; // SDK id, e.g. "Arc_Testnet", "Base_Sepolia"
  name: string;
  isTestnet: boolean;
};

/** List of chains CCTP supports, provided by the SDK (no hardcoded addresses). */
export function useSupportedChains() {
  const [chains, setChains] = useState<SupportedChain[]>([]);
  useEffect(() => {
    try {
      Promise.resolve(kit.getSupportedChains() as SupportedChain[] | Promise<SupportedChain[]>)
        .then((list) => setChains(list ?? []))
        .catch(() => setChains([]));
    } catch {
      setChains([]);
    }
  }, []);
  return chains;
}

type BridgeArgs = { fromChain: string; toChain: string; amount: string };

export function useBridge() {
  const { connector, isConnected } = useAccount();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  const bridge = useCallback(
    async ({ fromChain, toChain, amount }: BridgeArgs) => {
      setError(null);
      setResult(null);

      if (!isConnected || !connector) {
        setError("Wallet not connected.");
        return;
      }

      setPending(true);
      try {
        // Correct way to get the raw EIP-1193 provider in wagmi v2.
        const provider = await connector.getProvider();
        if (!provider) {
          setError("Could not access the wallet provider.");
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adapter = await createAdapterFromProvider({ provider: provider as any });

        const res = await kit.bridge({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          from: { adapter, chain: fromChain as any },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          to: { adapter, chain: toChain as any },
          amount,
        });
        setResult(res);
        return res;
      } catch (e) {
        const err = e as { shortMessage?: string; message?: string };
        setError(err?.shortMessage || err?.message || "Bridge failed.");
        throw e;
      } finally {
        setPending(false);
      }
    },
    [connector, isConnected],
  );

  return {
    bridge,
    pending,
    error,
    result,
    clear: () => {
      setError(null);
      setResult(null);
    },
  };
}
