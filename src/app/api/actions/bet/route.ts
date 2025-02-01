/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    ActionPostResponse,
    createActionHeaders,
    createPostResponse,
    ActionGetResponse,
    ActionPostRequest,
    ACTIONS_CORS_HEADERS,
    ActionGetRequest,
  } from "@solana/actions";
  import {AnchorProvider, Program} from "@coral-xyz/anchor"
  import * as anchor from "@coral-xyz/anchor";
  import {
    clusterApiUrl,
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    TransactionMessage,
    VersionedMessage,
    VersionedTransaction,
  } from "@solana/web3.js";
  import {getOrCreateAssociatedTokenAccount, getAssociatedTokenAddress} from "@solana/spl-token"
  import { epochToDateString,dateStringToEpoch, uploadGeneratedImage } from "@/app/lib/utils";
  import { Betting,IDL } from "@/types/betting";
  import { GeneratedImage } from "@/types";
  import { experimental_generateImage as generateImage } from 'ai';
  import { openai } from '@ai-sdk/openai';
  import prisma from "@/lib/prisma";


export const GET = async (req: Request) => {
    const requestUrl = new URL(req.url as string);
    const betAccountId = requestUrl.searchParams.get("betId");

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const wallet = { publicKey: new PublicKey("CUdHPZyyuMCzBJEgTZnoopxhp9zjp1pog3Tgx2jEKP7E") } as anchor.Wallet;
    const provider = new AnchorProvider(connection, wallet, {commitment: "confirmed"});
        
    anchor.setProvider(provider);
    const betAccountKey = new PublicKey(betAccountId!)
    const programId = new PublicKey("JkF3zxfbf7pvwqbyCvYActhnqYgiw2iCaht5JvKSrVY");
    const program = new Program<Betting>(IDL as Betting, programId, provider);
    const betAccountInfo = await program.account.bet.fetch(betAccountKey, "confirmed")
    const betTitle = betAccountInfo.title;
    const betAmount = betAccountInfo.betAmount.toNumber()/(10**9);
    const isBetResolved = betAccountInfo.resolved;
    const betResolutionDateInEpochTimestamp = betAccountInfo.endTime.toNumber();
    const betResolutionDateString = epochToDateString(betResolutionDateInEpochTimestamp);

    const { image } = await generateImage({
      model: openai.image('dall-e-3'),
      prompt: betTitle,
    });

    //(await uploadGeneratedImage(image)) ||
    const imageUrl = "https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/";

    let payload: ActionGetResponse = {
      title: betTitle,
      icon: imageUrl,
      description: `Bet Resolves on ${betResolutionDateString}`,
      label: "Bet",
      links: {
        actions: [
            {
              label: `${betAmount} YES`,
              type: "post",
              href: `/api/actions/bet?betId=${betAccountId}&side=YES&action=placeBet`,
            },
            {
                label: `${betAmount} NO`,
                type: "post",
                href: `/api/actions/bet?betId=${betAccountId}&side=NO&action=placeBet`,
              },
          ],
      },
    };

    if(isBetResolved){
      payload = {
        title: betTitle,
        icon: 'https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/',
        description: `Claim Win/Check Loss`,
        label: "Bet",
        links: {
          actions: [
              {
                label: "Claim",
                type: "post",
                href: `/api/actions/bet?betId=${betAccountId}&action=claim`,
              },
            ],
        },
      };
    }
  
    return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      });
  }

export const POST = async(req: Request) => {
    try{
        const requestUrl = new URL(req.url);
        const { action, betId } = checkAction(requestUrl)
        const body: ActionPostRequest = await req.json(); //the POST request body
        const bettorAccount = new PublicKey(body.account);

        const betAccountKey = new PublicKey(betId!);
        console.log("Bet Account: ",betAccountKey.toBase58())


        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const wallet = { publicKey: bettorAccount } as anchor.Wallet;
        const provider = new AnchorProvider(connection, wallet, {commitment: "confirmed"});
        
        const programId = new PublicKey("JkF3zxfbf7pvwqbyCvYActhnqYgiw2iCaht5JvKSrVY");
        anchor.setProvider(provider);
        const program = new Program<Betting>(IDL as Betting, programId, provider);
        const betAccountInfo = await program.account.bet.fetch(betAccountKey, "confirmed")
        const tokenMint = betAccountInfo.tokenMint;
        const betResolutionDateInEpochTimestamp = betAccountInfo.endTime.toNumber()

        const [vaultTokenAccount] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault_token_account"), betAccountKey.toBuffer()],
          program.programId
        );
        const bettorTokenAccount = await getAssociatedTokenAddress(
          tokenMint,
          bettorAccount,
          true
        );
        const [userBet] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_bet"), betAccountKey.toBuffer(), bettorAccount.toBuffer()],
          program.programId
        );

        if(action == 'placeBet'){
          const { side } = checkSide(requestUrl);

          console.log("Bettor Account: ", bettorAccount.toBase58())

          let betDirection = false;
          if(side){
            betDirection = side === "YES" ? true : false;
          }
 
          const ixn = await program.methods
          .placeBet(betDirection)
          .accounts({
            bettor: provider.wallet.publicKey,
            bet: betAccountKey,
            userBet: userBet,
            bettorTokenAccount: bettorTokenAccount,
            vaultTokenAccount: vaultTokenAccount,
          })
          .instruction()

          const tx = new VersionedTransaction(new TransactionMessage({
            payerKey: bettorAccount,
            recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
            instructions: [ixn],
          }).compileToV0Message())
          
          await prisma.user.updateMany({
            where: {
              walletPublicKey: bettorAccount.toBase58(),
            },
            data: {
              betAmount: betAccountInfo.betAmount.toNumber().toString(),
            }
          })

          const payload: ActionPostResponse = await createPostResponse({
            fields: {
              transaction: tx,
              type: "transaction",
              message: `Successfully Placed bet for side ${side!}`,
            },
          }); 
          
          return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
          });
      }
      else if(action == 'claim'){
        const claimIxn = await program.methods.claimWinnings()
        .accounts({
          bet: betAccountKey,
          user: bettorAccount,
          vaultTokenAccount: vaultTokenAccount,
          userTokenAccount: bettorTokenAccount 
        })
        .instruction()

      const tx = new VersionedTransaction(new TransactionMessage({
        payerKey: bettorAccount,
        recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
        instructions: [claimIxn],
      }).compileToV0Message())

      const payload: ActionPostResponse = await createPostResponse({
        fields: {
          transaction: tx,
          type: "transaction",
          message: `Successfully Claimed`,
        },
      }); 
      
      return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      });
    }
    } catch(err){
        console.log(err);
        let message = "An unknown error occurred";
        if (typeof err == "string") message = err;
        return new Response(JSON.stringify(message), {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
        });
    }
}

export const OPTIONS = async (req: Request) => {
  return new Response(null, {
    status: 204,
    headers: ACTIONS_CORS_HEADERS,
  });
};

function checkSide(requestUrl: URL) {
    let side;
    try {
      if (requestUrl.searchParams.get("side")) {
        side = requestUrl.searchParams.get("side");
      }
    } catch (err) {
      throw "Invalid input query parameters";
    }
  
    return { side };
  }

  function checkAction(requestUrl: URL) {
    let action;
    let betId;
    try {
      if (requestUrl.searchParams.get("action")) {
        action = requestUrl.searchParams.get("action")!;
      }
    } catch (err) {
      throw "Invalid input query parameters";
    }
    try {
      if (requestUrl.searchParams.get("betId")) {
        betId = requestUrl.searchParams.get("betId")!;
      }
    } catch (err) {
      throw "Invalid input query parameters";
    }
  
    return { action, betId };
  }