import { WalletButton } from "@/components/ContextProvider";
import { PrivateDMRoomChat } from "@/components/private-dms";

export default function Home(){
    return(
        <>
        <WalletButton className='z-20 top-4 left-4'/>
        <div className="flex h-screen bg-background mx-auto justify-center items-center">
        <PrivateDMRoomChat/>
        </div>
        </>
    )
}