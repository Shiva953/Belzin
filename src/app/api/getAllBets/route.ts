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

        const allChatBets = (await program.account.bet.all());

        const bets = await Promise.all(allChatBets.map(async(b) => {
            const title = b.account.title;
            const betPubKey = b.publicKey.toBase58()
            return {
                betTitle: title,
                betPubKey: betPubKey,
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