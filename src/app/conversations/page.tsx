'use client'

import { FriendsList } from "@/components/chat/private/FriendsList"
import { useWallet } from "@solana/wallet-adapter-react"
import { useState, useEffect } from "react";
import { fetchProfile } from "../lib/utils";
import { UserT } from "@/components/user-profile";

export interface FriendT extends UserT {
    id: string | number,
}

export default function Page(){

    const wallet = useWallet();
    const pubkey = wallet.publicKey?.toString() || '';
    const [userId, setUserId] = useState('')
    const [friendList, setFriendList] = useState<FriendT[]>([])
    //abstract this in a hook since its being used a lot
    useEffect(() => {
        async function getFriendList(userId: string){
            const res = await fetch('/api/getFriendsForUser', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({userId: userId})
            })
            const friendUserIdsList = await res.json();
            let friendListLocal = []
            if(friendUserIdsList && friendUserIdsList.length>0){
                for(let friendId of friendUserIdsList){
                    const friend = await fetchProfile('', Number(friendId))
                    if(friend){
                        friendListLocal.push(friend)
                    }
                }
                return friendListLocal;
            }
        }

        async function getUserIdAndFriends(pubkey: string){
            const profile = await fetchProfile(pubkey, 0);
            const id = profile?.id || '0';
            if(id){
                setUserId(id)
                const friends = await getFriendList(id) || []
                setFriendList(friends);
            }
        }
        getUserIdAndFriends(pubkey)
    }, [])


    return(
        <>
        <div className="flex flex-row m-4 p-8">
            <FriendsList friendList={friendList}/>
            Select a Conversation to start Blinks & Betting in Chat
        </div>
        </>
    )
}