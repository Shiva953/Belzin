// 'use client'

// import { useState, useEffect } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { UserProfile } from './user-profile'
// import { io, Socket} from 'socket.io-client';
// import { useWallet } from '@solana/wallet-adapter-react'


// // unit implementation remains approximately this, needs to be extended to special rooms(DMs) + handle better scale
// // also integrate user wallet login + db persistence + user profile
// interface Message {
//   id: string;
//   content: string;
//   senderId: string;
//   sender: string;
//   timestamp: Date;
// }

// interface UserT {
//   userId: string
//   username: string
// }

// /* eslint-disable no-unused-vars */
// interface ServerToClientEvents {
//   'connect': () => void;
//   'active-users': (users: UserT[]) => void;
//   'new-message': (message: Message) => void;
//   'user-disconnected': () => void;
//   'disconnect': () => void;
//   error: (message: string) => void;
// }

// interface ClientToServerEvents {
//   'send-message': (message: {message: string; sender: string; userId: string}) => void;
//   'set-user-id': (user: UserT) => void;
//   'user-disconnected': (userId: string) => void;
// }

// const socket:Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3001');

// export function PublicGroupChat({ onStartDM }: { onStartDM: (user: string) => void }) {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [inputValue, setInputValue] = useState('')
//   const [activeUsers, setActiveUsers] = useState<UserT[]>([]);
//   const [userId, setUserId] = useState<string>('');
//   const wallet = useWallet()
//   const userPubKey = wallet.publicKey?.toString() || 'undeff';

//   console.log(activeUsers)
//   // const [username, setUsername] = useState('');

//   const sendMessage = () => {
//     if (inputValue.trim() && userId) {
//       socket.emit('send-message', {message: inputValue, sender: userPubKey.substring(0,4), userId: userId});
//       setInputValue('');
//     }
//   };

//   useEffect(() => {
//     if (userId && !wallet.publicKey) {
//       // Wallet has been disconnected
//       socket.emit('user-disconnected', userId);
//     }
//   }, [wallet.publicKey, userId]);

//   useEffect(() => {
//     // In wallet auth scenario, you've to check the db for the userId instead of localstorage
//     // but in wallet login, every user with a DIFFERENT wallet -> DIFFERENT userId, hence on connecting new wallet, user changes
//     // const storedUserId = localStorage.getItem('chatUserId'); //checking if user already exists
//     // const newUserId = storedUserId || crypto.randomUUID();
//     // crypto.getRandomValues()
//       // Ensure a new userId if wallet changes
//       // localStorage.clear()
//       if (wallet.publicKey) {
//         // const storedUserId = localStorage.getItem('chatUser');
//         const newUserId = (crypto.randomUUID() + '-' + wallet.publicKey.toString());
//         const username = wallet.publicKey.toString().substring(0,4);
//         // if(!storedUserId){
//         localStorage.setItem('chatUser', newUserId);
//         setUserId(newUserId);
//         // }
//         socket.emit('set-user-id', {userId: newUserId, username});
//       }
    
//   }, [wallet.publicKey])

//   useEffect(() => {
//     socket.on('connect', () => {
//       setActiveUsers((prevActiveUsers) => ({...prevActiveUsers }));
//       console.log('Connected to WebSocket server');
//     });
  
//     socket.on('disconnect', () => {
//       setActiveUsers((prevActiveUsers) => ({...prevActiveUsers }));
//       console.log('Disconnected from WebSocket server');
//     });

//   //   if (userId && !wallet.publicKey) {
//   //     // Wallet has been disconnected
//   //     socket.emit('user-disconnected', userId);
//   //     setUserId('');
//   //     localStorage.removeItem('chatUser');
//   //   }
//   // }, [wallet.publicKey, userId]);
  
//     socket.on('new-message', (message) => {
//       // Handle incoming message
//       setMessages((prevMessages) => [...prevMessages, message]);
//       console.log('Received message:', message);
//     });

//     socket.on('active-users', (users: UserT[]) => {
//       setActiveUsers(users);
//       console.log('Active users updated:', users);
//     });

//     socket.on('error', (error) => {
//       console.error('WebSocket error:', error);
//     });
  
//     return () => {
//       socket.off('connect');
//       socket.off('disconnect');
//       socket.off('new-message');
//       socket.off('active-users')
//     };
//   }, []);

//   return (
//     <div className="flex-1 flex flex-col">
//       <h1 className="text-2xl font-bold p-4">Public Group Chat</h1>
//       <div>
//         Users Online: {activeUsers.length}
//         <ul>
//           {activeUsers.map((user) => (
//             <li key={user.userId}>{user.username || user.userId.substring(0,4)}</li>
//           ))}
//         </ul>
//       </div>
//       <ScrollArea className="flex-1 p-4">
//         {messages.map((message) => (
//           <div key={message.id} className="mb-4">
//             <UserProfile user={message.sender} onStartDM={() => onStartDM(message.senderId)} />
//             <p className="mt-1">{message.content}</p>
//           </div>
//         ))}
//       </ScrollArea>
//       <div className="p-4 flex">
//         <Input
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           placeholder="Type a message..."
//           className="flex-1 mr-2"
//         />
//         <Button onClick={sendMessage}>Send</Button>
//       </div>
//     </div>
//   )
// }

'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
// import { UserProfile } from './user-profile'
import { io, Socket } from 'socket.io-client'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Send, Users } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { createHash } from 'crypto'

interface Message {
  id: string
  content: string
  senderId: string
  sender: string
  timestamp: Date
}

interface UserT {
  userId: string
  username: string
}

interface ServerToClientEvents {
  'connect': () => void
  'active-users': (users: UserT[]) => void
  'new-message': (message: Message) => void
  'user-disconnected': () => void
  'disconnect': () => void
  error: (message: string) => void
}

interface ClientToServerEvents {
  'send-message': (message: { message: string; sender: string; userId: string }) => void
  'set-user-id': (user: UserT) => void
  'user-disconnected': (userId: string) => void
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3001')

export function PublicGroupChat({ onStartDM }: { onStartDM: (user: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [activeUsers, setActiveUsers] = useState<UserT[]>([])
  const [userId, setUserId] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wallet = useWallet()
  const userPubKey = wallet.publicKey?.toString() || 'undeff'
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sendMessage = () => {
    if (inputValue.trim() && userId) {
      socket.emit('send-message', { message: inputValue, sender: userPubKey.substring(0, 4), userId: userId })
      setInputValue('')
    }
  }

  useEffect(() => {
    if (userId && !wallet.publicKey) {
      socket.emit('user-disconnected', userId)
    }
  }, [wallet.publicKey, userId])

  useEffect(() => {
    // In wallet auth scenario, you've to check the db for the userId instead of localstorage
    // but in wallet login, every user with a DIFFERENT wallet -> DIFFERENT userId, hence on connecting new wallet, user changes
    if (wallet.publicKey) {
      const hash = createHash('sha256').update(wallet.publicKey.toString()).digest('hex');
      const newUserId = `${hash}-${wallet.publicKey.toString()}`;
      const username = wallet.publicKey.toString().substring(0, 4);
      localStorage.setItem('chatUser', newUserId);
      setUserId(newUserId);
      socket.emit('set-user-id', { userId: newUserId, username });
    }
  }, [wallet.publicKey])

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
      setError(null)
      console.log('Connected to WebSocket server')
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from WebSocket server')
    })

    socket.on('new-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message])
      console.log('Received message:', message)
    })

    socket.on('active-users', (users: UserT[]) => {
      setActiveUsers(users)
      console.log('Active users updated:', users)
    })

    socket.on('error', (errorMessage) => {
      setError(errorMessage)
      console.error('WebSocket error:', errorMessage)
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('new-message')
      socket.off('active-users')
      socket.off('error')
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <Card className="flex flex-col h-[calc(100vh-4rem)] w-full mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Public Group Chat</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {activeUsers.length} Online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                <div className="flex items-start space-x-2">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.sender}`} />
                    <AvatarFallback>{message.sender}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="font-semibold"
                              onClick={() => onStartDM(message.senderId)}
                            >
                              {message.sender}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Click to start a DM</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </div>
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage} disabled={!isConnected || !inputValue.trim()}>
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}