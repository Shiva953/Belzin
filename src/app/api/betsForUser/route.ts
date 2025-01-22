/* eslint-disable @typescript-eslint/no-unused-vars */
import { Betting,IDL } from "@/types/betting";
import { AnchorProvider, Program } from "@coral-xyz/anchor"
import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { NextResponse } from "next/server";

export async function POST(req: Request){
    try{
        const { userAddress } = await req.json();
        const userPubKey = new PublicKey(userAddress);
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const wallet = { publicKey: userPubKey } as anchor.Wallet;
        const provider = new AnchorProvider(connection, wallet, {commitment: "confirmed"});
        anchor.setProvider(provider);
        
        const programId = new PublicKey("JkF3zxfbf7pvwqbyCvYActhnqYgiw2iCaht5JvKSrVY");
        const program = new Program<Betting>(IDL as Betting, programId, provider);

        const allUserBets = (await program.account.userBet.all()).map(acc => acc.account);
        const betsForGivenUser = allUserBets.filter(userBet => userBet.user.toBase58() == userPubKey.toBase58())

        const bets = await Promise.all(betsForGivenUser.map(async(b) => {
            const bet = (await program.account.bet.fetch(b.bet))
            const betTitle = bet.title;
            const betAmount = bet.betAmount
            const isResolved = bet.resolved;
            const finalOutcome = bet.outcome;
            const tokenMint = bet.tokenMint;
            const decimals = 9;
            const finalBetAmount = (betAmount.toNumber()/(10 ** decimals));
            const side = b.direction == true ? "YES" : "NO";
            return{
                betTitle: betTitle,
                betAmount: finalBetAmount,
                isResolved: isResolved,
                side: side,
                finalOutcome: finalOutcome,
            }
        }))

        return NextResponse.json(bets, {status: 200})

    } catch(err){
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Unable to Find Bets for Given User' }, { status: 500 });
    }
}