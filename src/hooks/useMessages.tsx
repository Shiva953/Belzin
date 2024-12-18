import { useState, useEffect } from 'react';
import { ChatMessage } from '@/components/chat/public/PublicChat';

interface UseChatMessagesResult {
  initialMessages: ChatMessage[]|null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useChatMessages(chatId: string): UseChatMessagesResult {
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]|null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchChatMessages() {
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