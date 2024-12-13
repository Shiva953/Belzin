/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';
import {pusherClient} from '@/lib/pusher';
import * as Ably from 'ably';
import { useState, useEffect, useRef } from 'react';
import { format } from "date-fns";
import { AblyProvider, ChannelProvider,useChannel } from 'ably/react';
import axios from "axios"
import { useWallet } from '@solana/wallet-adapter-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { Message } from './chat/public/page';

export function MessageInput(){
    const client = pusherClient;
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [input, setInput] = useState<string>('')
    const wallet = useWallet();
    const [sender, setSender] = useState<string>('')
    const [senderId, setSenderId] = useState<string>('')

    const textareaRef = useRef<HTMLInputElement | null>(null); //useRef<HTMLTextAreaElement | null>(null)

    useEffect(() => {
        const userPubkey = wallet.publicKey?.toString() || '';
        setSenderId(userPubkey);
        async function getUser(pubkey: string){
            const res = await fetch(`/api/getProfile?pubkey=${pubkey}`)
            const data = await res.json();
            const user = data.user;
            setSender(user?.username || 'InvalidUser')
        }
        getUser(userPubkey);
    }, [wallet.publicKey])

    const sendMessage = async () => {
        if(!input) return
        setIsLoading(true)
    
        try {
          await axios.post('/api/message/send', { messageContent: input, sender: sender, senderId: senderId})
          setInput('')
          textareaRef.current?.focus()
        } catch(err) {
          console.log(err)
        } finally {
          setIsLoading(false)
        }
      }

      const handleKeyPress = (event: any) => {
        if (event.charCode !== 13 || !input) {
          return;
        }
        sendMessage();
        event.preventDefault();
      }

      const handleSubmission = (event: any) => {
        event.preventDefault();
        sendMessage();
      }

      return (
        <>
            <Input 
            ref={textareaRef}
            onKeyDown={handleKeyPress}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmission}
            placeholder='Send Message in Global Chat'
            className='block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6'
            />
            <div
            onClick={() => textareaRef.current?.focus()}
            className='py-2'
            aria-hidden='true'>
                <div className='py-px'>
                <div className='h-9' />
                </div>
            </div>
            <div className='absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
          <div className='flex-shrin-0'>
            <Button onClick={sendMessage} type='submit'>
              Send
            </Button>
          </div>
        </div>
         </>
      );
}