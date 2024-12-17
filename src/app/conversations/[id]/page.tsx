/* eslint-disable @typescript-eslint/no-unused-vars */
// /conversation/id(id = user1--user2)

'use client'

import { useWallet } from "@solana/wallet-adapter-react"
import React from "react"
import { notFound } from "next/navigation"
import { use, useEffect, useState } from "react"
import { Message } from "@/components/chat/public/PublicChat"
import Image from "next/image"
import { UserT } from "@/components/user-profile"
import { Messages } from "@/components/Messages"
import { MessageInput } from "@/components/MessageInput"
import { fetchProfile } from "@/app/lib/utils"
import { WalletLoginInterface } from "@/components/walletauth/WalletLogin"
import { useRouter } from 'next/router'
import { ChatMessage } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

export interface DMProps{
    params: {
        id: string,
    },
}

interface ChatHeaderProps {
    partner?: {
      username: string
      imageUrl: string
    }
  }


export default function Page({ params }: { params: Promise<{ id: string }> }){
    const { id } = use(params);
    // const { id } = params
    // const id = use(Promise.resolve(params.id));
    console.log("ChatId: ",id)
    const [userid1, userid2] = id.split('-')
    console.log(userid1)
    console.log(userid2)

    const [userid, setUserid] = useState('')
    const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([])
    const [partner, setPartner] = useState<UserT|null>(null);
    const chatPartnerid = userid == userid1 ? userid2 : userid1

    const event_name = `incoming-message-${id}`
    const channel_name = `chat-room-${id}`

    const wallet = useWallet();
    const userPubkey = wallet.publicKey?.toString() || '';

    console.log("Wallet Public Key: ", userPubkey)

    console.log("User Id: ", userid)
    useEffect(() => {
        async function getUseridAndPartner(pubkey: string, partnerid: string) {
            console.log("Pubkey: ", pubkey)
            console.log("PartnerId", partnerid)
            const partnerIdNumeric = Number(partnerid)
            const [userData, partnerData] = await Promise.all([
                fetchProfile(pubkey, 0),
                fetchProfile('', partnerIdNumeric)
            ]);

            if (!userData || !partnerData) {
                console.error('Failed to fetch user or partner profile');
            }
            console.log("UserData", userData)
            console.log("PartnerData",partnerData)
    
            const user = userData?.user;
            console.log("Current User: ",user)
            const userId = user?.id || 0;
            console.log("UserId(Number): ", userId)
            const userIdString = userId.toString();
            console.log("UserId(Number): ", userId)
            const partner = partnerData?.user;
            console.log("Partner: ",partner)
    
            setUserid(userIdString);
            setPartner(partner);
        }
        getUseridAndPartner(userPubkey, chatPartnerid);
    }, [userPubkey, chatPartnerid]);

    useEffect(() => {
        async function getChatMessages(chatid: string){
            try{
                const res = await fetch('/api/getMessagesForGivenChat', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        chatId: chatid
                    })
                });
                const messages = await res.json();
                console.log("Messages returned: ",messages)
                setInitialMessages(messages)
                return messages;
            } catch(error){
                console.log("Error fetching messages for given chatid: ",error)
            }
        }
        getChatMessages(id);
    }, [id])

    console.log("Initial Messages: ", initialMessages)

    // make user id check more robust
    return (
        <>
        {/* <WalletLoginInterface> */}
            {!(userid==userid1 || userid==userid2) && (
                <div>
                    Invalid User!
                </div>
            )}
        {
        (userid==userid1 || userid==userid2) && (
        <div className='flex flex-col h-full w-full'>
        {/* 1. TOP BAR SHOWING THE PARTNER PFP AND USERNAME */}
        {partner && (
            <Card className="w-full transition-colors fixed top-0 z-40 mb-4 pb-2">
            <CardContent className="p-4 flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={partner?.imageUrl || ''} alt={partner?.username || 'User'} />
                <AvatarFallback>{partner?.username?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <h2 className="font-semibold text-lg">
                  {partner?.username || 'Chat Partner'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {partner?.username ? 'Online' : 'Waiting for partner...'}
                </p>
              </div>
            </CardContent>
          </Card>
            )}
            <div className='flex-1 overflow-hidden'>
            {/* 2. CHAT INTERFACE(WITH MESSAGES) */}
            {initialMessages.length>0 && <Messages initialMessages={initialMessages} currentUserId={userid} event={event_name} channel={channel_name}/>}
            </div>
            {/* 3. CHAT INPUT */}
            <div className='sticky bottom-0 w-full'>
            <MessageInput chatId={id}/>
            </div>
        </div>
        )
            }
        {/* </WalletLoginInterface> */}
        </>
    )


}