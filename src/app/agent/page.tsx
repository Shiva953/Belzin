/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect, useRef } from 'react';
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

const DEFAULT_OPTIONS = [
  {
    title: "Swap tokens",
    subtitle: "Ex: Swap 0.1 SOL for USDC"
  },
  {
    title: "Buy SOL",
    subtitle: "Ex: Buy 100 USDC worth of SOL"
  },
  {
    title: "Create a PumpFun Token",
    subtitle: "Launch a pumpfun token"
  },
  {
    title: "Launch a Bet",
    subtitle: "Ex: Create a new betting blink with bet amount as 100$"
  }
];

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [autoInterval, setAutoInterval] = useState(10);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const autoModeRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto mode handler
  useEffect(() => {
    if (autoMode) {
      // Add system message when auto mode starts
      setMessages(prev => [...prev, {
        type: 'System',
        content: 'Autonomous mode activated. Agent will perform actions automatically.',
        timestamp: new Date()
      }]);
      
      // Start auto mode cycle
      const runAutoMode = async () => {
        const thought = "Be creative and do something interesting on the blockchain. Choose an action or set of actions and execute it that highlights your abilities.";
        await handleAgentInteraction(thought);
      };

      runAutoMode();
      autoModeRef.current = setInterval(runAutoMode, autoInterval * 1000);
    } else {
      // Clear interval when auto mode is turned off
      if (autoModeRef.current) {
        clearInterval(autoModeRef.current);
        autoModeRef.current = null;
        
        setMessages(prev => [...prev, {
          type: 'System',
          content: 'Autonomous mode deactivated.',
          timestamp: new Date()
        }]);
      }
    }

    // Cleanup on component unmount
    return () => {
      if (autoModeRef.current) {
        clearInterval(autoModeRef.current);
      }
    };
  }, [autoMode, autoInterval]);

  const handleAgentInteraction = async (content: string) => {
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reply);
      }

      return data.reply;
    } catch (error: any) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      type: 'User' as const,
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const reply = await handleAgentInteraction(userMessage.content);
      
      setMessages(prev => [...prev, {
        type: 'Agent',
        content: reply,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        type: 'Error',
        content: error.message,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Mode Toggle */}
      <div className="flex items-center space-x-2 p-4 border-b border-gray-800">
        <Switch
          id="auto-mode"
          checked={autoMode}
          onCheckedChange={setAutoMode}
        />
        <Label htmlFor="auto-mode" className="text-gray-300">Autonomous Mode</Label>
        {autoMode && (
          <input
            type="number"
            value={autoInterval}
            onChange={(e) => setAutoInterval(Number(e.target.value))}
            className="w-16 px-2 py-1 ml-4 bg-gray-800 border border-gray-700 rounded text-white"
            min="5"
            max="60"
          />
        )}
      </div>

      {/* Default Options */}
      {messages.length === 0 && (
        <div className="grid grid-cols-2 gap-4 p-4">
          {DEFAULT_OPTIONS.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                setInput(option.subtitle);
                handleSubmit(new Event('submit') as any);
              }}
              className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors text-left"
            >
              <h3 className="font-medium text-white">{option.title}</h3>
              <p className="text-sm text-gray-400">{option.subtitle}</p>
            </button>
          ))}
        </div>
      )}

      {/* Chat Window */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'User' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[600px] rounded-2xl p-4 break-words ${
                message.type === 'User'
                  ? 'bg-white text-black'
                  : message.type === 'Error'
                  ? 'bg-red-500/10 text-red-500'
                  : message.type === 'System'
                  ? 'bg-[rgb(26,26,26)] text-gray-300 italic'
                  : 'bg-[rgb(26,26,26)] text-white'
              }`}
              style={{ overflowWrap: 'break-word' }}
            >
              <div className="text-sm opacity-75 mb-1 text-gray-400">
                {message.timestamp.toLocaleTimeString()}
              </div>
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl p-4 text-gray-300">
              Agent is thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-800 p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-[rgb(26,26,26)] rounded-full px-4 py-2">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-300"
              onClick={() => {/* Handle attachment */}}
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 bg-[rgb(26,26,26)] text-white placeholder-gray-500 focus:outline-none"
              disabled={loading || autoMode}
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !input.trim() || autoMode}
            className="rounded-full p-3 aspect-square"
            variant="default"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}