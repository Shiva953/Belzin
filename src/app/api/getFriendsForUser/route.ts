import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request){
    try{
        const { userId } = await req.json();

        //each userId -> different FriendList[](create a postgres relation)
        //one way is to filter conversations by userId, check the chatId, extract partner id, and add to friends list
        //but on creating a new friend(= starting new chat) for first time, there is no pre-existing chat

        //MAP EACH USER IN USERS -> UNIQUE FRIEND LIST
        
        //brute force -> optimal relational approach
        // brute force = one FriendLists table(containg list of friendlists), which contains an array of userids and one main userId

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if(!user){
            return NextResponse.json({error: "User Not Found"}, {status: 400})
        }
        const friendList = user.friendList || [];
        
        return NextResponse.json({friendList: friendList}, {status: 200})

    } catch(error){
        if (error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500})
        }
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}