'use client'

import dynamic from 'next/dynamic'
import {
//   useConnection,
//   useWallet,
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { getSession, SessionProvider } from "next-auth/react"
import { Session } from 'next-auth'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { ReactNode, useMemo, useState, useEffect } from 'react'
import { Cluster, clusterApiUrl } from '@solana/web3.js'

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletButton = dynamic(async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton, {
  ssr: false,
})

export function SolanaProvider({ children }: { children: ReactNode }) {
  const cluster:Cluster  = "devnet"
  const endpoint = useMemo(() => clusterApiUrl(cluster), [cluster])

  const [session, setSession] = useState<Session|null>(null);
  
    useEffect(() => {
      const fetchSession = async () => {
        const fetchedSession = await getSession();
        setSession(fetchedSession);
      };
      
      fetchSession();
    }, []);

  const wallets = useMemo(() => {
    return [
      new PhantomWalletAdapter(),
    ].filter((item) => item && item.name && item.icon);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <SessionProvider session={session} refetchInterval={0}>
          {children}
          </SessionProvider>
          </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}