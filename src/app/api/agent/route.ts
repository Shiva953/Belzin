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

// export const runtime = "edge";


// const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
//   if (message.role === "user") {
//     return new HumanMessage(message.content);
//   } else if (message.role === "assistant") {
//     return new AIMessage(message.content);
//   } else {
//     return new ChatMessage(message.content, message.role);
//   }
// };

// const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
//   if (message._getType() === "human") {
//     return { content: message.content, role: "user" };
//   } else if (message._getType() === "ai") {
//     return {
//       content: message.content,
//       role: "assistant",
//       tool_calls: (message as AIMessage).tool_calls,
//     };
//   } else {
//     return { content: message.content, role: message._getType() };
//   }
// };

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
        // maxRetries: 2,
        apiKey: process.env.GROK_API_KEY,
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
// let agentPromise: Promise<ReturnType<typeof createReactAgent>> | null = null;

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const messages = (body.messages ?? [])
//       .filter(
//         (message: VercelChatMessage) =>
//           message.role === "user" || message.role === "assistant",
//       )
//       .map(convertVercelMessageToLangChainMessage);

//     // if (!agentPromise) {
//     //   agentPromise = initializeAgent();
//     // }
//     // const agent = await agentPromise;
//     if (!agent || !config) {
//       const initialized = await initializeAgent();
//       agent = initialized.agent;
//       config = initialized.config;
//   }

//     // Stream the response
//     const eventStream = await agent.streamEvents(
//       { messages },
//       { version: "v2" },
//     );

//     const textEncoder = new TextEncoder();
//     const transformStream = new ReadableStream({
//       async start(controller) {
//         try {
//           for await (const { event, data } of eventStream) {
//             if (event === "on_chat_model_stream") {
//               if (!!data.chunk.content) {
//                 controller.enqueue(textEncoder.encode(data.chunk.content));
//               }
//             } else if (event === "on_tool_end") {
//               // Handle tool responses
//               const toolResponse = data.output;
//               if (typeof toolResponse === "string") {
//                 try {
//                   const parsed = JSON.parse(toolResponse);
//                   if (parsed.status === "error") {
//                     controller.enqueue(
//                       textEncoder.encode(`\nOperation failed: ${parsed.message.split('\n')[0]}\n`)
//                     );
//                   }
//                 } catch (e) {
//                   controller.enqueue(textEncoder.encode(`\n${toolResponse}\n`));
//                 }
//               }
//             }
//           }
//         } catch (error) {
//           controller.enqueue(
//             textEncoder.encode("\nAn error occurred while processing your request. Please try again.\n")
//           );
//         } finally {
//           controller.close();
//         }
//       },
//     });
//     return new StreamingTextResponse(transformStream);
//   } catch (e: any) {
//     return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
//   }
// }
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

      // let agentResponse = '';
      // let agentToolResponse = '';
      let responseContent = "default";
      // Process the stream chunks
      for await (const chunk of stream) {
        console.log("Chunk: ", chunk)
          if ("agent" in chunk) { //&& chunk.agent.messages.length > 0 && chunk.agent.messages?.[0]?.content
              // agentResponse += chunk.agent.messages[0].content;
              responseContent+=chunk.agent.messages[0].content
              console.log("Agent Response for agent in chunk:", responseContent)
          } else if ("tools" in chunk) { //&& chunk.tools.messages.length > 0 && chunk.tools.messages?.[0]?.content
              // Append tool execution results to the response
              // const toolResponse = chunk.tools.messages[0].content;
              responseContent+=chunk.tools.messages[0].content
              console.log("Agent Response for agent in chunk:", responseContent)
              // try {
              //   const parsed = JSON.parse(toolResponse);
              //   agentToolResponse = parsed.message || toolResponse;
              // } catch {
              //   agentToolResponse = toolResponse;
              // }
          }
      }
        //   if(agentResponse){
        //     console.log("Final agent response: ",agentResponse);
        //     return NextResponse.json(
        //       { reply: agentResponse },
        //       { status: 200 }
        //   );
        // }
        // else if(agentToolResponse){
        //   try {
        //     // Parse the JSON error response
        //     const parsedError = JSON.parse(agentToolResponse);
            
        //     // Create a user-friendly error message
        //     let errorMessage = "The swap operation failed. ";
        //     if (parsedError.message) {
        //       // Extract the main error message without the technical details
        //       const mainError = parsedError.message.split('\n')[0];
        //       errorMessage += mainError;
        //     }
            
        //     return NextResponse.json(
        //       { reply: errorMessage },
        //       { status: 200 }
        //     );
        //   } catch (e) {
        //     // Fallback if JSON parsing fails
        //     return NextResponse.json(
        //       { reply: "An error occurred while processing the swap" },
        //       { status: 200 }
        //     );
        //   }
        // }
        return NextResponse.json({ reply: responseContent }, { status: 200 });

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