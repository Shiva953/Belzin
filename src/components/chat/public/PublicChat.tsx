/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Public GC Interface
import { Messages } from '@/components/Messages';
import { MessageInput } from '@/components/MessageInput';
import { pusherClient } from '@/lib/pusher';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { Message,ChatMessage, ChatBet } from '@/types';
import { StarsBackground } from "@/components/ui/stars-background";
import { Badge } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from '@/components/Messages';
import { User } from '@prisma/client';
import { useState,useEffect } from 'react';
import { CommandSearch } from '@/components/bet/BetSearch';

export function OnlineUsers({ channel, currentUser }: { channel: string; currentUser: User }) {
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  
    useEffect(() => {
      // Subscribe to presence channel
      const presenceChannel = pusherClient.subscribe(`presence-${channel}`);
  
      // Initial list of members
      presenceChannel.bind('pusher:subscription_succeeded', (members: any) => {
        const users: User[] = [];
        members.each((member: any) => {
          if (member.info) users.push(member.info);
        });
        setOnlineUsers(users);
      });
  
      // User joined
      presenceChannel.bind('pusher:member_added', (member: any) => {
        if (member.info) {
          setOnlineUsers(prev => [...prev, member.info]);
        }
      });
  
      // User left
      presenceChannel.bind('pusher:member_removed', (member: any) => {
        setOnlineUsers(prev => prev.filter(user => user.id !== member.info?.id));
      });
  
      return () => {
        pusherClient.unsubscribe(`presence-${channel}`);
      };
    }, [channel]);
  
    return (
      <div className="p-4 border-l border-border bg-black/20 w-64">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Online Users</h3>
          <Badge className="text-xs">
            {onlineUsers.length} online
          </Badge>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-4">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <div className="relative">
                  <UserAvatar user={user} />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.username}</span>
                  {currentUser?.id === user.id && (
                    <span className="text-xs text-muted-foreground">(You)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

export function PublicChat({ userId, initialMessages, bets } : { userId: string, initialMessages: Message[], bets: ChatBet[] }){
    return (
    <WalletProvider wallets={[]} autoConnect>
      <WalletModalProvider>
        <div className="flex h-full w-full">
          <div className="flex-1 flex flex-col">
          <CommandSearch chatBets={bets}/>
            <div className="flex-1 overflow-scroll">
              
              {initialMessages.length > 0 && userId && (
                <Messages
                  initialMessages={initialMessages}
                  currentUserId={userId}
                  channel="global-chat"
                  event="incoming-message"
                />
              )}
            </div>
            <div className="flex-shrink-0">
              <MessageInput />
            </div>
          </div>
          {/* <OnlineUsers channel="global-chat" currentUser={currentUser} /> */}
        </div>
      </WalletModalProvider>
    </WalletProvider>
      );
}