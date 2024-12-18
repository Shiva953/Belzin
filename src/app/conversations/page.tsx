/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { FriendsList } from "@/components/chat/private/FriendsList"
import { useWallet } from "@solana/wallet-adapter-react"
import { useState, useEffect } from "react";
import { fetchProfile } from "../lib/utils";
import { WalletLoginInterface } from "@/components/walletauth/WalletLogin";
import { useProfile } from "@/hooks/useProfile";
import { useFriends } from "@/hooks/useFriends";
import { Loader2 } from "lucide-react";

// (DM INITIATOR USERID-PARTNER USERID)[ROUTE + DB FIX]
// BETTING CONTRACTS

export type FriendT = {
    id: string | number,
    username: string,
    walletPublicKey: string
    imageUrl: string,
}

export default function Page(){
    const wallet = useWallet();
    const pubkey = wallet.publicKey?.toString() || '';
    const { profile, loading, error: profileError } = useProfile(pubkey);
    const { friendList, isLoading, error: friendListError } = useFriends(pubkey);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
            </div>
        )
    }

    if (profileError) {
        return (
            <div className="flex justify-center items-center h-full text-red-500">
                <div className="text-center">
                    <p>Error getting User Profile</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center">
                    <p className="text-xl mb-4">Please create a profile</p>
                </div>
            </div>
        )
    }

    const profileId = profile?.id;
    const userId = typeof profileId === 'string' ? profileId : profileId?.toString();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
            </div>
        )
    }

    if (friendListError) {
        return (
            <div className="flex justify-center items-center h-full text-red-500">
                <div className="text-center">
                    <p>Error loading friends: {friendListError}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

 

    console.log("Do we have FriendList till the end", friendList)
    return(
        <>
        {/* <WalletLoginInterface> */}
        <div className="flex flex-row m-4 p-8">
            {/* instead of this make the useFriendList hook and have a more stateful impl with loading/data/error */}
            {<FriendsList friendList={friendList} userId={userId}/>}
            Select a Conversation to start Blinks & Betting in Chat
        </div>
        {/* </WalletLoginInterface> */}
        </>
    )
}