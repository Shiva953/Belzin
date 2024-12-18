import { FriendT } from "@/app/conversations/page";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request){
    try{
        const { userId } = await req.json();

        if(!userId){
            return NextResponse.json({error: "User Not Found"}, {status: 400})
        }

        const friendships = await prisma.friendship.findMany({
            where: {
                user_id: userId,
                status: 1 // Only get accepted friendships
            },
            include: {
                User_Friendship_friend_idToUser: {
                    select: {
                        id: true,
                        username: true,
                        walletPublicKey: true,
                        imageUrl: true
                    }
                },
            }
        });

        const acceptedFriendList = friendships.map(f => f.User_Friendship_friend_idToUser as FriendT);
        
        return NextResponse.json({friendList: acceptedFriendList}, {status: 200})

    } catch(error){
        if (error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500})
        }
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}