/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import dynamic from 'next/dynamic'
import {
//   useConnection,
//   useWallet,
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { getSession, SessionProvider } from "next-auth/react"
import { Session, getServerSession } from 'next-auth'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { ReactNode, useMemo, useState, useEffect } from 'react'
import { Cluster, clusterApiUrl } from '@solana/web3.js'

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletButton = dynamic(async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton, {
  ssr: true,
})

export function SolanaProvider({ children, session }: { children: ReactNode, session: Session|null }) {
  const cluster:Cluster  = "devnet"
  const endpoint = useMemo(() => clusterApiUrl(cluster), [cluster]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()].filter((item) => item && item.name && item.icon), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <SessionProvider session={session}>
          {children}
          </SessionProvider>
          </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}