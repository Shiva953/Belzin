/* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
// import { SolanaAgentKit,createSolanaTools } from "solana-agent-kit";
// import { createExtendedSolanaTools } from "@/langchain";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { SolanaAgentKit, createSolanaTools } from "@/lib/solanaKit";

const llm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.7,
    streaming: true,
})

const solanaKit = new SolanaAgentKit(
    process.env.SOLANA_PRIVATE_KEY!,
    process.env.RPC_URL!,
    process.env.OPENAI_API_KEY!
)

const tools = createSolanaTools(solanaKit);
const memory = new MemorySaver();

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


// User Request → Stream Initialization → Event Generation → Real-time Chunk Processing → Network Transmission → Client Rendering
export async function POST(req: Request) {
    try {
        const { messageContent } = await req.json();

        if (!messageContent) {
            return NextResponse.json({ error: "Message content is required" }, { status: 400 });
        }

        const textEncoder = new TextEncoder();
        const transformStream = new ReadableStream({
            async start(controller) {
                try {
                    const eventStream = agent.streamEvents(
                        {
                            messages: [{
                                role: 'user',
                                content: messageContent
                            }]
                        },
                        {
                            version: 'v2',
                            configurable: { thread_id: 'Solana Agent Kit!' }
                        }
                    );

                    for await (const { event, data } of eventStream) {
                        console.log("Iteration Start")
                        console.log("Event: ",event)
                        console.log("Data: ",data)
                        if (event === 'on_chat_model_stream') {
                            if (data.chunk.content) {
                                // Immediately sends chunks to client as they're generated
                                controller.enqueue(textEncoder.encode(data.chunk.content));
                            }
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });

        // Return the streaming response
        return new Response(transformStream);

    } catch (err) {
        if (err instanceof Error) {
            return NextResponse.json({error: err.message}, {status: 500})
        }
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}