import { NextResponse } from "next/server"
import prisma from "@/lib/prisma";

export async function POST(req: Request){
    try{
    const { initiatorUserId, friendId } = await req.json()

    if(!initiatorUserId || !friendId){
        return NextResponse.json({error: "Invalid Chat Users"}, {status: 400})
    }

    //add friendId to Frienship, establish the route and ensure {DMinitiatorUserId}-{OtherUserId} route
    // w.r.t to the other user(non-initiator), the route would still be the same (/{DMinitiatorUserId}-{OtherUserId})

    const friendship = await prisma.friendship.create({
        data: {
            user_id: initiatorUserId,
            friend_id: friendId,
            status: 1
        }
    });

    } catch(error){
        if (error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500})
        }
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }

}