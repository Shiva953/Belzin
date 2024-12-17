/* eslint-disable @typescript-eslint/no-unused-vars */
import {pusherServer} from "@/lib/pusher";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid"
import { Message } from "@/components/chat/public/PublicChat";
import prisma from "@/lib/prisma";
import { ChatMessage } from "@/components/chat/public/PublicChat";

export async function POST(req: Request){
  try{
    const { messageContent, sender, senderId, chatId } = await req.json();
    if(!sender){
        return NextResponse.json({error: "Invalid Sender"}, {status: 401})
    }

    const timestamp = Date.now()

    //publishing to channel
    const message: ChatMessage = {
        id: nanoid(),
        sender: sender || '',
        content: messageContent || '',
        senderId: senderId || '',
        timestamp: timestamp.toString(),
        chatId: chatId || '',
    }

    //server side trigger(publishing event to all subscribed clients with given (channel, event))
    await pusherServer.trigger(`chat-room-${chatId}`, `incoming-message-${chatId}`, message);

    await pusherServer.trigger(`chat-room-${chatId}`, 'new-send-message', message);

    //pushing to db
    await prisma.chatMessage.create({
        data: {
            sender: message.sender,
            content: message.content,
            senderId: message.senderId,
            timestamp: message.timestamp,
            chatId: message.chatId
        }
    })

    return NextResponse.json({
        message: message,
        res: 'Successfully Transmitted Event to client and sent message'
    }, {status: 200})

    } catch(err){
        if (err instanceof Error) {
            return NextResponse.json({error: err.message}, {status: 500})
        }
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}