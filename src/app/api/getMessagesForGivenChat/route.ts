import { NextResponse } from "next/server"
import prisma from "@/lib/prisma";
import { ChatMessage } from "@/components/chat/public/PublicChat";

export async function POST(req: Request){
    try{
        const { chatId } = await req.json();
        const [id1, id2] = chatId.split('-')

        const revChatId = (id1&&id2) ? `${id2}-${id1}` : chatId;
        // const results = await prisma.chatMessage.findMany({
        //     where: {
        //         chatId: chatId
        //     }
        // })
        const results = await prisma.chatMessage.findMany({
            where: {
                OR: [
                    { chatId: chatId },
                    { chatId: revChatId }
                ]
            }
        })
        const dbMessages = results.map((message) => message as ChatMessage);
        const messages = dbMessages.reverse();
        return NextResponse.json(messages, {status: 200})

    } catch(error){
        if (error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500})
        }
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}