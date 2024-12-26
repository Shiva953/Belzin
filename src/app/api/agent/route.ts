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
      const llm = new ChatXAI({
        model: "grok-2-latest",
        temperature: 0.7,
        maxRetries: 2,
        apiKey: process.env.GROK_API_KEY
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

let agent: any;
let config: any;

export async function POST(req: Request) {
  try {
      if (!agent || !config) {
          const initialized = await initializeAgent();
          agent = initialized.agent;
          config = initialized.config;
      }

      const { message } = await req.json();
      console.log("Message got from frontend: ",message)

      if (!message) {
          return NextResponse.json(
              { error: "Message is required" },
              { status: 400 }
          );
      }


      const stream = await agent.stream(
          { messages: [new HumanMessage(message)] },
          config
      );
      console.log("Initial Stream: ", stream)

      let agentResponse = '';
      let agentToolResponse = '';
      // Process the stream chunks
      for await (const chunk of stream) {
        console.log("Chunk: ", chunk)
          if ("agent" in chunk && chunk.agent.messages.length > 0 && chunk.agent.messages?.[0]?.content) {
              agentResponse += chunk.agent.messages[0].content;
              console.log("Agent Response for agent in chunk:", agentResponse)
          } else if ("tools" in chunk && chunk.tools.messages.length > 0 && chunk.tools.messages?.[0]?.content) {
              // Append tool execution results to the response
              const toolResponse = chunk.tools.messages[0].content;
              try {
                const parsed = JSON.parse(toolResponse);
                agentToolResponse = parsed.message || toolResponse;
              } catch {
                agentToolResponse = toolResponse;
              }
          }
      }
          if(agentResponse){
            console.log("Final agent response: ",agentResponse);
            return NextResponse.json(
              { reply: agentResponse },
              { status: 200 }
          );
        }
        else if(agentToolResponse){
          try {
            // Parse the JSON error response
            const parsedError = JSON.parse(agentToolResponse);
            
            // Create a user-friendly error message
            let errorMessage = "The swap operation failed. ";
            if (parsedError.message) {
              // Extract the main error message without the technical details
              const mainError = parsedError.message.split('\n')[0];
              errorMessage += mainError;
            }
            
            return NextResponse.json(
              { reply: errorMessage },
              { status: 200 }
            );
          } catch (e) {
            // Fallback if JSON parsing fails
            return NextResponse.json(
              { reply: "An error occurred while processing the swap" },
              { status: 200 }
            );
          }
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