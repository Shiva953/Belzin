/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { WalletButton } from "@/components/ContextProvider";
import { PrivateDMRoomChat } from "@/components/private-dms";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { chatHrefConstructor, fetchProfile } from "../lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { WalletLoginInterface } from "@/components/walletauth/WalletLogin";

export default function Home(){

    const wallet = useWallet();
    const pubkey = wallet.publicKey?.toString() || '';
    const [userId,setUserId] = useState(0);

    useEffect(() => {
        async function getUserId(){
            const profile = await fetchProfile(pubkey, 0)
            const id = profile.id;
            setUserId(id);
        }
        getUserId();
    }, [pubkey])
    
    const friends = [
        {
            id: 6,
            name: "0xzerqin",
            imageUrl: "",
            walletPublicKey: "9JxBhWbrwkqX2heLq1mA3YXWKsbkCH8rE5gaVxzH7Foo",
            lastMessage: {
                senderId: "7",
                content: "testing dm"
            }
        }
    ]
    return(
        <WalletLoginInterface>
        <div className='container py-12'>
      <h1 className='font-bold text-5xl mb-8'>Recent chats</h1>
      {userId && (friends.length === 0 ? (
        <p className='text-sm text-zinc-500'>Nothing to show here...</p>
      ) : (
        friends.map((friend) => (
          <div
            key={friend.id}
            className='relative bg-zinc-50 border border-zinc-200 p-3 rounded-md'>
            <div className='absolute right-4 inset-y-0 flex items-center'>
              <ChevronRight className='h-7 w-7 text-zinc-400' />
            </div>
            <Link
              href={`/dashboard/chat/${chatHrefConstructor(
                userId.toString(),
                friend.id.toString()
              )}`}
              className='relative sm:flex'>
              <div className='mb-4 flex-shrink-0 sm:mb-0 sm:mr-4'>
                <div className='relative h-6 w-6'>
                  {/* <Image
                    referrerPolicy='no-referrer'
                    className='rounded-full'
                    alt={`${friend.name} profile picture`}
                    fill
                  /> */}
                  <span>{friend.name.substring(0,4)}</span>
                </div>
              </div>

              <div>
                <h4 className='text-lg font-semibold'>{friend.name}</h4>
                <p className='mt-1 max-w-md'>
                  <span className='text-zinc-400'>
                    {friend.lastMessage.senderId === pubkey
                      ? 'You: '
                      : ''}
                  </span>
                  {friend.lastMessage.content}
                </p>
              </div>
            </Link>
          </div>
        ))
      ))}
    </div>
    </WalletLoginInterface>
  )
}