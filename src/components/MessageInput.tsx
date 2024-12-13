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
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [input, setInput] = useState<string>('')
    const wallet = useWallet();
    const [sender, setSender] = useState<string>('')
    const [senderId, setSenderId] = useState<string>('')

    const textareaRef = useRef<HTMLInputElement | null>(null);

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
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          sendMessage()
        }
      }

      const handleSubmission = (event: any) => {
        event.preventDefault()
        sendMessage()
        setInput('')
      }

      return (
          <div className="relative w-full p-3 border-t bg-background">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input 
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder='Send Message in Global Chat'
                  className="w-full rounded-full px-4 py-2 border focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <Button 
                onClick={sendMessage} 
                disabled={!input.trim()}
                className="rounded-full px-4 py-2 transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                Send
              </Button>
            </div>
          </div>
      );
}