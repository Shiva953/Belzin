/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const results = await prisma.message.findMany({
            include: {
                sender: true
            },
            orderBy: {
                timestamp: 'desc'
            }
        });
        
        const messages = results.map((message) => ({
            ...message,
            sender: message.sender
        }));

        return NextResponse.json(messages, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}