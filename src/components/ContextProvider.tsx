'use client'

import dynamic from 'next/dynamic'
import {
//   useConnection,
//   useWallet,
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { ReactNode, useMemo } from 'react'
import { Cluster, clusterApiUrl } from '@solana/web3.js'

require('@solana/wallet-adapter-react-ui/styles.css')

export const WalletButton = dynamic(async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton, {
  ssr: false,
})

export function SolanaProvider({ children }: { children: ReactNode }) {
  const cluster:Cluster  = "devnet"
  const endpoint = useMemo(() => clusterApiUrl(cluster), [cluster])

  const wallets = useMemo(() => {
    return [
      new PhantomWalletAdapter(),
    ].filter((item) => item && item.name && item.icon);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          {children}
          </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}