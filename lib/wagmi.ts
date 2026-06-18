import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { arcTestnet } from "./chain";

/**
 * A WalletConnect/Reown projectId is only required for connecting *mobile*
 * wallets via QR. Browser-extension wallets (MetaMask, Rabby, Coinbase) work
 * with the placeholder. Get a free id at https://dashboard.reown.com and set
 * NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to enable mobile wallets.
 */
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "PLACEHOLDER_PROJECT_ID";

export const wagmiConfig = getDefaultConfig({
  appName: "Flux",
  projectId,
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http("https://rpc.testnet.arc.network"),
  },
  ssr: true,
});
