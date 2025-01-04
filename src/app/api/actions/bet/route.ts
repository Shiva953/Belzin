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
  } from "@solana/web3.js";
  import {getOrCreateAssociatedTokenAccount, getAssociatedTokenAddress} from "@solana/spl-token"
import { Betting,IDL } from "@/types/betting";
// agent creates the bet already(using bet title and bet amount -> createBet), after that you get the blink = frontend for placeBet
// get the params(bet title, bet amount) -> create bet -> WHEN BET CREATED, SHOW THE INTERFACE WITH SIDES ("YES"|"NO")

// bet is ALREADY CREATED BY THE AGENT, YOU SEE THE PLACEBET INTERFACE HERE
// ex - /api/actions/bet?betId=2QeK279LrHguLGAAr9S3RGEYnWuYZEzHv5iMixuG1NU9
export const GET = async (req: Request) => {
    const requestUrl = new URL(req.url as string);
    const betAccountId = requestUrl.searchParams.get("bet");
    console.log(betAccountId)

    const connection = new Connection(process.env.SOLANA_RPC! || clusterApiUrl("devnet"), "confirmed");
    const betAccountKey = new PublicKey(betAccountId!)
    const program = new Program<Betting>(IDL as Betting);
    const betAccountInfo = await program.account.bet.fetch(betAccountKey, "confirmed")
    const betTitle = betAccountInfo.title;

    console.log(betTitle)

    const payload: ActionGetResponse = {
      title: betTitle,
      icon: 'https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/',
      description: "Place Bets using blinks",
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

export async function POST(req: Request){
    try{
        const requestUrl = new URL(req.url);
        const { betId, side } = validatedQueryParams(requestUrl);

        const body: ActionPostRequest = await req.json(); //the POST request body
        const bettorAccount = new PublicKey(body.account);

        const connection = new Connection(process.env.SOLANA_RPC! || clusterApiUrl("devnet"), "confirmed");
        const wallet = { publicKey: bettorAccount } as anchor.Wallet;
        const provider = new AnchorProvider(connection, wallet, {commitment: "confirmed"});
        
        anchor.setProvider(provider);
        const program = new Program<Betting>(IDL as Betting, provider);
        let betDirection = false;
        if(side){
          betDirection = side === "YES" ? true : false;
        }

        const betAccountKey = new PublicKey(betId!);

        const [vaultTokenAccount] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault_token_account"), betAccountKey.toBuffer()],
          program.programId
        );
        const bettorTokenAccount = await getAssociatedTokenAddress(
          new PublicKey("GBmXkFGMxsYUM48vwQGGfSA1X4AVWj8Pf2oADAHdfAEa"),
          bettorAccount,
          true
        );
        
        //amount is fixed here
        const tx = await program.methods
        .placeBet(betDirection)
        .accounts({
          bet: betAccountKey,
          bettor: bettorAccount,
          bettorTokenAccount: bettorTokenAccount,
          vaultTokenAccount: vaultTokenAccount,
        })
        .transaction()

        tx.feePayer = bettorAccount;
        tx.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;

        const payload: ActionPostResponse = await createPostResponse({
          fields: {
            transaction: tx,
            type: "transaction",
            message: `Successfully Placed Bet for side ${side!}`,
          },
        }); 
        
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