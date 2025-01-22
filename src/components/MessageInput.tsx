/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';
import { useState, useRef } from 'react';
import axios from "axios"
import { useWallet } from '@solana/wallet-adapter-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAgentStream } from '@/hooks/useAgentStream';

const AGENT_USER = {
  id: 14,
  walletPublicKey: '96a3u1mDA3E1krcgtGgo38hMaewurNc9CJBzaPaWSUc8',
  username: 'PolyAgent',
  imageUrl: 'https://na-assets.pinit.io/BDzbq7VxG5b2yg4vc11iPvpj51RTbmsnxaEPjwzbWQft/dc240c0d-e772-466f-b493-13eab770ab79/4731',
  friendList: []
};

export function MessageInput({chatId} : {chatId?: string}){
  const { streamAgentResponse, isStreaming } = useAgentStream();
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [input, setInput] = useState<string>('')
    const wallet = useWallet();
    const inputRef = useRef<HTMLInputElement>(null)

    const sendMessage = async () => {
        if(!input) return
        setIsLoading(true)
        const optimisticInput = input;
        setInput('')

        try {
          const isAgent = optimisticInput.toLowerCase().includes("@polyagent");
          const walletPublicKey = wallet?.publicKey?.toString() || '';

          await axios.post('/api/send', { 
              messageContent: optimisticInput, 
              walletPublicKey, 
              isAgent: false 
          });

        //   if (isAgent) {
        //     await handleAgentStream(optimisticInput.replace('@polyagent', '').trim());
        // }
          // if (isAgent) {
          //     const agentResponse = await axios.post('/api/getAgentRes', { 
          //         messageContent: optimisticInput.replace('@polyagent', '').trim() 
          //     });

          //     if (agentResponse.data.response) {
          //         await axios.post('/api/send', { 
          //             messageContent: agentResponse.data.response, 
          //             walletPublicKey: AGENT_USER.walletPublicKey, 
          //             isAgent: true 
          //         });
          //     }
          // }
          if (isAgent) {
            let accumulatedResponse = '';
            // Stream the agent response
            const fullResponse = await streamAgentResponse(
              optimisticInput.replace('@polyagent', '').trim(),
                (chunk) => {
                  accumulatedResponse += chunk;
                },
                () => {
                }
            );
    
            await axios.post('/api/send', {
              messageContent: fullResponse,
              walletPublicKey: AGENT_USER.walletPublicKey,
              isAgent: true
            });
          }

          if (chatId) {
              await axios.post('/api/message/sendToPrivateChat', { 
                  messageContent: optimisticInput, 
                  walletPublicKey, 
                  chatId 
              });
          }
          inputRef.current?.focus()
      } catch (err) {
          console.error("Error sending message:", err);
      } finally {
          setIsLoading(false);
      }
  };

      const handleKeyPress = (event: any) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          sendMessage()
        }
      }

      return (
        <div className="p-4 border-t border-border/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setInput((prev) => `@polyagent ${prev}`)}
          >
            <Bot className="h-5 w-5" />
          </Button>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex-1 flex items-center gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder={input.includes("@polyagent") ? "Ask the AI agent..." : "Send a message..."}
              className={cn(
                "flex-1 bg-accent/50 border-0 focus-visible:ring-1 focus-visible:ring-accent",
                input.includes("@polyagent") && "text-emerald-500 placeholder:text-emerald-500/50",
              )}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="rounded-full w-24">
              Send
            </Button>
          </form>
        </div>
      </div>
      );
}