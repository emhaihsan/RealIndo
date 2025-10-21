import { type Web3AuthContextConfig } from "@web3auth/modal/react";
import { WEB3AUTH_NETWORK } from "@web3auth/modal";

// Get client ID from environment
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;

if (!clientId) {
  throw new Error("WEB3AUTH_CLIENT_ID is not set in environment variables");
}

// Web3Auth v10 configuration
// Chain configuration is now managed via Web3Auth Dashboard
// Go to https://dashboard.web3auth.io → Your Project → Chains
// Enable Base Sepolia (chainId: 84532 / 0x14a34) there
const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    uiConfig: {
      appName: "RealIndo",
      theme: {
        primary: "#7c3aed",
      },
      mode: "light",
      defaultLanguage: "en",
      loginGridCol: 3,
      primaryButton: "socialLogin",
    },
  },
};

export default web3AuthContextConfig;