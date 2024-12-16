/* eslint-disable @typescript-eslint/no-unused-vars */
// /conversation/id(id = user1--user2)

'use client'

import { useWallet } from "@solana/wallet-adapter-react"
import React from "react"
import { notFound } from "next/navigation"
import { use, useEffect, useState } from "react"
import { Message } from "@/components/chat/public/page"
import Image from "next/image"
import { UserT } from "@/components/user-profile"
import { Messages } from "@/components/Messages"
import { MessageInput } from "@/components/MessageInput"
import { fetchProfile } from "@/app/lib/utils"
import { WalletLoginInterface } from "@/components/walletauth/WalletLogin"
import { useRouter } from 'next/router'
import { ChatMessage } from "@prisma/client"

export interface DMProps{
    params: {
        id: string,
    },
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
    const [partner, setPartner] = useState<UserT|null>();
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

    // if(!userid){
    //     return (
    //         <>
    //         <div>Invalid User, Not Found!</div>
    //         </>
    //     )
    // }

    // if(userid!==userid1 || userid!=userid2){
    //     notFound()
    // }
    // const checkingUserSession = userid===userid1 || userid===userid2
    return (
        <>
        <WalletLoginInterface>
            {!(userid==userid1 || userid==userid2) && (
                <div>
                    Invalid User!
                </div>
            )}
        {
        (userid==userid1 || userid==userid2) && (<div className='flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]'>
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
        {initialMessages.length>0 && <Messages initialMessages={initialMessages} currentUserId={userid} event={event_name} channel={channel_name}/>}
        {/* 3. CHAT INPUT */}
        <MessageInput chatId={id}/>
        </div>
        </div>)
            }
        </WalletLoginInterface>
        </>
    )


}