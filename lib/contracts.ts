import { streamVaultAbi } from "./streamVaultAbi";

/** StreamVault address — set after deploy in web/.env.local. */
export const STREAMVAULT_ADDRESS = (process.env.NEXT_PUBLIC_STREAMVAULT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

/** USDC ERC-20 interface on Arc Testnet (6 decimals). */
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS ||
  "0x3600000000000000000000000000000000000000") as `0x${string}`;

export const USDC_DECIMALS = 6;
export const USDC_SYMBOL = "USDC";

/**
 * Block at which StreamVault was deployed. Setting this makes event log
 * scanning fast — otherwise we scan from genesis. Copy the deployment block
 * from the broadcast receipt into NEXT_PUBLIC_DEPLOY_BLOCK.
 */
export const DEPLOY_BLOCK = BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0");

export { streamVaultAbi };

/** Minimal USDC ERC-20 ABI: just what the app calls. */
export const usdcAbi = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;
