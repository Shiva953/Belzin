/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { SolanaAgentKit, createSolanaTools } from 'solana-agent-kit';
import { HumanMessage } from "@langchain/core/messages"
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import {ChatXAI} from "@langchain/xai"
import { ChatGroq } from "@langchain/groq"
import dotenv from "dotenv"

dotenv.config()

const validateEnvVars = () => {
    const required = ['OPENAI_API_KEY', 'SOLANA_PRIVATE_KEY', 'RPC_URL'];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  };

async function initializeAgent() {
    try {
      validateEnvVars();
      // const llm = new ChatOpenAI({
      //   modelName: "gpt-4o-mini",
      //   temperature: 0.7,
      //   cache: true,
      //   maxRetries: 2,
      //   openAIApiKey: process.env.OPENAI_API_KEY,
      // });
      const llm = new ChatXAI({
        model: "grok-2-latest",
        temperature: 0.7,
        maxRetries: 30,
        apiKey: process.env.GROK_API_KEY
      })
      // const llm = new ChatGroq({
      //   modelName: "llama-3.3-70b-versatile",
      //   temperature: 0.7,
      //   cache: true,
      //   maxRetries: 10,
      // })
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

let agent: any;
let config: any;

// export async function POST(req: Request) {
//   const { message } = await req.json();

//   if (!agent) {
//     try {
//       ({ agent, config } = await initializeAgent());
//     } catch (error) {
//       console.error("Failed to initialize agent:", error);
//       return NextResponse.json({ reply: "Failed to initialize agent." }, { status: 500 });
//     }
//   }

//   try {
//     const stream = await agent.stream({ 
//       messages: [
//         // Ensure message format matches what the agent expects
//         new HumanMessage({
//           content: message
//         })
//       ]
//     }, config);

//     let finalResponse = '';
    
//     // Process all chunks and accumulate the response
//     for await (const chunk of stream) {
//       if ("agent" in chunk && chunk.agent.messages?.[0]?.content) {
//         finalResponse = chunk.agent.messages[0].content;
//       }
//       else if ("tools" in chunk && chunk.tools.messages?.[0]?.content) {
//         finalResponse = chunk.tools.messages[0].content;
//       }
//     }

//     // Only return if we have a non-empty response
//     if (finalResponse) {
//       return NextResponse.json({ reply: finalResponse });
//     }

//     throw new Error("No valid response received from agent");

//   } catch (error: any) {
//     console.error("Error during agent processing:", error);
//     return NextResponse.json({ 
//       reply: error.message || "An error occurred while processing your request",
//       error: true 
//     }, { status: 500 });
//   }
// }
export async function POST(req: Request) {
  try {
      // Initialize agent if not already initialized
      if (!agent || !config) {
          const initialized = await initializeAgent();
          agent = initialized.agent;
          config = initialized.config;
      }

      // Parse the request body
      const { message } = await req.json();

      if (!message) {
          return NextResponse.json(
              { error: "Message is required" },
              { status: 400 }
          );
      }

      // Create a stream for the agent's response
      const stream = await agent.stream(
          { messages: [new HumanMessage(message)] },
          config
      );

      let agentResponse = '';
      
      // Process the stream chunks
      for await (const chunk of stream) {
          if ("agent" in chunk) {
              agentResponse = chunk.agent.messages[0].content;
          } else if ("tools" in chunk) {
              // Append tool execution results to the response
              agentResponse += '\n' + chunk.tools.messages[0].content;
          }
      }

      return NextResponse.json(
          { reply: agentResponse.trim() },
          { status: 200 }
      );

  } catch (error) {
      console.error("Error processing request:", error);
      
      // Return appropriate error response
      return NextResponse.json(
          { 
              error: true,
              reply: error instanceof Error ? error.message : "An unknown error occurred" 
          },
          { status: 500 }
      );
  }
}