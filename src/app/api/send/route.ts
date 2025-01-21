// /api/send
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
    try {
        const { messageContent, walletPublicKey, isAgent } = await req.json();

        if (!walletPublicKey) {
            return NextResponse.json({ error: "Invalid Sender" }, { status: 401 });
        }

        const user = await prisma.user.findFirst({
            where: { walletPublicKey }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid User, Does not Exist" }, { status: 401 });
        }

        const createdMessage = await createAndBroadcastMessage(user.id, messageContent, isAgent);

        return NextResponse.json({
            message: createdMessage,
            res: 'Message successfully sent'
        }, { status: 200 });

    } catch (err) {
        if (err instanceof Error) {
            return NextResponse.json({error: err.message}, {status: 500})
        }
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}

async function createAndBroadcastMessage(senderId: number, content: string, isAgent = false) {
    const messageData = {
        content: content || '',
        senderId,
        timestamp: Date.now().toString(),
        isAgent
    };

    const message = await prisma.message.create({
        data: messageData,
        include: { sender: true }
    });

    // Broadcast messages in parallel
    await Promise.all([
        pusherServer.trigger("global-chat", 'incoming-message', message),
        pusherServer.trigger("global-chat", 'new-send-message', message)
    ]);

    return message;
}