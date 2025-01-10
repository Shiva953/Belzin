/* eslint-disable @typescript-eslint/no-unused-vars */
// Public GC Interface
import { Messages } from '@/components/Messages';
import { MessageInput } from '@/components/MessageInput';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { User } from '@prisma/client';
import { Message } from '@/types';
import { StarsBackground } from "@/components/ui/stars-background";


// USER PINGS AGENT WITH MESSAGE(PING IS REQUIRED) -> /api/agent route is called and stream is established -> AGENT RESPONDS + FRONTEND STATE CHANGE -> MESSAGE GETS STORED
export function PublicChat({ userId, initialMessages } : { userId: string, initialMessages: Message[] }){
    // const handleOptimisticMessage = (message: Message) => {
    //     // Messages component will handle adding the message to its state
    //     if (messagesRef.current) {
    //         messagesRef.current.addMessage(message);
    //     }
    // };
    return (
    <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
        <div className='flex flex-col h-full w-full'>
            <div className='flex-1 overflow-scroll'>
                {(initialMessages.length > 0) && userId && (
                <Messages 
                    initialMessages={initialMessages} 
                    currentUserId={userId}
                    channel={'global-chat'}
                    event={'incoming-message'}
                />
                )}
                {/* <StarsBackground className='z--50'/> */}
            </div>
            <div className='flex-shrink-0'>
                <MessageInput />
            </div>
        </div>
        </WalletModalProvider>
    </WalletProvider>
      );
}