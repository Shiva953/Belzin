/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Connection,
    PublicKey,
    clusterApiUrl,
    Transaction,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  import { SolanaAgentKit } from "solana-agent-kit";
  import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
  import * as anchor from "@coral-xyz/anchor";
  import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
  import { Betting, IDL } from "../types/betting";
  
  export async function get_swap_blink(
    agent: SolanaAgentKit,
    tokenA: string,
    tokenB: string,
  ): Promise<string> {
    try {
      if (!tokenA || !tokenB) {
        return "Error, please give valid params for blink";
      }
      //ex-blink: https://dial.to/?action=solana-action:https://jupiter.dial.to/swap/SOL-USDC
      const blinkURL = `https://dial.to/?action=solana-action:https://jupiter.dial.to/swap/${tokenA}-${tokenB}`;
      return blinkURL;
    } catch (error: any) {
      throw new Error(`Blink Fetch failed: ${error.message}`);
    }
  }
  
  export async function get_bet_blink(
    agent: SolanaAgentKit,
    betTitle: string,
    betAmount: number,
    betResolutionDateString: string,
    tokenTicker: string,
  ): Promise<string> {
    try {
      if (!betAmount || !betTitle || !betResolutionDateString) {
        return "Error, please give valid params for blink";
      }

      let mint: PublicKey;
      if(!tokenTicker || tokenTicker == 'USDC'){
        mint = new PublicKey('GBmXkFGMxsYUM48vwQGGfSA1X4AVWj8Pf2oADAHdfAEa')
      }
      else{
        const tokenData = await agent.getTokenDataByTicker(tokenTicker);
        mint = tokenData ? new PublicKey(tokenData.address || 'GBmXkFGMxsYUM48vwQGGfSA1X4AVWj8Pf2oADAHdfAEa') : new PublicKey('GBmXkFGMxsYUM48vwQGGfSA1X4AVWj8Pf2oADAHdfAEa');
      }
  
      const connection = new anchor.web3.Connection(clusterApiUrl("devnet"), "confirmed");
      const walletKeypair = agent.wallet;
      const anchorKeypair = anchor.web3.Keypair.fromSecretKey(walletKeypair.secretKey);

        const wallet = new NodeWallet(anchorKeypair);
        const provider = new AnchorProvider(connection, wallet, {
            commitment: "confirmed",
        });

  
      anchor.setProvider(provider);
      const program = new Program<Betting>(IDL as Betting, provider);
      const [betAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from(betTitle)],
        program.programId,
      );
      const actionURL = `http://localhost:3000/api/actions/bet?betId=${betAccount.toBase58()}`;
  
      const betResolutionUnixEpochTimestamp = dateStringToEpoch(
        betResolutionDateString,
      );
      //createBet
      await program.methods
        .createBet(
          betTitle,
          new BN(betAmount * Math.pow(10, 9)),
          new BN(betResolutionUnixEpochTimestamp),
        )
        .accounts({
          signer: agent.wallet.publicKey,
          tokenMint: mint,
        })
        .rpc({commitment: "confirmed"});
  
      return actionURL;
    } catch (error: any) {
      throw new Error(`Blink Fetch failed: ${error.message}`);
    }
  }
  
  export async function executeBlink(
    agent: SolanaAgentKit,
    blinkURL: string,
    amount: number,
    tokenA: string,
    tokenB: string,
  ) {
    try {
      const res = await fetch(
        `https://jupiter.dial.to/swap/${tokenA}-${tokenB}?amount=${amount}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account: agent.wallet.publicKey.toBase58(),
          }),
        },
      );
  
      const data = await res.json();
      if (data.transaction) {
        const txn = Transaction.from(Buffer.from(data.transaction, "base64"));
        txn.sign(agent.wallet);
        txn.recentBlockhash = (
          await agent.connection.getLatestBlockhash()
        ).blockhash;
        const sig = await sendAndConfirmTransaction(
          new Connection(clusterApiUrl("devnet")),
          txn,
          [agent.wallet],
          { commitment: "confirmed" },
        );
        return sig;
      } else {
        return "failed";
      }
    } catch (error: any) {
      console.error(error);
      throw new Error(`RPS game failed: ${error.message}`);
    }
  }
  
  export function dateStringToEpoch(dateStr: string): number {
    const cleanDateStr = dateStr.replace(/(st|nd|rd|th)/, "");
    const date = new Date(cleanDateStr);
    const epochTimestamp = Math.floor(date.getTime() / 1000);
  
    return epochTimestamp;
  }  