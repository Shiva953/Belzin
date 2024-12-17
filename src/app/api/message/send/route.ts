/* eslint-disable @typescript-eslint/no-unused-vars */
import {pusherServer} from "@/lib/pusher";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid"
import { Message } from "@/components/chat/public/PublicChat";
import prisma from "@/lib/prisma";

export async function POST(req: Request){
  try{
    const { messageContent, sender, senderId } = await req.json();
    if(!sender){
        return NextResponse.json({error: "Invalid Sender"}, {status: 401})
    }

    const timestamp = Date.now()

    //publishing to channel
    const message: Message = {
        id: nanoid(),
        sender: sender || '',
        content: messageContent || '',
        senderId: senderId || '',
        timestamp: timestamp.toString(),
    }

    //server side trigger(publishing event to all subscribed clients with given (channel, event))
    await pusherServer.trigger("global-chat", 'incoming-message', message);

    await pusherServer.trigger("global-chat", 'new-send-message', message);

    //pushing to db
    await prisma.message.create({
        data: {
            sender: message.sender,
            content: message.content,
            senderId: message.senderId,
            timestamp: message.timestamp
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