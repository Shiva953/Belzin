import { VerticalNavbar } from '@/components/vertical-navbar'
import { ChatArea } from '@/components/chat-area'
import { WalletButton } from '@/components/ContextProvider';
import UserProfile from '@/components/user/Profile';
import { WalletLoginInterface } from '@/components/walletauth/WalletLogin';
// import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  // const { wallet, publicKey, connect, disconnect, signMessage, signIn } = useWallet();
  // const message = 'sample wallet login user'
  return (
    <>
      <WalletLoginInterface/>
       <WalletButton className='z-20 top-4 left-4'/>
        <UserProfile/>
        <div className="flex h-screen bg-background">
          {/* check authenticated for not, only then put up the chat */}
        {/* <span>The ONLY Group Chat Betting Dapp - Create Prediction Blinks IN THE CHAT ITSELF
        Bet on the chat, without leaving!</span> */}
      <VerticalNavbar />
      <ChatArea />
    </div>
    </>
  );
}