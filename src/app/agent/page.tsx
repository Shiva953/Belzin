// /* eslint-disable @typescript-eslint/no-unused-vars */
// 'use client'
// import React, { useState, useEffect, useRef } from 'react';

// export default function AgentChat() {
//   const [messages, setMessages] = useState<{ type: string; content: string }[]>([]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // In your AgentChat component:
//     // const [messages, setMessages] = useState<{ type: string; content: string }[]>(() => {
//     //   // Load initial messages from localStorage
//     //   const saved = localStorage.getItem('chatMessages');
//     //   return saved ? JSON.parse(saved) : [];
//     // });

//     // // Save to localStorage whenever messages change
//     // useEffect(() => {
//     //   localStorage.setItem('chatMessages', JSON.stringify(messages));
//     // }, [messages]);

//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);


//   const handleSubmit = async (event: any) => {
//     event.preventDefault();
//     if (!input.trim()) return;

//     // Add user's message to the chat
//     setMessages(prev => [...prev, { type: 'User', content: input }]);
//     setLoading(true);
    
//     try {
//       const response = await fetch('/api/agent', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: input }),
//       });
//       const data = await response.json();
      
//       // Add agent's response to the chat
//       setMessages(prev => [...prev, { type: 'Agent', content: data.reply }]);
//     } catch (error) {
//       console.error('Error:', error);
//       setMessages(prev => [...prev, { type: 'Agent', content: 'Error communicating with agent.' }]);
//     } finally {
//       setLoading(false);
//       setInput('');
//     }
//   };

//   return (
//     // <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
//     //   <h2>Chat with AI Agent</h2>
//     //   <div style={{ border: '1px solid #ccc', height: '400px', overflowY: 'scroll', padding: '10px' }}>
//     //     {messages.map((msg, index) => (
//     //       <div key={index} style={{ marginBottom: '10px', textAlign: msg.sender === 'User' ? 'right' : 'left' }}>
//     //         <strong>{msg.sender}:</strong> {msg.text}
//     //       </div>
//     //     ))}
//     //     {loading && <div>Agent is typing...</div>}
//     //   </div>
//     //   <input
//     //     type="text"
//     //     value={input}
//     //     onChange={e => setInput(e.target.value)}
//     //     onKeyPress={e => e.key === 'Enter' && handleSend()}
//     //     placeholder="Type your message..."
//     //     style={{ width: '100%', padding: '10px', marginTop: '10px' }}
//     //   />
//     //   <button onClick={handleSend} style={{ padding: '10px', marginTop: '10px' }}>Send</button>
//     // </div>
//     <div className="flex flex-col h-screen w-full mx-auto p-4">
//         <>
//           <div className="flex-1 overflow-auto bg-gray-50 rounded-lg p-4 mb-4">
//             <div className="space-y-4">
//               {messages.map((message, index) => (
//                 <div
//                   key={index}
//                   className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
//                 >
//                   <div
//                     className={`max-w-[80%] rounded-lg p-3 ${
//                       message.type === 'user'
//                         ? 'bg-blue-500 text-black'
//                         : message.type === 'error'
//                         ? 'bg-red-100 text-red-700'
//                         : message.type === 'tool'
//                         ? 'bg-green-100 text-green-700'
//                         : 'bg-white border border-gray-200 text-black'
//                     }`}
//                   >
//                     {message.content}
//                   </div>
//                 </div>
//               ))}
//               {loading && <div>Agent is typing...</div>}
//               <div ref={chatEndRef} />
//             </div>
//           </div>
//           <form onSubmit={handleSubmit} className="flex gap-2">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Type your message here..."
//               className="flex-1 p-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               type="submit"
//               disabled={!input.trim()}
//               className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
//             >
//               {'Send'}
//             </button>
//           </form>
//         </>
//     </div>
//   );
// }
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Message {
  type: 'User' | 'Agent' | 'System' | 'Error';
  content: string;
  timestamp: Date;
}

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
    <div className="flex flex-col h-screen w-full mx-auto p-4">
      {/* Mode Toggle */}
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="auto-mode"
          checked={autoMode}
          onCheckedChange={setAutoMode}
        />
        <Label htmlFor="auto-mode">Autonomous Mode</Label>
        {autoMode && (
          <input
            type="number"
            value={autoInterval}
            onChange={(e) => setAutoInterval(Number(e.target.value))}
            className="w-16 px-2 py-1 ml-4 border rounded"
            min="5"
            max="60"
          />
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-auto bg-gray-50 rounded-lg p-4 mb-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'User' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'User'
                    ? 'bg-blue-500 text-black'
                    : message.type === 'Error'
                    ? 'bg-red-100 text-red-700'
                    : message.type === 'System'
                    ? 'bg-gray-100 text-gray-900 italic'
                    : 'bg-white border border-gray-200 text-black'
                }`}
              >
                <div className="text-sm opacity-75 mb-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                Agent is thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 p-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading || autoMode}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim() || autoMode}
          className="px-4 py-2"
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}