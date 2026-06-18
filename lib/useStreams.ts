"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useReadContracts } from "wagmi";
import { STREAMVAULT_ADDRESS, streamVaultAbi, DEPLOY_BLOCK } from "./contracts";

export type StreamRecord = {
  id: bigint;
  sender: `0x${string}`;
  recipient: `0x${string}`;
  deposited: bigint;
  withdrawn: bigint;
  startTime: number;
  endTime: number;
  cancelled: boolean;
};

const ZERO = "0x0000000000000000000000000000000000000000";
export const isConfigured = STREAMVAULT_ADDRESS.toLowerCase() !== ZERO;

/**
 * Discover every stream id involving `address`, as either sender or recipient,
 * from the indexed StreamCreated logs. We rely on logs (not on-chain
 * enumeration) to keep the contract minimal; Arc emits standard logs for this.
 */
function useStreamIds(address?: `0x${string}`) {
  const client = usePublicClient();
  return useQuery({
    queryKey: ["flux:ids", address, STREAMVAULT_ADDRESS],
    enabled: Boolean(client && address && isConfigured),
    refetchInterval: 15_000,
    queryFn: async (): Promise<bigint[]> => {
      const [sent, received] = await Promise.all([
        client!.getContractEvents({
          address: STREAMVAULT_ADDRESS,
          abi: streamVaultAbi,
          eventName: "StreamCreated",
          args: { sender: address },
          fromBlock: DEPLOY_BLOCK,
          toBlock: "latest",
        }),
        client!.getContractEvents({
          address: STREAMVAULT_ADDRESS,
          abi: streamVaultAbi,
          eventName: "StreamCreated",
          args: { recipient: address },
          fromBlock: DEPLOY_BLOCK,
          toBlock: "latest",
        }),
      ]);
      const ids = new Set<bigint>();
      for (const log of [...sent, ...received]) {
        const id = (log as { args: { id?: bigint } }).args.id;
        if (id !== undefined) ids.add(id);
      }
      // Newest first.
      return Array.from(ids).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    },
  });
}

/** Full, live stream records for the connected address. */
export function useMyStreams(address?: `0x${string}`) {
  const { data: ids, isLoading: idsLoading, refetch: refetchIds } = useStreamIds(address);

  const contracts = (ids ?? []).map((id) => ({
    address: STREAMVAULT_ADDRESS,
    abi: streamVaultAbi,
    functionName: "getStream" as const,
    args: [id] as const,
  }));

  const {
    data,
    isLoading: structsLoading,
    refetch: refetchStructs,
  } = useReadContracts({
    contracts,
    query: { enabled: contracts.length > 0, refetchInterval: 15_000 },
  });

  const streams: StreamRecord[] = [];
  (ids ?? []).forEach((id, i) => {
    const r = data?.[i];
    if (!r || r.status !== "success" || !r.result) return;
    const s = r.result as {
      sender: `0x${string}`;
      recipient: `0x${string}`;
      deposited: bigint;
      withdrawn: bigint;
      startTime: bigint;
      endTime: bigint;
      cancelled: boolean;
    };
    streams.push({
      id,
      sender: s.sender,
      recipient: s.recipient,
      deposited: s.deposited,
      withdrawn: s.withdrawn,
      startTime: Number(s.startTime),
      endTime: Number(s.endTime),
      cancelled: s.cancelled,
    });
  });

  return {
    streams,
    isLoading: idsLoading || (contracts.length > 0 && structsLoading),
    refetch: () => {
      refetchIds();
      refetchStructs();
    },
  };
}
