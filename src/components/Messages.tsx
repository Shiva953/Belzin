/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import {pusherClient} from '@/lib/pusher';
import { useState, useEffect, useRef } from 'react';
import { format } from "date-fns";
import { Message } from './chat/public/page';
import { cn } from '@/lib/utils';

export function Messages({initialMessages, currentUserId} : {initialMessages: Message[], currentUserId: string}){
    const [messages, setMessages] = useState<Message[]>(initialMessages)

    useEffect(() => {
        pusherClient.subscribe("global-chat")
        const messageHandler = (message: Message) => {
            setMessages((prev) => [message, ...prev])
        }
        pusherClient.bind('incoming-message', messageHandler)

        return () => {
          pusherClient.unsubscribe(
            "global-chat"
          )
          pusherClient.unbind('incoming-message', messageHandler)
        }
    }, [])

        const scrollDownRef = useRef<HTMLDivElement | null>(null)

        const formatTimestamp = (timestamp: number) => {
            return format(timestamp, 'HH:mm')
        }

    // current user messages -> right, other user messages -> left
    return(
    <>
    <div
      className='flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
      <div ref={scrollDownRef} />
        {messages.map((message, index) => {
            const isCurrentUser = message.senderId == currentUserId;
            const hasNextMessageFromSameUser = messages[index - 1]?.senderId === messages[index].senderId;
            return(
                <>
                <div
            className='chat-message'
            key={`${message.id}-${message.timestamp}`}>
            <div
              className={cn('flex items-end', {
                'justify-end': isCurrentUser,
              })}>
              <div
                className={cn(
                  'flex flex-col space-y-2 text-base max-w-xs mx-2',
                  {
                    'order-1 items-end': isCurrentUser,
                    'order-2 items-start': !isCurrentUser,
                  }
                )}>
                <span
                  className={cn('px-4 py-2 rounded-lg inline-block', {
                    'bg-indigo-600 text-white': isCurrentUser,
                    'bg-gray-200 text-gray-900': !isCurrentUser,
                    'rounded-br-none':
                      !hasNextMessageFromSameUser && isCurrentUser,
                    'rounded-bl-none':
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}>
                  {message.content}{' '}
                  <span className='ml-2 text-xs text-gray-400'>
                    {formatTimestamp(Number(message.timestamp))}
                  </span>
                </span>
              </div>

              <div
                className={cn('relative w-6 h-6', {
                  'order-2': isCurrentUser,
                  'order-1': !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}>
              </div>
            </div>
          </div>
        </>
            )
        })}
    </div>
    </>)
}