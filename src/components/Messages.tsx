/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { pusherClient } from '@/lib/pusher';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Blink, useAction } from "@dialectlabs/blinks";
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana"
import { User } from '@prisma/client';
import { Message,ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { getRandomGradient } from '@/app/lib/gradient';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2,ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { shortenPublicKey } from '@/app/lib/utils';
import { Button } from './ui/button';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import Image from 'next/image';
import { formatTimestamp } from '@/app/lib/utils';
import { StarsBackground } from './ui/stars-background';
import '@dialectlabs/blinks/index.css';

export function Messages({initialMessages, currentUserId, channel, event} : {initialMessages: Message[]|ChatMessage[], currentUserId: string, channel: string, event: string}){
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const senderColors = useMemo(() => new Map(), []);
    const scrollDownRef = useRef<HTMLDivElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const getSenderColor = (senderId: string) => {
    if (!senderColors.has(senderId)) {
      const red = Math.floor(Math.random() * 100) + 100; 
      const green = Math.floor(Math.random() * 100) + 100;
      const color = `rgb(${red},${green},184)`;
      senderColors.set(senderId, color);
    }
    return senderColors.get(senderId);
  };

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
    const scrollToBottom = () => {
      if (containerRef.current && shouldScrollToBottom) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
  };

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => {
        if (Number(message.id) > 0) {
            const optimisticIndex = prev.findIndex(m => 
                m.content === message.content && 
                Number(m.id) < 0
            );
            if (optimisticIndex !== -1) {
                const newMessages = [...prev];
                newMessages[optimisticIndex] = message;
                return newMessages;
            }
        }
        return [message, ...prev];
    });
    setShouldScrollToBottom(true);
    }, []);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShouldScrollToBottom(isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
}, []);

    useEffect(() => {
      pusherClient.subscribe(channel)
      const messageHandler = (message: Message) => {
          addMessage(message);
      }
      pusherClient.bind(event, messageHandler)

      return () => {
          pusherClient.unsubscribe(channel)
          pusherClient.unbind(event, messageHandler)
      }
  }, [channel, event, addMessage]);

        const handleStartDM = async (friendId: string | number) => {
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
          }
        };

        return (
          <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
          <div ref={containerRef} className='h-full overflow-y-scroll overflow-scroll bg-gradient-to-b from-background to-card'>
            <div className='flex flex-col-reverse gap-4 p-3'>
                {/* <div ref={scrollDownRef} /> */}
                {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                        No messages yet. Start the conversation!
                    </div>
                ) : 
                (messages.map((message, index) => {
                    const isCurrentUser = message.senderId == currentUserId;
                    // const user = users[message.senderId!];
                    const userN = message.sender;
                    console.log("User: ",userN)
                    const hasNextMessageFromSameUser = index > 0 && messages[index - 1]?.senderId === message.senderId;
                    const red = Math.floor(Math.random() * 100) + 100;
                    const green = Math.floor(Math.random() * 100) + 100;
                    const color = `rgb(${red},${green},184)`;
                    const bgColourForNonCurrentUser = message.senderId ? `bg-[${color}] text-secondary-foreground`: `bg-[rgb(18,25,180)] text-secondary-foreground`
                    return (
                        <div
                            key={`${message.id}-${message.timestamp}`}
                            className={cn('flex items-end gap-2', {
                                'flex-row-reverse': isCurrentUser,
                            })}
                        >
                            <Popover>
                                <PopoverTrigger>
                                    {userN && <UserAvatar user={userN} />}
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0 rounded-xl">
                                    <div className="flex flex-col bg-[rgb(14,15,15)] rounded-xl overflow-hidden">
                                        <div className="p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {userN && <UserAvatar user={userN} size="large" />}
                                                    <div className='flex flex-col'>
                                                    <span className="text-sm font-semibold opacity-50">{message.sender?.username || 'Unknown User'}</span>
                                                    <div className="font-mono text-[1rem] font-bold tracking-tight cursor-pointer hover:underline glow-effect-text-large opacity-80 hover:opacity-100" onClick={() => window.open(`https://solscan.io/account/${userN?.walletPublicKey}`)}>
                                                        {shortenPublicKey(userN?.walletPublicKey || 'So11111111111111111111111111111111111111112')}
                                                    </div>
                                                    </div>
                                                </div>
                                                <Button size="sm" className="text-[rgb(81,252,161)] bg-[rgb(10,46,27)] hover:bg-[rgb(5,21,12)] hover:text-[rgb(78,241,154)]" onClick={() => window.open(`https://solscan.io/account/${userN?.walletPublicKey}`)}>
                                                    Account<ExternalLink/>
                                                </Button>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-3xl font-bold">$12000</div>
                                                <div className="text-sm text-gray-400">Total Amount Betted</div>
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg p-3">
                                                <Button className="bg-[rgb(46,10,23)] text-[rgb(236,72,153)] w-full rounded-xl">
                                                  View Bets for <span className='font-mono font-bold text-[rgb(255,114,184)]'>{shortenPublicKey(userN?.walletPublicKey || 'So11111111111111111111111111111111111111112')}</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <MessageContainer message={message} isCurrentUser={isCurrentUser} hasNextMessageFromSameUser={hasNextMessageFromSameUser}/>
                        </div>
                    );
                }))}
                <div ref={scrollDownRef} />
            </div>
        </div>
          </WalletModalProvider>
    </WalletProvider>
        );
}

export function UserAvatar({ user, size = "default" }: { user: User, size?: "default" | "large" }) {
  const gradient = getRandomGradient(user?.id);
  const sizeClasses = size === "large" ? "w-12 h-12" : "w-10 h-10";
    
    return (
      <Avatar className={cn(
        sizeClasses,
        `bg-gradient-to-br ${gradient.normal} hover:${gradient.hover}`
      )}>
        <AvatarImage 
          src={user?.imageUrl || ''} 
          alt={user?.username || 'User'} 
        />
        <AvatarFallback className="bg-transparent p-0">
          <Image 
            src="https://we-assets.pinit.io/DHcjHDtfTwchgYfwN6wPCesaWmLhyWY9KYcdRugGMsAr/399b6119-3c69-48b2-8702-f5f6f1039a82/563" 
            alt={user?.username || 'User'} 
            width={"600"}
            height={"600"}
            className="w-full h-full object-cover"
          />
        </AvatarFallback>
      </Avatar>
    );
}

const MessageContainer = ({message, isCurrentUser, hasNextMessageFromSameUser}: {message: Message, isCurrentUser: boolean, hasNextMessageFromSameUser: boolean}) => {
  const betUrlRegex = /^https?:\/\/belzin\.vercel\.app\/api\/actions\/bet\?betId=[a-zA-Z0-9-_]+$/;
  // const betUrlRegex = /http:\/\/localhost:3000\/api\/actions\/bet\?betId=[a-zA-Z0-9]+/;
  const content = message.content || '';
  const match = content.match(betUrlRegex);

  if (match) {
    const actionUrl = match[0];
    return (
      <div
        className={cn('max-w-[70%] rounded-2xl px-4 py-2 relative overflow-hidden', {
          'bg-secondary text-white': isCurrentUser,
          'text-secondary-foreground': !isCurrentUser,
          'rounded-br-sm': isCurrentUser && !hasNextMessageFromSameUser,
          'rounded-bl-sm': !isCurrentUser && !hasNextMessageFromSameUser
        })}
      >
        <div>
          <BlinkComponent actionApiUrl={actionUrl} />
        </div>
        <div className="text-xs text-foreground/50 mt-1 text-right">
          {formatTimestamp(Number(message.timestamp))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('max-w-[70%] rounded-2xl px-4 py-2 relative overflow-hidden text-white', {
        'bg-[rgb(31,166,139)]': isCurrentUser,
        'bg-secondary': !isCurrentUser,
        'rounded-br-sm': isCurrentUser && !hasNextMessageFromSameUser,
        'rounded-bl-sm': !isCurrentUser && !hasNextMessageFromSameUser
      })}
    >
      <div className="flex flex-col">
        <span className="text-sm font-semibold opacity-70 mb-1">{message.sender?.username || 'Unknown User'}</span>
        <div className='font-medium tracking-tight glow-effect-text container break-words whitespace-pre-wrap'>{content}</div>
      </div>
      <div className="text-xs text-foreground/50 mt-1 text-right">
        {formatTimestamp(Number(message.timestamp))}
      </div>
    </div>
  )
}

const BlinkComponent = ({actionApiUrl}: {actionApiUrl: string}) => {
  console.log("Action API Url: ",actionApiUrl)
  const { adapter } = useActionSolanaWalletAdapter(new Connection(clusterApiUrl("devnet"), "confirmed"));
  const { action, isLoading } = useAction({url: actionApiUrl});
  
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
      <div className='h-full w-[32rem]'>
      <Blink action={action} stylePreset='x-dark' adapter={adapter} securityLevel={"all"}/>
      </div>
    );
};