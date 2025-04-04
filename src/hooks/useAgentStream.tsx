import { useState } from 'react';

export function useAgentStream() {
  const [isStreaming, setIsStreaming] = useState(false);

  const streamAgentResponse = async (
    messageContent: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void
  ) => {
    setIsStreaming(true);
    try {
      const response = await fetch('/api/agent/groupchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageContent: messageContent }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let accumulatedResponse = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        accumulatedResponse += chunk;
        onChunk(chunk);
      }

      return accumulatedResponse;
    } finally {
      setIsStreaming(false);
      onComplete();
    }
  };

  return { streamAgentResponse, isStreaming };
}