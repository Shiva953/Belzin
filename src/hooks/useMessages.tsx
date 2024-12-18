import { useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  timestamp: number;
  // Add other relevant fields
}

interface UseChatMessagesResult {
  initialMessages: ChatMessage[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useChatMessages(chatId: string): UseChatMessagesResult {
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchChatMessages() {
    // Reset states before fetching
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/getMessagesForGivenChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId })
      });

      if (!res.ok) {
        throw new Error('Failed to fetch chat messages');
      }

      const messages = await res.json();
      
      // Sort messages by timestamp in descending order (most recent first)
      const sortedMessages = messages.sort((a: ChatMessage, b: ChatMessage) => 
        Number(b.timestamp) - Number(a.timestamp)
      );

      setInitialMessages(sortedMessages);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching messages for given chatid: ", err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setLoading(false);
    }
  }

  useEffect(() => {
    // Only fetch if chatId is provided
    if (chatId) {
      fetchChatMessages();
    }
  }, [chatId]);

  return {
    initialMessages,
    loading,
    error,
    refetch: fetchChatMessages
  };
}