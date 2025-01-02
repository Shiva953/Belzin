/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { ChatWindow } from '@/components/agent/ChatWindow';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useChat } from "ai/react"
import { Paperclip, ArrowUp } from 'lucide-react';

// NO MORE (ONLY)YAPPING AFTER THIS, ONLY BUILDING
// 1. CREATE CUSTOM BLINK TOOL -> FINALLY FIX AGENT->USER MESSAGE CHAT FRONTEND+BACKEND ONCE AND FOR ALL -> ADD BLINK CLIENT SUPPORT AND MAKE THE AGENT RETURN A BLINK
// 2. CREATE BETTING BLINK + BETTING SMART CONTRACT, ADD IT IN THE TOOL
// 3. INTEGRATE AGENT CHAT(AGENT BECOMES A USER IN DB) IN PRIMARY USER CHAT(@agent "create a bet for 100$ on whether spain wins", agent returns blink and both users can bet)

interface Message {
  type: 'User' | 'Agent' | 'System' | 'Error';
  content: string;
  timestamp: Date;
}

export default function AgentChat() {
  return (
    // <div className="flex flex-col h-screen bg-black text-white">
    //   {/* Mode Toggle */}
    //   <div className="flex items-center space-x-2 p-4 border-b border-gray-800">
    //     <Switch
    //       id="auto-mode"
    //       checked={autoMode}
    //       onCheckedChange={setAutoMode}
    //     />
    //     <Label htmlFor="auto-mode" className="text-gray-300">Autonomous Mode</Label>
    //     {autoMode && (
    //       <input
    //         type="number"
    //         value={autoInterval}
    //         onChange={(e) => setAutoInterval(Number(e.target.value))}
    //         className="w-16 px-2 py-1 ml-4 bg-gray-800 border border-gray-700 rounded text-white"
    //         min="5"
    //         max="60"
    //       />
    //     )}
    //   </div>

    //   {/* Default Options */}
    //   {messages.length === 0 && (
    //     <div className="grid grid-cols-2 gap-4 p-4">
    //       {DEFAULT_OPTIONS.map((option, index) => (
    //         <button
    //           key={index}
    //           onClick={() => {
    //             setInput(option.subtitle);
    //             handleSubmit(new Event('submit') as any);
    //           }}
    //           className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors text-left"
    //         >
    //           <h3 className="font-medium text-white">{option.title}</h3>
    //           <p className="text-sm text-gray-400">{option.subtitle}</p>
    //         </button>
    //       ))}
    //     </div>
    //   )}

    //   {/* Chat Window */}
    //   <div className="flex-1 overflow-auto p-4 space-y-4">
    //     {messages.map((message, index) => (
    //       <div
    //         key={index}
    //         className={`flex ${message.type === 'User' ? 'justify-end' : 'justify-start'}`}
    //       >
    //         <div
    //           className={`max-w-[600px] rounded-2xl p-4 break-words ${
    //             message.type === 'User'
    //               ? 'bg-white text-black'
    //               : message.type === 'Error'
    //               ? 'bg-red-500/10 text-red-500'
    //               : message.type === 'System'
    //               ? 'bg-[rgb(26,26,26)] text-gray-300 italic'
    //               : 'bg-[rgb(26,26,26)] text-white'
    //           }`}
    //           style={{ overflowWrap: 'break-word' }}
    //         >
    //           <div className="text-sm opacity-75 mb-1 text-gray-400">
    //             {message.timestamp.toLocaleTimeString()}
    //           </div>
    //           {message.content}
    //         </div>
    //       </div>
    //     ))}
    //     {loading && (
    //       <div className="flex justify-start">
    //         <div className="bg-gray-800 rounded-2xl p-4 text-gray-300">
    //           Agent is thinking...
    //         </div>
    //       </div>
    //     )}
    //     <div ref={chatEndRef} />
    //   </div>

    //   {/* Input Form */}
    //   <div className="border-t border-gray-800 p-4">
    //     <form onSubmit={handleSubmit} className="flex items-center gap-2">
    //       <div className="flex-1 flex items-center gap-2 bg-[rgb(26,26,26)] rounded-full px-4 py-2">
    //         <button
    //           type="button"
    //           className="text-gray-400 hover:text-gray-300"
    //           onClick={() => handleSubmit}
    //         >
    //           <Paperclip className="h-5 w-5" />
    //         </button>
    //         <input
    //           type="text"
    //           value={input}
    //           onChange={(e) => setInput(e.target.value)}
    //           placeholder="Send a message..."
    //           className="flex-1 bg-[rgb(26,26,26)] text-white placeholder-gray-500 focus:outline-none"
    //           disabled={loading || autoMode}
    //         />
    //       </div>
    //       <Button
    //         type="submit"
    //         disabled={loading || !input.trim() || autoMode}
    //         className="rounded-full p-3 aspect-square"
    //         variant="default"
    //       >
    //         <ArrowUp className="h-5 w-5" />
    //       </Button>
    //     </form>
    //   </div>
    // </div>
    <ChatWindow
			endpoint="api/agent"
			emoji="🤖"
			titleText="Solana agent"
			placeholder="I'm your friendly Solana agent! Ask me anything..."
			emptyStateComponent={InfoCard}
		></ChatWindow>
  );
}

const InfoCard = (
  <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
    <h1 className="text-3xl md:text-4xl mb-4">
      SolanaAgentKit + LangChain.js 🦜🔗 + Next.js
    </h1>
    <ul>
      <li className="text-l">
        🤝
        <span className="ml-2">
          This template showcases a simple agent chatbot using{" "}
          <a href="https://https://www.solanaagentkit.xyz/">SolanaAgentKit</a>
          {", "}
          <a href="https://js.langchain.com/" target="_blank">
            LangChain.js
          </a>{" "}
          and the Vercel{" "}
          <a href="https://sdk.vercel.ai/docs" target="_blank">
            AI SDK
          </a>{" "}
          in a{" "}
          <a href="https://nextjs.org/" target="_blank">
            Next.js
          </a>{" "}
          project.
        </span>
      </li>
      <li className="hidden text-l md:block">
        💻
        <span className="ml-2">
          You can find the prompt and model logic for this use-case in{" "}
          <code>app/api/chat/route.ts</code>.
        </span>
      </li>
      <li className="hidden text-l md:block">
        🎨
        <span className="ml-2">
          The main frontend logic is found in <code>app/page.tsx</code>.
        </span>
      </li>
      <li className="text-l">
        🐙
        <span className="ml-2">
          This template is open source - you can see the source code and
          deploy your own version{" "}
          <a
            href="https://github.com/michaelessiet/solana-agent-nextjs-starter-langchain"
            target="_blank"
          >
            from the GitHub repo
          </a>
          !
        </span>
      </li>
      <li className="text-l">
        👇
        <span className="ml-2">
          Try asking e.g. <code>What is my wallet address?</code> below!
        </span>
      </li>
    </ul>
  </div>
);