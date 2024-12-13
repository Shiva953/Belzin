/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { PublicGroupChat } from './public-group-chat'
import { PublicChat } from '@/components/chat/public/page'
import { PrivateDMRoomChat } from './private-dms'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'

// const PublicChat = dynamic(() => import('@/components/chat/public/page'), {
//   ssr: false,
// })

export function ChatArea() {
  const pathname = usePathname()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const { connected, publicKey } = useWallet()

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Please connect your wallet to start chatting.</p>
      </div>
    )
  }

  const userId = publicKey?.toString() || '';
  return (
    <div className="flex-1 flex">
      {pathname === '/' ? (
        // <PublicGroupChat onStartDM={setSelectedUser} />
        <PublicChat userId={userId}/>
      ) : (
        <PrivateDMRoomChat/>
      )}
    </div>
  )
}