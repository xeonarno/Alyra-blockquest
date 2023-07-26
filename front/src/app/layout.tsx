"use client"
import './globals.css';
import { ChakraProvider } from '@chakra-ui/react';

import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import {
  hardhat,
  sepolia
} from "wagmi/chains";

import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

import {
  OwnerContextProvider
} from '@/context/owner';
import { GamerContextProvider } from '@/context/gamer';

const providers = [publicProvider(), alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY } as any)];
const { chains, publicClient } = configureChains([hardhat, sepolia], providers as any);
const { connectors } = getDefaultWallets({
  appName: "BlockQuest App",
  projectId: process.env.NEXT_PUBLIC_WAGMI as string,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={wagmiConfig}>
          <OwnerContextProvider>
            <GamerContextProvider>
              <RainbowKitProvider coolMode chains={chains}>
                <ChakraProvider>

                  {children}

                </ChakraProvider>
              </RainbowKitProvider>
            </GamerContextProvider>
          </OwnerContextProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}
