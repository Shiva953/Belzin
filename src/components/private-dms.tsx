'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserProfile } from './user-profile'

interface Message {
  id: string
  user: string
  content: string
}

export function PrivateDMs({ selectedUser }: { selectedUser: string | null }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { id: Date.now().toString(), user: 'You', content: inputValue }])
      setInputValue('')
    }
  }

  return (
    <div className="flex-1 flex">
      <div className="w-1/3 border-r">
        <h2 className="text-xl font-semibold p-4">Direct Messages</h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <UserProfile user="Alice" onStartDM={() => {}} />
          <UserProfile user="Bob" onStartDM={() => {}} />
          <UserProfile user="Charlie" onStartDM={() => {}} />
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <h2 className="text-xl font-semibold p-4">Chat with {selectedUser}</h2>
            <ScrollArea className="flex-1 p-4">
              {messages.map((message) => (
                <div key={message.id} className="mb-4">
                  <strong>{message.user}:</strong> {message.content}
                </div>
              ))}
            </ScrollArea>
            <div className="p-4 flex">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 mr-2"
              />
              <Button onClick={handleSend}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  )
}