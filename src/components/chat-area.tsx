'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { PublicGroupChat } from './public-group-chat'
import { PrivateDMs } from './private-dms'
import { useWallet } from '@solana/wallet-adapter-react'

export function ChatArea() {
  const pathname = usePathname()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const { connected } = useWallet()

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Please connect your wallet to start chatting.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex">
      {pathname === '/' ? (
        <PublicGroupChat onStartDM={setSelectedUser} />
      ) : (
        <PrivateDMs selectedUser={selectedUser} />
      )}
    </div>
  )
}