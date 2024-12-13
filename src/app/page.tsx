import { VerticalNavbar } from '@/components/vertical-navbar'
import { ChatArea } from '@/components/chat-area'
// import UserProfile from '@/components/user/Profile';
import { WalletLoginInterface } from '@/components/walletauth/WalletLogin';
// import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {

  return (
    <>
    <div className="w-full h-screen">
      <WalletLoginInterface>
        <div className="flex flex-row h-full w-full bg-background">
          <VerticalNavbar />
          <ChatArea />
        </div>
      </WalletLoginInterface>
    </div>
    </>
  );
}