/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { FriendsList } from "@/components/chat/private/FriendsList"
import { useWallet } from "@solana/wallet-adapter-react"
import { useState, useEffect } from "react";
import { fetchProfile } from "../lib/utils";
import { WalletLoginInterface } from "@/components/walletauth/WalletLogin";

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
    const [userId, setUserId] = useState('')
    const [friendList, setFriendList] = useState<FriendT[]>([])

    console.log("Starting FriendList", friendList)
    //abstract this in a hook since its being used a lot
    useEffect(() => {
        const pubkey = wallet.publicKey?.toString() || '';
        async function getFriendList(userId: string){
            try {
                const res = await fetch('/api/getFriendsForUser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({userId: userId})
                })
                console.log("Getting Apt Response", res)
        
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch friends');
                }
                
                const { friendList } = await res.json();
                console.log("Is It Returning Apt Here: ",friendList)
                return friendList;
            } catch (error) {
                console.error('Error fetching friends:', error);
                return [];
            }
        }

        async function getUserIdAndFriends(pubkey: string){
            const profile = await fetchProfile(pubkey, 0);
            console.log("Getting Profile",profile)
            const id = profile?.user?.id;
            console.log("Getting ID: ",id)
            if(id){
                setUserId(id)
                const friends = await getFriendList(id) || []
                console.log("Getting Friends from the getFriendList func: ", friends)
                setFriendList(friends);
            }
        }
        getUserIdAndFriends(pubkey)
    }, [wallet.publicKey])


    console.log("Do we have FriendList till the end", friendList)
    return(
        <>
        {/* <WalletLoginInterface> */}
        <div className="flex flex-row m-4 p-8">
            {/* instead of this make the useFriendList hook and have a more stateful impl with loading/data/error */}
            {friendList && userId && <FriendsList friendList={friendList} userId={userId}/>}
            Select a Conversation to start Blinks & Betting in Chat
        </div>
        {/* </WalletLoginInterface> */}
        </>
    )
}