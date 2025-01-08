/* eslint-disable @typescript-eslint/no-unused-vars */
// Public GC Interface
import { Messages } from '@/components/Messages';
import { MessageInput } from '@/components/MessageInput';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { User } from '@prisma/client';

export interface Message{
    id: string | number,
    content: string | null,
    sender: User | null,
    senderId: string | null,
    timestamp: string | null
    isAgent: boolean | null
}

export interface ChatMessage{
    id: string | number,
    content: string | null,
    sender: User | null,
    senderId: string | null,
    chatId: string | null,
    timestamp: string | null,
    isAgent: boolean | null
}


// USER PINGS AGENT WITH MESSAGE(PING IS REQUIRED) -> /api/agent route is called and stream is established -> AGENT RESPONDS + FRONTEND STATE CHANGE -> MESSAGE GETS STORED
export function PublicChat({ userId, initialMessages } : { userId: string, initialMessages: Message[] }){
    //component tree: Interface(my Messages(right) + other user Messages(left)) + MessageInput + SendMessage + (+)icon in the left(for adding bets)

    //1. check user session
    // make req to /api/userProfile to fetch the user details and pass it on to the other components

    //2. get the chatid and the roomid(or roomname)

    //3. fetch the (initial set of)messages from the db in messages component, to be displayed as soon as user enters chat

    //4. POST to /api/message/send with body containing (chatroom, sender, message, ...)[this would trigger an event in pub/sub channel + send message to db]

    //for publishing/subscribing messages to channel(in this case global chatroom) + db insertion -> req to /message/send

    //make this more stateful
    return (
    <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
        <div className='flex flex-col h-full w-full'>
            <div className='flex-1 overflow-hidden'>
                {(initialMessages.length > 0) && userId && (
                <Messages 
                    initialMessages={initialMessages} 
                    currentUserId={userId}
                    channel={'global-chat'}
                    event={'incoming-message'}
                />
                )}
            </div>
            <div className='sticky bottom-0 w-full'>
                <MessageInput />
            </div>
        </div>
        </WalletModalProvider>
    </WalletProvider>
      );
}