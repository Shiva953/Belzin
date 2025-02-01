/* eslint-disable @typescript-eslint/no-unused-vars */
import { BetsPlaced } from "@/components/bet/BetsForUser";

export default async function BetForGivenUser({ params }: { params: Promise<{ userId: string }> }){
    const { userId } = await params;
    const userAddress = userId;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.NODE_ENV === 'development' 
                    ? 'http://localhost:3000' 
                    : 'https://belzin.vercel.app');
    const response = await fetch(`${baseUrl}/api/betsForUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userAddress: userAddress
        }),
      })
      const betsForGivenUser = await response.json();
    
    return(
        <>
        <BetsPlaced bets={betsForGivenUser} userAddress={userAddress}/>
        </>
    )
}