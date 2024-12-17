/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';
import * as Ably from 'ably';
import { useState, useEffect, useRef } from 'react';
import axios from "axios"
import { useWallet } from '@solana/wallet-adapter-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function MessageInput({chatId} : {chatId?: string}){
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
            const res = await fetch(`/api/getProfile`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
            },
              body: JSON.stringify({
                pubkey: pubkey,
                userId: 0
              })
            })
            const data = await res.json();
            const user = data.user;
            const username = user?.username || 'InvalidUser';
            setSender(username)
            const senderId = user?.id || 0;
            const senderIdToString = senderId.toString()
            setSenderId(senderIdToString);
        }
        getUser(userPubkey);
    }, [wallet.publicKey])

    const sendMessage = async () => {
        if(!input) return
        setIsLoading(true)
        const optimisticInput = input;
        setInput('')
        try {
          if(!chatId){
            await axios.post('/api/message/send', { messageContent: optimisticInput, sender: sender, senderId: senderId})
          }
          if(chatId){
            await axios.post('/api/message/sendToPrivateChat', { messageContent: optimisticInput, sender: sender, senderId: senderId, chatId: chatId})
          }
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