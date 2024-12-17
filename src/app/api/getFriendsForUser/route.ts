import { FriendT } from "@/app/conversations/page";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request){
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
            },
            select: { friendList: true }
        })
        
        if(!user){
            return NextResponse.json({error: "User Not Found"}, {status: 400})
        }

        const friends = await prisma.user.findMany({
            where: {
                id: {
                    in: user.friendList.map(Number).filter(id => !isNaN(id))
                }
            },
            select: {
                id: true,
                username: true,
                walletPublicKey: true,
                imageUrl: true
            }
        })

        const friendsList = friends.map((f) => f as FriendT)
        // const validFriends = user.friendList.map(async(f) => {
        //     const friend = f;
        //     const findFriend = await prisma.user.findUnique({
        //         where: {
        //             id: Number(friend),
        //         },
        //     })
        //     if(findFriend){
        //         return friend;
        //     }
        //     return null;
        // })
        // const list = await Promise.all(validFriends);
        // const finalFriendsList = list.filter((f) => f!==null)
        
        // const friendList = user.friendList || [];
        
        return NextResponse.json({friendList: friendsList}, {status: 200})

    } catch(error){
        if (error instanceof Error) {
            return NextResponse.json({error: error.message}, {status: 500})
        }
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}