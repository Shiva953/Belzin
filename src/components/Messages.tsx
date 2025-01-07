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
import { Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from './ui/skeleton';
import { shortenPublicKey } from '@/app/lib/utils';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

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
          <div className='h-full overflow-y-auto'>
            <div className='flex flex-col-reverse gap-4 p-3'>
              <div ref={scrollDownRef} />
              { messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                        No messages yet. Start the conversation!
                    </div>
                ) : 
              (messages.map((message, index) => {
                const isCurrentUser = message.senderId == currentUserId;
                const user = users[message.senderId!];
                const hasNextMessageFromSameUser = index > 0 && messages[index - 1]?.senderId === message.senderId;
                
                const hasActionUrl = message.content?.includes("http://localhost:3000/api/actions/bet?betId=")
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
                      <PopoverContent className="w-auto p-0">
                        <div className="flex flex-col gap-2 p-3">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} size="large" />
                            <button
                              onClick={() => copyToClipboard(user?.walletPublicKey || '')}
                              className="flex items-center gap-2 px-3 py-2 bg-secondary/80 hover:bg-secondary rounded-lg text-sm font-mono"
                            >
                              {shortenPublicKey(user?.walletPublicKey || '')}
                              <Copy className="h-3.5 w-3.5 opacity-70" />
                            </button>
                          </div>
                          {channel=='global-chat' && !isCurrentUser && (
                            <Button 
                            variant="secondary" 
                            className="w-full"
                            onClick={() => handleStartDM(user?.id)}
                          >
                          <MessageSquare className="w-4 h-4 mr-2" />
                            Start DM
                          </Button>
                        )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <div
                      className={cn('max-w-[70%] rounded-2xl px-4 py-2 relative', {
                        'bg-primary text-primary-foreground': isCurrentUser,
                        'bg-secondary text-secondary-foreground': !isCurrentUser,
                        'rounded-br-sm': isCurrentUser && !hasNextMessageFromSameUser,
                        'rounded-bl-sm': !isCurrentUser && !hasNextMessageFromSameUser
                      })}
                    >
                      {/* <div className="break-words">{message.content}</div> */}
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
        );
}

function UserAvatar({ user, size = "default" }: { user: UserT, size?: "default" | "large" }) {
  const gradient = getRandomGradient(user?.id);
  const sizeClasses = size === "large" ? "w-10 h-10" : "w-8 h-8";
  
  return (
    <Avatar className={cn(
      sizeClasses,
      "bg-gradient-to-br transition-all duration-300",
      gradient.normal,
      "hover:bg-gradient-to-br",
      gradient.hover
    )}>
      <AvatarImage src={user?.imageUrl} alt={user?.username} />
      <AvatarFallback className="bg-transparent text-primary-foreground">
        {' '}
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
  
  return <div>{content}</div>;
};

const BlinkComponent = ({actionApiUrl}: {actionApiUrl: string}) => {
  console.log("Action API Url: ",actionApiUrl)
  const { adapter } = useActionSolanaWalletAdapter(new Connection(clusterApiUrl("devnet"), "confirmed"));
  const { action, isLoading } = useAction({url: actionApiUrl});

  const wallets = useMemo(() => [new PhantomWalletAdapter()].filter((item) => item && item.name && item.icon), []);
  
  if (isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }

  if (!action) {
    return <div className="text-sm text-muted-foreground">Failed to load bet details</div>;
  }

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
      <div className='h-full w-[32rem]'>
      <Blink action={action} stylePreset='x-dark' adapter={adapter} />
      </div>
    </WalletModalProvider>
    </WalletProvider>
    );
};
