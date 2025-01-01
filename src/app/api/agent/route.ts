/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
// import { Message as VercelChatMessage, streamText } from "ai"; 
import { SolanaAgentKit, createSolanaTools } from '../../../../../solana-agent-kit';
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
      const llm = new ChatXAI({
        model: "grok-2-latest",
        temperature: 0.7,
        apiKey: process.env.GROK_API_KEY,
      })
      const solanaKit = new SolanaAgentKit(
        process.env.SOLANA_PRIVATE_KEY!,
        process.env.RPC_URL!,
        {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!
        }
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

export async function POST(req: Request) {
  try {
    validateEnvironment();
      const { message } = await req.json();
      if (!message) {
        return NextResponse.json(
            { error: "Message is required" },
            { status: 400 }
        );
    }
      console.log("Message got from frontend: ",message)

      const { agent, config } = await initializeAgent();

      const stream = await agent.stream(
          { messages: [new HumanMessage(message)] },
          config
      );
      console.log("Initial Stream: ", stream)

      let responseContent = "default";
      // Process the stream chunks
      for await (const chunk of stream) {
        console.log("Chunk: ", chunk)
          if ("agent" in chunk) { //&& chunk.agent.messages.length > 0 && chunk.agent.messages?.[0]?.content
              const agentCheck = chunk.agent?.messages && Array.isArray(chunk.agent.messages) && chunk.agent.messages.length > 0 && chunk.agent.messages[0]?.content && typeof chunk.agent.messages[0].content === 'string' && chunk.agent.messages[0].content.trim() !== '';
              if(agentCheck){
                responseContent += chunk.agent.messages[0].content
                console.log("Agent Response for agent in chunk:", responseContent)
              }
          } else if ("tools" in chunk) { //&& chunk.tools.messages.length > 0 && chunk.tools.messages?.[0]?.content
              const toolCheck = chunk.tools?.messages && Array.isArray(chunk.tools.messages) && chunk.tools.messages.length > 0 && chunk.tools.messages[0]?.content && typeof chunk.tools.messages[0].content === 'string' && chunk.tools.messages[0].content.trim() !== '';
              if(toolCheck){
                responseContent += chunk.tools.messages[0].content
                console.log("Agent Response for tool in chunk:", responseContent)
              }
          }
      }
        if(responseContent){
          return NextResponse.json({ reply: responseContent }, { status: 200 });
        }
        else{
          return NextResponse.json({ reply: "Unable to Get Response" }, { status: 200 })
        }

  } catch (error) {
      console.error("Error processing request:", error);
      return NextResponse.json(
          { 
              error: true,
              reply: error instanceof Error ? error.message : "An unknown error occurred" 
          },
          { status: 500 }
      );
  }
}