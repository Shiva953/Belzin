/* eslint-disable @typescript-eslint/no-unused-vars */
import {pusherServer} from "@/lib/pusher";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid"
import { Message } from "@/components/chat/public/PublicChat";
import prisma from "@/lib/prisma";
import { ChatOpenAI } from "@langchain/openai";
import { SolanaAgentKit,createSolanaTools } from "solana-agent-kit";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

async function initializeAgent() {
    try {
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

      const blinktool = tools.find(t => t.name==="solana_blink_url")?.name;
      console.log("solana blink tool: ", blinktool)
  
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

export async function POST(req: Request){
  try{
    const { messageContent, sender, senderId, isAgent } = await req.json();
    if(!sender){
        return NextResponse.json({error: "Invalid Sender"}, {status: 401})
    }

    const timestamp = Date.now()

    const message: Message = {
        id: nanoid(),
        sender: sender || '',
        content: messageContent || '',
        senderId: senderId || '',
        timestamp: timestamp.toString(),
        isAgent: isAgent
    }

    await pusherServer.trigger("global-chat", 'incoming-message', message);

    await pusherServer.trigger("global-chat", 'new-send-message', message);

    await prisma.message.create({
        data: {
            sender: message.sender,
            content: message.content,
            senderId: message.senderId,
            timestamp: message.timestamp
        }
    })

    if (messageContent.toLowerCase().includes('@polyagent')) {
        try {
            const { agent } = await initializeAgent();
            
            const agentMessage: Message = {
                id: nanoid(),
                sender: 'PolyAgent',
                content: 'Default',
                senderId: '14',
                timestamp: Date.now().toString(),
                isAgent: true
            };

            const eventStream = agent.streamEvents(
                {
                    messages: [{
                        role: 'user',
                        content: messageContent.replace('@polyagent', '').trim()
                    }]
                },
                {
                    version: 'v2',
                    configurable: { thread_id: 'Solana Agent Kit!' }
                }
            );

            let agentResponse = '';

            // Process the stream
            for await (const { event, data } of eventStream) {
                // console.log("Iteration Start")
                // console.log("Event: ",event)
                // console.log("Data: ",data)
                if (event === 'on_chat_model_stream') {
                    if (!!data.chunk.content) {
                        // console.log("Message Content: ", data.chunk.content)
                        agentResponse += data.chunk.content;
                        // console.log("Agent Response", agentResponse)
                    }
                }
            }

            console.log("Final Agent Response: ", agentResponse)
            agentMessage.content = agentResponse;
            console.log("Final Agent Message Content: ", agentMessage.content)

            await pusherServer.trigger("global-chat", 'incoming-message', agentMessage);
            await pusherServer.trigger("global-chat", 'new-send-message', agentMessage);

            // Store agent response in DB
            await prisma.message.create({
                data: {
                    sender: agentMessage.sender,
                    content: agentMessage.content,
                    senderId: agentMessage.senderId,
                    timestamp: agentMessage.timestamp,
                    isAgent: true,
                }
            });
        } catch (error) {
            console.error('Agent processing error:', error);
            const errorMessage: Message = {
                id: nanoid(),
                sender: 'PolyAgent',
                content: 'Sorry, I encountered an error processing your request. Please try again.',
                senderId: '14',
                timestamp: Date.now().toString(),
                isAgent: true
            };
            
            await pusherServer.trigger("global-chat", 'incoming-message', errorMessage);
        }
    }

    return NextResponse.json({
        message: message,
        res: 'Successfully Transmitted Event to client and sent message'
    }, {status: 200})

    } catch(err){
        if (err instanceof Error) {
            return NextResponse.json({error: err.message}, {status: 500})
        }
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}