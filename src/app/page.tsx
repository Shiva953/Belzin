import { VerticalNavbar } from '@/components/vertical-navbar'
import { ChatArea } from '@/components/chat-area'
// import UserProfile from '@/components/user/Profile';
import { WalletLoginInterface } from '@/components/walletauth/WalletLogin';
// import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  // const { wallet, publicKey, connect, disconnect, signMessage, signIn } = useWallet();
  // const message = 'sample wallet login user'
  return (
    <>
    {/* check authenticated for not, only then put up the chat */}
      <WalletLoginInterface>
        {/* <UserProfile/> */}
        <div className="flex h-screen bg-background">
          <VerticalNavbar />
          <ChatArea />
        </div>
    </WalletLoginInterface>
    </>
  );
}