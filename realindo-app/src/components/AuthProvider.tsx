"use client";

import { ReactNode } from "react";
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "@/lib/web3auth";

import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider>{children}</WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}
