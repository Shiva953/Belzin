/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PublicGroupChat } from './public-group-chat'
import { PublicChat } from '@/components/chat/public/page'
import { PrivateDMRoomChat } from './private-dms'
import { useWallet } from '@solana/wallet-adapter-react'
import { fetchProfile } from '@/app/lib/utils'
import dynamic from 'next/dynamic'

// const PublicChat = dynamic(() => import('@/components/chat/public/page'), {
//   ssr: false,
// })

export function ChatArea() {
  const pathname = usePathname()
  const { connected, publicKey } = useWallet()
  const [userId, setUserId] = useState('')

  const userKey = publicKey?.toString() || '';

  useEffect(() => {
    async function getUserId(pubkey: string){
      const profile = await fetchProfile(pubkey, 0)
      const id = profile.id;
      const idToString = id?.toString || '0'
      setUserId(idToString);
  }
  getUserId(userKey);
  }, [userKey])

  if (!connected) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Please connect your wallet to start chatting.</p>
      </div>
    )
  }


  return (
    <div className="flex-1 flex">
      {pathname === '/' ? (
        // <PublicGroupChat onStartDM={setSelectedUser} />
        userId && (<PublicChat userId={userId}/>)
      ) : (
        <PrivateDMRoomChat/>
      )}
    </div>
  )
}