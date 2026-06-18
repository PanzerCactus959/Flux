"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { STREAMVAULT_ADDRESS, streamVaultAbi } from "./contracts";

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
 * Tìm stream bằng cách duyệt id (1..nextStreamId-1) và đọc qua multicall,
 * rồi lọc theo ví đang kết nối. Tránh eth_getLogs — RPC công khai của Arc
 * từ chối truy vấn dải block rộng với lỗi HTTP 413.
 */
export function useMyStreams(address?: `0x${string}`) {
  const {
    data: nextId,
    isLoading: idLoading,
    refetch: refetchNext,
  } = useReadContract({
    address: STREAMVAULT_ADDRESS,
    abi: streamVaultAbi,
    functionName: "nextStreamId",
    query: { enabled: isConfigured, refetchInterval: 15_000 },
  });

  const count = nextId ? Number(nextId) - 1 : 0;
  const ids: bigint[] = [];
  for (let i = count; i >= 1; i--) ids.push(BigInt(i)); // mới nhất trước

  const contracts = ids.map((id) => ({
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
  ids.forEach((id, i) => {
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
    if (
      address &&
      s.sender.toLowerCase() !== address.toLowerCase() &&
      s.recipient.toLowerCase() !== address.toLowerCase()
    ) {
      return; // không phải của mình
    }
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
    isLoading: idLoading || (contracts.length > 0 && structsLoading),
    refetch: () => {
      refetchNext();
      refetchStructs();
    },
  };
}
