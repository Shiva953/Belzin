import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { deploy_token, fetchPrice, trade } from "solana-agent-kit/dist/tools";
import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { sendSOL, solana } from "@goat-sdk/wallet-solana";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { jupiter } from "@goat-sdk/plugin-jupiter";
import { splToken } from "@goat-sdk/plugin-spl-token";
import base58 from "bs58";

// TEST OUT THE CHAT INTEGRATION OF THIS AGENT WITH DEFAULT TOOLS FIRST(TAKE THE TESTS IN SOLANA-AGENT-KIT REPO AS REF, AGENT-KIT+LANGCHAIN)
// ADD CUSTOM TOOL FOR BETTING BLINK/TRADING BLINK
// INTEGRATE THE AGENT WITH THE CHAT(PUBLIC + DMS), ADD AGENT AS USER IN DB + CAPTURE MESSAGES
const connection = new Connection(process.env.SOLANA_RPC_URL!);
const keypair = Keypair.fromSecretKey(base58.decode(process.env.AGENT_WALLET_PRIVATE_KEY!));

const agent = new SolanaAgentKit(
    process.env.AGENT_WALLET_PRIVATE_KEY!,
    process.env.SOLANA_RPC_URL!,
    process.env.OPENAI_API_KEY!
  );

  
// Create LangChain tools
const tools_global = createSolanaTools(agent);


const signature = await trade(
    agent,
    new PublicKey("target-token-mint"),
    100, // amount
    new PublicKey("source-token-mint"),
    300 // 3% slippage
  );

(async () => {
    const tools = await getOnChainTools({
        wallet: solana({
            keypair,
            connection,
        }),
        plugins: [sendSOL(), jupiter(), splToken()],
    });
    const result = await generateText({
        model: xai("grok-2-1212"),
        tools: tools,
        maxSteps: 10,
        prompt: "Swap 0.01 SOL to USDC, return the transaction hash, make sure you check i have enough SOL to cover the swap",
    });
    console.log(result.text);
})();

