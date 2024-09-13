'use client'


// 1. Import modules
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/configs/wallet";
import { ConfigProvider } from "antd";
// 2. Set up a React Query client.
const queryClient = new QueryClient();

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}