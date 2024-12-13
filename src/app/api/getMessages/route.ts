import prisma from "@/lib/prisma";
import { Message } from "@/components/chat/public/page";
import { NextResponse } from "next/server";

export async function GET(req: Request){
    try{
        const results = await prisma.message.findMany();
        const dbMessages = results.map((message) => message as Message);
        const messages = dbMessages.reverse();
        return NextResponse.json(messages, {status: 200})
    }
    catch(error){
        if (error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500})
        }
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}