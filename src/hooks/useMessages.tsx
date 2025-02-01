import { useState, useEffect } from 'react';
import { Message } from '@/types';

interface UseChatMessagesResult {
  initialMessages: Message[]|null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useChatMessages(chatId?: string): UseChatMessagesResult {
  const [initialMessages, setInitialMessages] = useState<Message[]|null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchChatMessages() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/getMessages', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch chat messages');
      }

      const messages = await res.json();
      
      const sortedMessages = messages.sort((a: Message, b: Message) => 
        Number(b.timestamp) - Number(a.timestamp)
      );

      setInitialMessages(sortedMessages);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setLoading(false);
    }
  }

  useEffect(() => {
      fetchChatMessages();
  }, [chatId]);

  return {
    initialMessages,
    loading,
    error,
    refetch: fetchChatMessages
  };
}