/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
// import { Message as VercelChatMessage, streamText } from "ai"; 
import { SolanaAgentKit, createSolanaTools } from 'solana-agent-kit';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import {
  AIMessage,
  BaseMessage,
  ChatMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import {ChatXAI} from "@langchain/xai"

const AGENT_SYSTEM_TEMPLATE = ` You are a helpful agent that can interact onchain using the Solana Agent Kit. You are 
          empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
          faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX 
          (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you 
          can't do with your currently available tools, you must say so, and encourage them to implement it 
          themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be 
          concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is 
          explicitly requested.`;

function validateEnvironment(): void {
  const missingVars: string[] = [];
  const requiredVars = ["OPENAI_API_KEY", "RPC_URL", "SOLANA_PRIVATE_KEY"];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    throw new Error("Missing required environment variables.");
  }
}

async function initializeAgent() {
    try {
      // const llm = new ChatXAI({
      //   model: "grok-2-latest",
      //   temperature: 0.7,
      //   apiKey: process.env.GROK_API_KEY,
      // })
      const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0.7
      })
      const solanaKit = new SolanaAgentKit(
        process.env.SOLANA_PRIVATE_KEY!,
        process.env.RPC_URL!,
        process.env.OPENAI_API_KEY!
      );
  
      const tools = createSolanaTools(solanaKit);
      const memory = new MemorySaver();
      const config = { configurable: { thread_id: "Solana Agent Kit!" } };
  
      const agent = createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
        messageModifier: `
          You are a helpful agent that can interact onchain using the Solana Agent Kit. You are 
          empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
          faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX 
          (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you 
          can't do with your currently available tools, you must say so, and encourage them to implement it 
          themselves using the Solana Agent Kit, recommend they go to https://www.solanaagentkit.xyz for more information. Be 
          concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is 
          explicitly requested.
        `,
      });

      return { agent, config };
    } catch (error) {
      console.error("Failed to initialize agent:", error);
      throw error;
    }
  }

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const messages = body.messages ?? [];

    const { agent } = await initializeAgent();

		const eventStream = agent.streamEvents(
			{
				messages,
			},
			{
				version: "v2",
				configurable: {
					thread_id: "Solana Agent Kit!",
				},
			},
		);

    console.log("Agent Stream: ", eventStream)
		const textEncoder = new TextEncoder();
		const transformStream = new ReadableStream({
			async start(controller) {
        console.log("stream start")
				for await (const { event, data } of eventStream) {
          console.log("Iteration Start")
          console.log("Event: ",event)
          console.log("Data: ",data)
					if (event === "on_chat_model_stream") {
						if (!!data.chunk.content) {
              console.log("Message Content: ", data.chunk.content)
							controller.enqueue(textEncoder.encode(data.chunk.content));
						}
					}
          console.log("Iteration End")
				}
				controller.close();
			},
		});

		return new Response(transformStream);
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
	}
}