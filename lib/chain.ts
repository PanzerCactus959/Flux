import { defineChain } from "viem";

/**
 * Arc Testnet.
 *
 * Note: recent versions of viem also export `arcTestnet` from "viem/chains".
 * We define it locally so the app does not depend on a specific viem version
 * shipping it, and so the config is auditable in one place.
 *
 * IMPORTANT: the *native* currency on Arc is USDC with 18 decimals (used for
 * gas and msg.value). The USDC *ERC-20 interface* we transact with in the app
 * is the same asset but exposed at 6 decimals — see lib/contracts.ts.
 */
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
      webSocket: ["wss://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: { name: "Arcscan", url: "https://testnet.arcscan.app" },
  },
  contracts: {
    multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
  },
  testnet: true,
});
