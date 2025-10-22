import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";

const BASE_SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL!;

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(BASE_SEPOLIA_RPC_URL),
  },
});
