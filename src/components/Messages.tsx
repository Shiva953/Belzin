/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import {pusherClient} from '@/lib/pusher';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Action, Blink, ActionsRegistry, useAction } from "@dialectlabs/blinks";
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana"
import { format } from "date-fns";
import { Message } from './chat/public/PublicChat';
import { cn } from '@/lib/utils';
import { ChatMessage } from './chat/public/PublicChat';
import { getRandomGradient } from '@/app/lib/gradient';
import { fetchProfile } from '@/app/lib/utils';
import { UserT } from './user-profile';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Copy,Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from './ui/skeleton';
import { shortenPublicKey } from '@/app/lib/utils';
import { Button } from './ui/button';
import { MessageSquare,ExternalLink } from 'lucide-react';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@dialectlabs/blinks/index.css';
import Image from 'next/image';

//REMOVE THE /user/getProfile(fetchUserData) call FOR EVERY SINGLE MESSAGE, IT SHOULD BE AN INHERENT PROPERTY OF THE MESSAGE(SENDER ID SHOULD BE MAPPED TO USER)
//THE ABOVE SHOULD PREVENT RE-RENDER ISSUE
export function Messages({initialMessages, currentUserId, channel, event} : {initialMessages: Message[]|ChatMessage[], currentUserId: string, channel: string, event: string}){
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [users, setUsers] = useState<Record<string, UserT>>({});

    const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        description: "Copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard",
        duration: 2000,
      });
    }
  };
  

    useEffect(() => {
        pusherClient.subscribe(channel)
        const messageHandler = (message: Message) => {
            setMessages((prev) => [message, ...prev])
            fetchUserData(message.senderId!);
        }
        pusherClient.bind(event, messageHandler)
        // initialMessages.forEach((message) => fetchUserData(message.senderId!));
        initialMessages.forEach((message) => {
          if (message.senderId) {
              fetchUserData(message.senderId);
          }
      });

        return () => {
          pusherClient.unsubscribe(
            channel
          )
          pusherClient.unbind(event, messageHandler)
        }
    }, [initialMessages])

        const scrollDownRef = useRef<HTMLDivElement | null>(null)

        const formatTimestamp = (timestamp: number) => {
            return format(timestamp, 'HH:mm')
        }

        const handleStartDM = async (friendId: string | number) => {
          // Handle DM logic here
          console.log('Starting DM with user:', friendId);

          const fid = typeof friendId === 'string' ? Number(friendId) : friendId;

          const res = await fetch(`/api/initiateDM`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              initiatorUserId: Number(currentUserId),
              friendId: fid,
            })
          })
          const data = await res.json();
          if(data){
            console.log(data)
            // toast({
            //   content: ""
            // })
          }
        };

        const fetchUserData = async (userId: string | number) => {
          if (userId && !users[userId]) {
            try {
                const profile = await fetchProfile('', Number(userId));
                setUsers((prev) => ({ ...prev, [userId]: profile.user }));
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        }
        };

        return (
          <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
          <div className='h-full overflow-y-auto bg-gradient-to-b from-background to-card'>
            <div className='flex flex-col-reverse gap-4 p-3'>
                <div ref={scrollDownRef} />
                {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                        No messages yet. Start the conversation!
                    </div>
                ) : 
                (messages.map((message, index) => {
                    const isCurrentUser = message.senderId == currentUserId;
                    const user = users[message.senderId!];
                    const hasNextMessageFromSameUser = index > 0 && messages[index - 1]?.senderId === message.senderId;
                    return (
                        <div
                            key={`${message.id}-${message.timestamp}`}
                            className={cn('flex items-end gap-2', {
                                'flex-row-reverse': isCurrentUser,
                            })}
                        >
                            <Popover>
                                <PopoverTrigger>
                                    <UserAvatar user={user} />
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0">
                                    <div className="flex flex-col bg-black rounded-lg overflow-hidden">
                                        <div className="p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <UserAvatar user={user} size="large" />
                                                    <div className="font-mono text-sm">
                                                        {shortenPublicKey(user?.walletPublicKey || '')}
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="text-white" onClick={() => window.open(`https://solscan.io/account/${user.walletPublicKey}`)}>
                                                    Account
                                                </Button>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-3xl font-bold">$0.00</div>
                                                <div className="text-sm text-gray-400">BALANCE</div>
                                            </div>
                                            <div className="flex items-center justify-between bg-gray-900 rounded-lg p-3">
                                                <div className="flex items-center space-x-2">
                                                    <Image src={"https://s3.coinmarketcap.com/static-gravity/image/5cc0b99a8dd84fbfa4e150d84b5531f2.png"} alt="Solana" width={"6"} height={"6"} className="w-6 h-6"/>
                                                    <div>
                                                        <div className="font-semibold">Solana</div>
                                                        <div className="text-sm text-gray-400">0 SOL</div>
                                                    </div>
                                                </div>
                                                <Button variant="secondary" size="sm">
                                                    Swap
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <div
                                className={cn('max-w-[70%] rounded-2xl px-4 py-2 relative glow-effect', {
                                    'bg-primary text-primary-foreground': isCurrentUser,
                                    'bg-secondary text-secondary-foreground': !isCurrentUser,
                                    'rounded-br-sm': isCurrentUser && !hasNextMessageFromSameUser,
                                    'rounded-bl-sm': !isCurrentUser && !hasNextMessageFromSameUser
                                })}
                            >
                                <MessageContent content={message.content || ''} />
                                <div className="text-xs text-foreground/50 mt-1 text-right">
                                    {formatTimestamp(Number(message.timestamp))}
                                </div>
                            </div>
                        </div>
                    );
                }))}
            </div>
        </div>
          </WalletModalProvider>
    </WalletProvider>
        );
}

export function UserAvatar({ user, size = "default" }: { user: UserT, size?: "default" | "large" }) {
  const gradient = getRandomGradient(user?.id);
  const sizeClasses = size === "large" ? "w-12 h-12" : "w-10 h-10";
    
    return (
        <Avatar className={cn(
            sizeClasses,
            `bg-gradient-to-br ${gradient.normal} hover:${gradient.hover}`
        )}>
            <AvatarImage src={user?.imageUrl} alt={user?.username} />
            <AvatarFallback className="bg-transparent text-white font-bold">
                {user?.username?.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
        </Avatar>
    );
}

const MessageContent = ({ content }: { content: string }) => {
  // Regular expression to match the betting action URL
  const betUrlRegex = /http:\/\/localhost:3000\/api\/actions\/bet\?betId=[a-zA-Z0-9]+/;
  const match = content.match(betUrlRegex);
  
  if (match) {
    const actionUrl = match[0];
    return (
      <div>
        {/* <div className="mb-2">{content}</div> */}
        <BlinkComponent actionApiUrl={actionUrl} />
      </div>
    );
  }
  
  return <div className='font-bold tracking-tighter'>{content}</div>;
};

const BlinkComponent = ({actionApiUrl}: {actionApiUrl: string}) => {
  console.log("Action API Url: ",actionApiUrl)
  const { adapter } = useActionSolanaWalletAdapter(new Connection(clusterApiUrl("devnet"), "confirmed"));
  const { action, isLoading } = useAction({url: actionApiUrl});

  // const wallets = useMemo(() => [new PhantomWalletAdapter()].filter((item) => item && item.name && item.icon), []);
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground mt-2 h-20 bg-muted/50 rounded-lg p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading Blink...</span>
      </div>
    );
  }

  if (!action) {
    return <div className="text-sm text-muted-foreground">Failed to load bet details</div>;
  }

  return (
    // <WalletProvider wallets={[]} autoConnect>
    //   <WalletModalProvider>
      <div className='h-full w-[32rem]'>
      <Blink action={action} stylePreset='x-dark' adapter={adapter} securityLevel={"all"}/>
      </div>
    // </WalletModalProvider>
    // </WalletProvider>
    );
};
