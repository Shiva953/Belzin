/* eslint-disable @typescript-eslint/no-unused-vars */
// /conversation/Id(Id = user1--user2)

'use client'

import { useWallet } from "@solana/wallet-adapter-react"
import React from "react"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import { Message } from "@/components/chat/public/page"
import Image from "next/image"
import { UserT } from "@/components/user-profile"
import { Messages } from "@/components/Messages"
import { MessageInput } from "@/components/MessageInput"
import { fetchProfile } from "@/app/lib/utils"
import { WalletLoginInterface } from "@/components/walletauth/WalletLogin"
import { useRouter } from 'next/router'

export interface DMProps{
    params: {
        Id: string,
    },
}


export default function Page(){
    const router = useRouter();
    // const Id = React.use(Promise.resolve(params.Id))
    const Id = router.query.Id;
    const [userId1, userId2] = Id.split('--')
    const [userId, setUserId] = useState('')
    const [initialMessages, setInitialMessages] = useState<Message[]>([])
    const [partner, setPartner] = useState<UserT|null>();
    const chatPartnerId = userId === userId1 ? userId2 : userId1
    const event_name = `incoming-message-${Id}`
    const channel_name = `chat-room-${Id}`

    const wallet = useWallet();
    const userPubkey = wallet.publicKey?.toString() || '';
    useEffect(() => {
        async function getUserIdAndPartner(pubkey: string, partnerId: string) {
            const [userData, partnerData] = await Promise.all([
                fetchProfile(pubkey, ''),
                fetchProfile('', partnerId)
            ]);
    
            const user = userData?.user;
            const partner = partnerData?.user;
    
            setUserId(user?.id || '');
            setPartner(partner);
        }
        getUserIdAndPartner(userPubkey, chatPartnerId);
    }, [userPubkey, chatPartnerId]);

    useEffect(() => {
        async function getChatMessages(chatId: string){
            try{
                const res = await fetch('/api/getMessagesForGivenChat', {
                    body: JSON.stringify({
                        chatId: Id
                    })
                });
                const messages = await res.json();
                setInitialMessages(messages)
                console.log(messages)
                return messages;
            } catch(error){
                console.log("Error fetching messages for given chatId: ",error)
            }
        }
        getChatMessages(Id);
    }, [Id])


    if(!userId){
        return (
            <>
            <div>Invalid User, Not Found!</div>
            </>
        )
    }

    if(userId!==userId1 || userId!=userId2){
        notFound()
    }

    return (
        <>
        <WalletLoginInterface>
        <div className='flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]'>
        <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200'>
        {/* 1. TOP BAR SHOWING THE PARTNER PFP AND USERNAME */}
        <div className='relative'>
            <div className='relative w-8 sm:w-12 h-8 sm:h-12'>
              <Image
                fill
                referrerPolicy='no-referrer'
                src={partner?.imageUrl || ''}
                alt={`${partner?.username.substring(0,2)}`}
                className='rounded-full'
              />
            </div>
            </div>
        {/* 2. CHAT INTERFACE(WITH MESSAGES) */}
        <Messages initialMessages={initialMessages} currentUserId={userId} event={event_name} channel={channel_name}/>
        {/* 3. CHAT INPUT */}
        <MessageInput chatId={Id}/>
        </div>
        </div>
        </WalletLoginInterface>
        </>
    )


}