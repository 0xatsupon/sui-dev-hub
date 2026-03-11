"use client";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";
import { ZkLoginProvider } from "@/context/ZkLoginContext";
import { ToastProvider } from "@/components/Toast";

const queryClient = new QueryClient();
const networks = { testnet: { url: "https://fullnode.testnet.sui.io:443", network: "testnet" as const } };

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <ZkLoginProvider><ToastProvider>{children}</ToastProvider></ZkLoginProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
