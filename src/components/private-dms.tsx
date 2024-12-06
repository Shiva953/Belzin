'use client'

import { useEffect, useState, useRef, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { UserProfile } from './user-profile'
import { MessageCircle, Copy } from 'lucide-react'
import { createHash } from 'crypto'
import { useWallet } from '@solana/wallet-adapter-react'
import { io, Socket } from 'socket.io-client'
import { Card, CardContent } from './ui/card'

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

/* eslint-disable no-unused-vars */
interface ServerToClientEvents {
  'room-created': (code: string) => void;
  'joined-room': (data: { roomCode: string; messages: Message[] }) => void;
  'new-message': (message: Message) => void;
  'active-users': (users: UserT[]) => void
  'user-joined': (userCount: number) => void;
  'user-left': (userCount: number) => void;
  error: (message: string) => void;
}

interface ClientToServerEvents {
  'create-room': () => void;
  'join-room': (roomCode: string) => void;
  'send-message': (data: { roomCode: string; message: string; userId: string ,name:string}) => void;
  'set-user-id': (userId: string) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:3002");
// create room -> anyone with room Id can enter the chat
// create room create + room id input form
export function PrivateDMRoomChat(){
  const [username, setUsername] = useState(''); //take the user public key
  const [userId, setUserId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [userInputCode, setUserInputCode] = useState('');
  const [userCount, setUserCount] = useState(0)
  const [connected, setIsConnected] = useState(false);
  const wallet = useWallet();
  const [messages, setMessages] = useState<Message[]>([])
  const [activeUsers, setActiveUsers] = useState<UserT[]>([])
  const [inputValue, setInputValue] = useState('')
  const userPubKey = wallet?.publicKey?.toString() || 'undeff'
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  console.log('RoomId: ', roomId)
  console.log(messages)


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    //SERVER TO CLIENT EVENTS IN USE-EFFECT
    socket.on('room-created', (code) => {
      setRoomId(code);
      // setIsLoading(false);
    });

    socket.on('joined-room', ({ roomCode, messages }) => {
      setRoomId(roomCode);
      setMessages(messages);
      setIsConnected(true);
      setUserInputCode('');
    });

    socket.on('active-users', (users) => {
      setActiveUsers(users);
      console.log("Active Users in client: ", users);
    })

    socket.on('user-joined', (userCount) => {
      setUserCount(userCount)
      console.log('user joined')
    });

    socket.on('user-left', (userCount) => {
      setUserCount(userCount)
      console.log('user left')
    });

    socket.on('new-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message])
      console.log("Received message: ", message)
    })

    socket.on('error', (error) => {
      console.log('error: ', error)
    })

    return () => {
      socket.off('room-created');
      socket.off('joined-room');
      socket.off('new-message');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('error');
    };

  }, [])

  //setting user
  useEffect(() => {
    if (wallet.publicKey) {
      const hash = createHash('sha256').update(username).digest('hex');
      const newUserId = `${hash}-${wallet.publicKey.toString()}`;
      localStorage.setItem('chatUser', newUserId);
      setUserId(newUserId);
      socket.emit('set-user-id', newUserId);
    }
  }, [username, wallet.publicKey]);

  
  const handleCreateRoom = () => {
    // const roomCode = generateRoomCode();
    // create room with roomId = room code
    // setRoomId(roomCode);
    socket.emit('create-room')
  }

  const handleJoinRoom = () => {
    console.log(userInputCode)
    console.log(username)
    if (!userInputCode.trim()) {
      return;
    }
    if (!username.trim()) {
      return;
    }
    console.log('did we come here')
    socket.emit('join-room', JSON.stringify({roomId:userInputCode.toUpperCase(),username}));
  };

  const sendMessage = (e: any) => {
    e.preventDefault();
    if (inputValue.trim() && userId) {
      socket.emit('send-message', { roomCode: roomId, message: inputValue, userId: userId, name: username})
      setInputValue('')
    }
  }

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }


  return (
    <>
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 rounded-lg border border-zinc-800 p-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            <h1 className="text-2xl font-mono">Real Time Chat</h1>
          </div>
          <p className="text-zinc-400 font-mono">
            temporary room that expires after all users exit
          </p>
        </div>

        <CardContent>
            {!connected ? (
              <div className="space-y-4">
                <Button 
                  onClick={handleCreateRoom} 
                  className="w-full text-lg py-6"
                  size="lg"
                >
                    Create New Room
                </Button>
                <div className="flex gap-2">
                  <Input
                    value={username || userPubKey}
                    onChange={(e) => setUsername(e.target.value || userPubKey)}
                    placeholder="Username/Wallet Address"
                    className="text-lg py-5 text-black"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={userInputCode}
                    onChange={(e) => setUserInputCode(e.target.value)}
                    placeholder="Enter Room Code"
                    className="text-lg py-5 text-black"
                  />
                  <Button 
                    onClick={handleJoinRoom}
                    size="lg"
                    className="px-8"
                  >
                    Join Room
                  </Button>
                </div>
   
                {roomId && (
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Share this code with your friend</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono text-2xl font-bold text-black">{roomId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(roomId)}
                        className="h-8 w-8"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-7">
                <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>Room Code: <span className="font-mono font-bold text-black">{roomId}</span></span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(roomId)}
                      className="h-6 w-6"
                    >
                      <Copy className="h-3 w-3 text-black" />
                    </Button>
                  </div>
                  <span>Users: {userCount}</span>
                  <ul>
                    {activeUsers.map((u) => {
                      return(
                        <>
                        <li key={u.userId}>
                          {u.username}
                        </li>
                        </>
                      )
                    })}
                  </ul>
                </div>

                <div className="h-[430px] overflow-y-auto border rounded-lg p-4 space-y-2">
                  <MessageGroup messages={messages} userId={userId} />
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    onChange={handleMessageChange}
                    placeholder="Type a message..."
                    className="text-lg py-5 text-black"
                  />
                  <Button 
                    type="submit"
                    size="lg"
                    className="px-8"
                  >
                    Send
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
      </div>
      </div>
    </>
  )
}

function generateRoomCode(length: number = 6): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.write([
    new ClipboardItem({
      'text/plain': new Blob([text], { type: 'text/plain' }),
    }),
  ]).then(() => {
    console.log('copied')
  }).catch(() => {
    console.log('Failed to copy room code');
  });
};

export function MessageGroup({ messages, userId }: { messages: Message[], userId: string }){
  return (
    <>
      {messages.map((msg, index) => {
        const isFirstInGroup = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
        
        return (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.senderId === userId ? 'items-end' : 'items-start'
            }`}
          >
            {isFirstInGroup && (
              <div className="text-xs text-muted-foreground mb-0.5">
                {msg.sender}
              </div>
            )}
            <div
              className={`inline-block rounded-lg px-3 py-1.5 break-words ${
                msg.senderId === userId 
                  ? 'bg-primary text-primary-foreground text-white'
                  : 'bg-muted text-black'
              } ${!isFirstInGroup ? 'mt-0.5' : 'mt-1.5'}`}
            >
              {msg.content}
            </div>
          </div>
        );
      })}
    </>
  );
}