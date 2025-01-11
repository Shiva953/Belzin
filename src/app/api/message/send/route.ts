/* eslint-disable @typescript-eslint/no-unused-vars */
import {pusherServer} from "@/lib/pusher";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ChatOpenAI } from "@langchain/openai";
import { SolanaAgentKit,createSolanaTools } from "solana-agent-kit";
import { createExtendedSolanaTools } from "@/langchain";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { User } from "@prisma/client";

async function initializeAgent() {
    try {
      const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0.7,
        streaming: true,
        // maxRetries: 10,
      })
      const solanaKit = new SolanaAgentKit(
        process.env.SOLANA_PRIVATE_KEY!,
        process.env.RPC_URL!,
        process.env.OPENAI_API_KEY!
      );
  
      const tools = createExtendedSolanaTools(solanaKit);
      const memory = new MemorySaver();
      const config = { configurable: { thread_id: "Solana Agent Kit!" } };

      const blinktool = tools.find(t => t.name==="solana_bet_blink_url")?.name;
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
    try {
        const { messageContent, walletPublicKey, isAgent } = await req.json();
        if(!walletPublicKey) {
            return NextResponse.json({error: "Invalid Sender"}, {status: 401})
        }

        const user = await prisma.user.findFirst({
            where: {
                walletPublicKey: walletPublicKey
            }
        });

        if (!user) {
            return NextResponse.json({error: "Invalid User, Does not Exist"}, {status: 401})
        }

        const messageData = {
            content: messageContent || '',
            senderId: user.id,
            timestamp: Date.now().toString(),
            isAgent: isAgent || false
        }

        const createdMessage = await prisma.message.create({
            data: messageData,
            include: {
                sender: true
            }
        });

        await Promise.all([
            pusherServer.trigger("global-chat", 'incoming-message', createdMessage),
            pusherServer.trigger("global-chat", 'new-send-message', createdMessage)
        ]);

        if (messageContent.toLowerCase().includes('@polyagent')) {
            processAgentMessage(messageContent).catch(console.error);
        }

        return NextResponse.json({
            message: createdMessage,
            res: 'Successfully Transmitted Event to client'
        }, {status: 200})

    } catch(err) {
        if (err instanceof Error) {
            return NextResponse.json({error: err.message}, {status: 500})
        }
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}

async function processAgentMessage(messageContent: string) {
    try {
        const { agent } = await initializeAgent();

        const agentUser:User = {
            id: 14,
            walletPublicKey: '96a3u1mDA3E1krcgtGgo38hMaewurNc9CJBzaPaWSUc8',
            username: 'PolyAgent',
            imageUrl: 'https://na-assets.pinit.io/BDzbq7VxG5b2yg4vc11iPvpj51RTbmsnxaEPjwzbWQft/dc240c0d-e772-466f-b493-13eab770ab79/4731',
            friendList: []
        }

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
        for await (const { event, data } of eventStream) {
            console.log("Iteration Start")
            console.log("Event: ",event)
            console.log("Data: ",data)
            if (event === 'on_chat_model_stream' && data.chunk.content) {
                agentResponse += data.chunk.content;
                console.log("Agent Response: ",agentResponse);
            }
            console.log("Iteration End")
        }

        const agentMessage = await prisma.message.create({
            data: {
                content: agentResponse,
                senderId: agentUser.id,
                timestamp: Date.now().toString(),
                isAgent: true
            },
            include: {
                sender: true
            }
        });

        await Promise.all([
            pusherServer.trigger("global-chat", 'incoming-message', agentMessage),
            pusherServer.trigger("global-chat", 'new-send-message', agentMessage)
        ]);
    } catch (error) {
        console.error('Agent processing error:', error);

    }
}