'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { PublicChat } from '@/components/chat/public/PublicChat';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProfile } from '@/hooks/useProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatMessages } from '@/hooks/useMessages';
import { useEffect, useState } from 'react';
import { ChatBet } from '@/types';

export default function Home() {
  const { connected, publicKey } = useWallet()
  const { profile, loading: profileLoading, error:profileError } = useProfile(publicKey?.toString());
  const {initialMessages, loading: messagesLoading, error: messagesError} = useChatMessages()
  const [bets, setBets] = useState<ChatBet[]>([])

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.NODE_ENV === 'development' 
                    ? 'http://localhost:3000' 
                    : 'https://www.belzin.fun');

  useEffect(() => {
    async function fetchBets(){
      const response = await fetch(`${baseUrl}/api/getAllBets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userAddress: publicKey?.toBase58() || ''
        }),
      })
      const bets = await response.json();
      setBets(bets)
    }
    fetchBets();
  }, [publicKey])

    if (!connected) {
      return (
        <div className="flex-1 w-full flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Please connect your wallet to start chatting.</p>
        </div>
      )
    }

    if (messagesLoading || profileLoading) {
      return (
        <div className="flex h-screen">
          <div className="flex-1 overflow-hidden">
            <ChatSkeleton />
          </div>
        </div>
      );
    }

  if (profileError || messagesError) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <p className="text-lg text-destructive">
          Error loading profile. Please try again or reconnect your wallet.
        </p>
      </div>
    )
  }

  if (messagesError) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <p className="text-lg text-destructive">
          Error loading messages. Please try again.
        </p>
      </div>
    )
  }

  const userId = profile?.id?.toString() || '';
  console.log(bets)

  return (
    <div className="flex h-screen">
    <div className="flex-1 overflow-hidden">
      {userId && initialMessages && initialMessages.length > 0 && bets && bets.length>0 && (
        <PublicChat userId={userId} initialMessages={initialMessages} bets={bets}/>
      )}
    </div>
  </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 w-full">
        {[...Array(10)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} w-full`}>
            <div className={`flex items-end space-x-3 ${i % 2 === 0 ? 'flex-row-reverse space-x-reverse' : ''} max-w-[80%] w-full`}>
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className={`space-y-4 flex-grow ${i % 2 === 0 ? 'items-end' : 'items-start'}`}>
                {/* <Skeleton className={h-4 w-[72rem] ${i % 2 === 0 ? 'ml-auto' : ''}} /> */}
                <Skeleton className={`h-14 py-4 w-[80rem] rounded-xl`} />
                {/* <Skeleton className={h-2 w-[72rem] ${i % 2 === 0 ? 'ml-auto' : ''}} /> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}