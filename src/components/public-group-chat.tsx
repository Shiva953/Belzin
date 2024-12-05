'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserProfile } from './user-profile'
import io from 'socket.io-client';
import { useWallet } from '@solana/wallet-adapter-react'

const socket = io('http://localhost:3001');


// unit implementation remains approximately this, needs to be extended to special rooms(DMs) + handle better scale
// also integrate user wallet login + db persistence + user profile
interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
}

// interface UserT {
//   userId: boolean,
// }

export function PublicGroupChat({ onStartDM }: { onStartDM: (user: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [activeUsers, setActiveUsers] = useState({userId: false});
  const wallet = useWallet()
  const userPubKey = wallet.publicKey?.toString() || 'undeff';

  // const handleSend = () => {
  //   if (inputValue.trim()) {
  //     setMessages([...messages, { id: Date.now().toString(), user: 'You', content: inputValue }])
  //     setInputValue('')
  //   }
  // }

  const sendMessage = () => {
    if (inputValue.trim()) {
      socket.emit('send-message', {message: inputValue, userId: userPubKey});
      setInputValue('');
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      setActiveUsers((prevActiveUsers) => ({...prevActiveUsers }));
      console.log('Connected to WebSocket server');
    });
  
    socket.on('disconnect', () => {
      setActiveUsers((prevActiveUsers) => ({...prevActiveUsers }));
      console.log('Disconnected from WebSocket server');
    });
  
    socket.on('new-message', (message) => {
      // Handle incoming message
      setMessages((prevMessages) => [...prevMessages, message]);
      console.log('Received message:', message);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      // Handle error, e.g., display an error message to the user
    });
  
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-message');
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <h1 className="text-2xl font-bold p-4">Public Group Chat</h1>
      <div>
        Users
      <ul>
        {Object.keys(activeUsers).map((userId) => (
          <li key={userId}>{userId} is online</li>
        ))}
      </ul>
      </div>
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <UserProfile user={message.senderId} onStartDM={() => onStartDM(message.senderId)} />
            <p className="mt-1">{message.content}</p>
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
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  )
}