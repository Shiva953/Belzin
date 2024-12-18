import { NextResponse } from "next/server"
import prisma from "@/lib/prisma";

export async function POST(req: Request){
    try{
    const { initiatorUserId, friendId } = await req.json()

    if(!initiatorUserId || !friendId){
        return NextResponse.json({error: "Invalid Chat Users"}, {status: 400})
    }

    const initiatorId = Number(initiatorUserId);
    const friendIdParsed = Number(friendId);

    const existingFriendship = await prisma.friendship.findUnique({
        where: {
            user_id_friend_id: {
                user_id: initiatorId,
                friend_id: friendIdParsed
            }
        }
    });

    if (existingFriendship) {
        return NextResponse.json({ message: "Friendship already exists", friendship: existingFriendship }, { status: 200 });
    }
    //add friendId to Frienship, establish the route and ensure {DMinitiatorUserId}-{OtherUserId} route
    // w.r.t to the other user(non-initiator), the route would still be the same (/{DMinitiatorUserId}-{OtherUserId})

    const friendship = await prisma.friendship.createMany({
        data: [
            {
                user_id: initiatorId,
                friend_id: friendIdParsed,
                status: 1
            },
            {
                user_id: friendIdParsed,
                friend_id: initiatorId,
                status: 1
            }
        ]
    });

    if(friendship){
        return NextResponse.json({message: "Successfully created friendship & added to DM"}, {status: 200})
    }
    //initiate route on both-sides

    } catch(error){
        if (error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500})
        }
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }

}