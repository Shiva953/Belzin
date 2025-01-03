'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { VerticalNavbar } from '@/components/vertical-navbar'
import { PublicChat } from '@/components/chat/public/PublicChat';
import { useState, useEffect } from 'react';
import { Message } from '@/components/chat/public/PublicChat';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProfile } from '@/hooks/useProfile';
import { Skeleton } from '@/components/ui/skeleton';

// CREATE BETTING BLINK, ADD IT IN THE TOOL(along with agent blink execution capability)
// ADD BLINK CLIENT SUPPORT
export default function Home() {
  const { connected, publicKey } = useWallet()
  const { profile, loading, error } = useProfile(publicKey?.toString());

  const [initialMessages, setInitialMessages] = useState<Message[]>([]);

    useEffect(() => {
        async function getChatMessages(){
            try{
                const res = await fetch('/api/getMessages');
                const messages = await res.json();
                setInitialMessages(messages)
                console.log(messages)
                return messages;
            } catch(error){
                console.log("Error fetching messages: ",error)
            }
        }
        getChatMessages();
    }, [])


    if (!connected) {
      return (
        <div className="flex-1 w-full flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Please connect your wallet to start chatting.</p>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="w-full h-screen flex flex-col">
          <div className="flex flex-row flex-1 bg-background">
            <div className='mr-16'>
              <VerticalNavbar />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="space-y-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        </div>
      )
    }

  if (error || !profile) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <p className="text-lg text-destructive">
          Error loading profile. Please try again or reconnect your wallet.
        </p>
      </div>
    )
  }

    const userId = profile?.id?.toString() || '';

  return (
    <>
    <div className="w-full h-screen flex flex-col">
        <div className="flex flex-row flex-1 bg-background">
          <div className='mr-16'>
          <VerticalNavbar />
          </div>
          {/* <ChatArea /> */}
          <div className="flex-1 flex">
          {userId && initialMessages && initialMessages.length>0 && <PublicChat userId={userId} initialMessages={initialMessages}/>}
          </div>
        </div>
    </div>
  </>
  );
}