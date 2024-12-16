'use client'
import { FriendsList } from "@/components/chat/private/FriendsList"

export default function Page(){
    return(
        <>
        <div className="flex flex-row m-4 p-8">
            <FriendsList/>
            Select a Conversation to start Blinks & Betting in Chat
        </div>
        </>
    )
}