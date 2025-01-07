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
  import { epochToDateString,dateStringToEpoch } from "@/app/lib/utils";
  import { Betting,IDL } from "@/types/betting";
// agent creates the bet already(using bet title and bet amount -> createBet), after that you get the blink = frontend for placeBet
// get the params(bet title, bet amount) -> create bet -> WHEN BET CREATED, SHOW THE INTERFACE WITH SIDES ("YES"|"NO")

// bet is ALREADY CREATED BY THE AGENT, YOU SEE THE PLACEBET INTERFACE HERE
// ex - /api/actions/bet?betId=8qh4Gnua1xzAyw2EyHiVHR5A9F2fbqRDLfZ21MNdMvyu
export const GET = async (req: Request) => {
    const requestUrl = new URL(req.url as string);
    console.log("Request URL: ",requestUrl)
    const betAccountId = requestUrl.searchParams.get("betId");
    console.log("Bet Account ID: ",betAccountId)

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const wallet = { publicKey: new PublicKey("CUdHPZyyuMCzBJEgTZnoopxhp9zjp1pog3Tgx2jEKP7E") } as anchor.Wallet;
    const provider = new AnchorProvider(connection, wallet, {commitment: "confirmed"});
        
    anchor.setProvider(provider);
    const betAccountKey = new PublicKey(betAccountId!)
    const program = new Program<Betting>(IDL as Betting, provider);
    const betAccountInfo = await program.account.bet.fetch(betAccountKey, "confirmed")
    const betTitle = betAccountInfo.title;
    const betResolutionDateInEpochTimestamp = betAccountInfo.endTime.toNumber();
    const betResolutionDateString = epochToDateString(betResolutionDateInEpochTimestamp);
    const reverseTest = dateStringToEpoch("31st December, 2025");
    console.log("Bet Amount: ", betAccountInfo.betAmount.toNumber())
    console.log("Total Yes Amount: ", betAccountInfo.totalYesAmount.toNumber())
    console.log("Total No Amount: ", betAccountInfo.totalNoAmount.toNumber())
    console.log("Total Yes Bettors:", betAccountInfo.yesBettors.toNumber())
    console.log("Total No Bettors: ",betAccountInfo.noBettors.toNumber())
    console.log(reverseTest)

    console.log(betTitle)

    const payload: ActionGetResponse = {
      title: betTitle,
      icon: 'https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/',
      description: `Bet Resolves on ${betResolutionDateString}`,
      label: "Bet",
      links: {
        actions: [
            {
              label: "YES",
              type: "post",
              href: `/api/actions/bet?betId=${betAccountId}&side=YES`,
            },
            {
                label: "NO",
                type: "post",
                href: `/api/actions/bet?betId=${betAccountId}&side=NO`,
              },
          ],
      },
    };
  
    return Response.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      });
  }

export const POST = async(req: Request) => {
    try{
        const requestUrl = new URL(req.url);
        const { betId, side } = validatedQueryParams(requestUrl);

        const body: ActionPostRequest = await req.json(); //the POST request body
        const bettorAccount = new PublicKey(body.account);

        console.log("Bettor Account: ", bettorAccount.toBase58())

        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const wallet = { publicKey: bettorAccount } as anchor.Wallet;
        const provider = new AnchorProvider(connection, wallet, {commitment: "confirmed"});
        
        anchor.setProvider(provider);
        const program = new Program<Betting>(IDL as Betting, provider);
        let betDirection = false;
        if(side){
          betDirection = side === "YES" ? true : false;
        }
        console.log(side)
        console.log(betDirection)

        const betAccountKey = new PublicKey(betId!);
        console.log("Bet Account: ",betAccountKey.toBase58())

        const [vaultTokenAccount] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault_token_account"), betAccountKey.toBuffer()],
          program.programId
        );
        const bettorTokenAccount = await getAssociatedTokenAddress(
          new PublicKey("GBmXkFGMxsYUM48vwQGGfSA1X4AVWj8Pf2oADAHdfAEa"),
          bettorAccount,
          true
        );
        
        const ixn = await program.methods
        .placeBet(betDirection)
        .accounts({
          bettor: provider.wallet.publicKey,
          bet: betAccountKey,
          bettorTokenAccount: bettorTokenAccount,
          vaultTokenAccount: vaultTokenAccount,
        })
        .instruction()

        const tx = new VersionedTransaction(new TransactionMessage({
          payerKey: bettorAccount,
          recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
          instructions: [ixn],
        }).compileToV0Message())


        console.log("Signed transaction: ", tx)

        const payload: ActionPostResponse = await createPostResponse({
          fields: {
            transaction: tx,
            type: "transaction",
            message: `Successfully Placed bet for side ${side!}`,
          },
        }); 
        console.log("does it go through?")
        
        return Response.json(payload, {
          headers: ACTIONS_CORS_HEADERS,
        });

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

function validatedQueryParams(requestUrl: URL) {
    let betId;
    let side;
    try {
      if (requestUrl.searchParams.get("betId")) {
        betId = requestUrl.searchParams.get("betId")!;
      }
    } catch (err) {
      throw "Invalid input query parameters";
    }
    try {
      if (requestUrl.searchParams.get("side")) {
        side = requestUrl.searchParams.get("side");
      }
    } catch (err) {
      throw "Invalid input query parameters";
    }
  
    return { betId, side };
  }