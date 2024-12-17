'use client'

import { FriendsList } from "@/components/chat/private/FriendsList"
import { useWallet } from "@solana/wallet-adapter-react"
import { useState, useEffect } from "react";
import { fetchProfile } from "../lib/utils";

// 1. COMPLETE CONVERSATIONS INTEGRATION(BEFORE 12:15)
// 2. FIX ALL STATEFUL LOGIN/SESSION/WALLETPROVIDER + PFP BESIDE MESSAGE(WITH START DM) + UI BUGS[+BETTER STATE MANAGEMENT](AFTER THAT STARTING WITH BET INTEGRATION)

export type FriendT = {
    id: string | number,
    username: string,
    walletPublicKey: string
    imageUrl: string,
}

export default function Page(){
    const wallet = useWallet();
    const pubkey = wallet.publicKey?.toString() || '';
    const [friendList, setFriendList] = useState<FriendT[]>([])
    //abstract this in a hook since its being used a lot
    useEffect(() => {
        async function getFriendList(userId: string){
            try {
                const res = await fetch('/api/getFriendsForUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({userId: userId})
                })
        
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch friends');
                }
        
                const { friendList } = await res.json();
                return friendList;
            } catch (error) {
                console.error('Error fetching friends:', error);
                return [];
            }
        }

        async function getUserIdAndFriends(pubkey: string){
            const profile = await fetchProfile(pubkey, 0);
            const id = profile?.id;
            if(id){
                const friends = await getFriendList(id) || []
                setFriendList(friends);
            }
        }
        getUserIdAndFriends(pubkey)
    }, [pubkey])


    return(
        <>
        <div className="flex flex-row m-4 p-8">
            <FriendsList friendList={friendList}/>
            Select a Conversation to start Blinks & Betting in Chat
        </div>
        </>
    )
}