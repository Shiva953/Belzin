/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import {pusherClient} from '@/lib/pusher';
import { useState, useEffect, useRef } from 'react';
import { format } from "date-fns";
import { Message } from './chat/public/page';
import { cn } from '@/lib/utils';

export function Messages({initialMessages, currentUserId, channel, event} : {initialMessages: Message[], currentUserId: string, channel: string, event: string}){
    const [messages, setMessages] = useState<Message[]>(initialMessages)

    useEffect(() => {
        pusherClient.subscribe(channel)
        const messageHandler = (message: Message) => {
            setMessages((prev) => [message, ...prev])
        }
        pusherClient.bind(event, messageHandler)

        return () => {
          pusherClient.unsubscribe(
            channel
          )
          pusherClient.unbind(event, messageHandler)
        }
    }, [])

        const scrollDownRef = useRef<HTMLDivElement | null>(null)

        const formatTimestamp = (timestamp: number) => {
            return format(timestamp, 'HH:mm')
        }

    // current user messages -> right, other user messages -> left
    // <div className='flex h-full flex-1 flex-col-reverse overflow-y-auto px-3 py-2 space-y-3 scrollbar-thin scrollbar-track-background scrollbar-thumb-primary/50'>
    return(
        <div className='h-full overflow-y-auto'>
        <div className='flex flex-col-reverse gap-4 p-3'>
        <div ref={scrollDownRef} />
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId == currentUserId;
          const hasNextMessageFromSameUser = index > 0 && messages[index - 1]?.senderId === message.senderId;
          return (
            <div 
              key={`${message.id}-${message.timestamp}`} 
              className={cn('flex', {
                'justify-end': isCurrentUser,
                'justify-start': !isCurrentUser
              })}
            >
              <div 
                className={cn('max-w-[70%] rounded-2xl px-4 py-2 relative', {
                  'bg-primary text-primary-foreground': isCurrentUser,
                  'bg-secondary text-secondary-foreground': !isCurrentUser,
                  'rounded-br-sm': isCurrentUser && !hasNextMessageFromSameUser,
                  'rounded-bl-sm': !isCurrentUser && !hasNextMessageFromSameUser
                })}
              >
                <div className="break-words">{message.content}</div>
                <div className="text-xs text-foreground/50 mt-1 text-right">
                  {formatTimestamp(Number(message.timestamp))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    );
}