import { VerticalNavbar } from '@/components/vertical-navbar'
import { ChatArea } from '@/components/chat-area'
import { WalletButton } from '@/components/ContextProvider';

export default function Home() {
  return (
    <>
       <WalletButton className='z-20 top-4 left-4'/>
        <div className="flex h-screen bg-background">
        {/* <span>The ONLY Group Chat Betting Dapp - Create Prediction Blinks IN THE CHAT ITSELF
        Bet on the chat, without leaving!</span> */}
      <VerticalNavbar />
      <ChatArea />
    </div>
    </>
  );
}