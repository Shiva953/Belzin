'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { VerticalNavbar } from '@/components/vertical-navbar'
import { PublicChat } from '@/components/chat/public/PublicChat';
import { useState, useEffect } from 'react';
import { Message } from '@/components/chat/public/PublicChat';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchProfile } from './lib/utils';
// import UserProfile from '@/components/user/Profile';
import { WalletLoginInterface } from '@/components/walletauth/WalletLogin';
// import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {

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

  return (
    <>
    <div className="w-full h-screen flex flex-col">
      {/* <WalletLoginInterface> */}
        <div className="flex flex-row flex-1 bg-background">
          <div className='mr-16'>
          <VerticalNavbar />
          </div>
          {/* <ChatArea /> */}
          <div className="flex-1 flex">
          {userId && initialMessages && initialMessages.length>0 && <PublicChat userId={userId} initialMessages={initialMessages}/>}
          </div>
        </div>
      {/* </WalletLoginInterface> */}
    </div>
  </>
  );
}