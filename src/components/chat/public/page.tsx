/* eslint-disable @typescript-eslint/no-unused-vars */
// Public GC Interface
import {pusherClient} from '@/lib/pusher';
import * as Ably from 'ably';
import { useState, useEffect, useRef } from 'react';
import { format } from "date-fns";
import { AblyProvider, ChannelProvider,useChannel } from 'ably/react';
import { Messages } from '@/components/Messages';
import axios from "axios"
import { useWallet } from '@solana/wallet-adapter-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { MessageInput } from '@/components/MessageInput';
// validate the user session -> if user signed in && logged in -> Show Public Chat
// Public Chat: Real time messaging(using pusher pub/sub) <-> storing new messages/fetching existing messages in DB

export interface Message{
    id: string | number,
    content: string | null,
    sender: string | null,
    senderId: string | null,
    timestamp: string | null
}

// async function getChatMessages(){
//     try{
//         const res = await fetch('/api/getMessages');
//         const messages = await res.json();
//         return messages;
//     } catch(error){
//         console.log("Error fetching messages: ",error)
//     }
// }

// const initialMessages = await getChatMessages() || [];

//FIX THE SESSION & SIGN-IN BUG: SIGN-IN !== WALLET BEING CONNECTED
//CURRENTLY YOU'RE TAKING THE USER STATE AS SOON AS IT CONNECTS, WHEREAS ONLY AFTER SIGN-IN YOU SHOULD START CHAT 

export function PublicChat({ userId } : { userId: string }){
    //component tree: Interface(my Messages(right) + other user Messages(left)) + MessageInput + SendMessage + (+)icon in the left(for adding bets)
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

    //1. check user session
    // make req to /api/userProfile to fetch the user details and pass it on to the other components

    //2. get the chatid and the roomid(or roomname)

    //3. fetch the (initial set of)messages from the db in messages component, to be displayed as soon as user enters chat

    //4. POST to /api/message/send with body containing (chatroom, sender, message, ...)[this would trigger an event in pub/sub channel + send message to db]

    //for publishing/subscribing messages to channel(in this case global chatroom) + db insertion -> req to /message/send
    return (
        <>
            <div className='flex-1 justify-between flex flex-col h-full w-full'>
            {/* All the previous messages fetched from the server */}
            {(initialMessages.length > 0) && <Messages initialMessages={initialMessages} currentUserId={userId}/>}
            {/* The Chat Input + Send Message */}
            <MessageInput/>
            </div>
         </>
      );
}