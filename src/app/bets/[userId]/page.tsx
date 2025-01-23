/* eslint-disable @typescript-eslint/no-unused-vars */
import { BetsPlaced } from "@/components/bet/BetsForUser";

export default async function BetForGivenUser({ params }: { params: { userId: Promise<string> } }){
    const { userId } = await params;
    const userAddress = await userId;
    console.log(userAddress)
    const response = await fetch('http://localhost:3000/api/betsForUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userAddress: userAddress
        }),
      })
      const betsForGivenUser = await response.json();
      console.log("Bets: ",betsForGivenUser)
    
    return(
        <>
        <BetsPlaced bets={betsForGivenUser} userAddress={userAddress}/>
        </>
    )
}