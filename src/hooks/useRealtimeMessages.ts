'use client';

import { useState, useCallback } from 'react';

export function useRealtimeMessages({ clientId, onNewMessage }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (content: string) => { }, []);
  const markAsRead = useCallback(async (id: string) => { }, []);
  const startTyping = useCallback(() => { }, []);
  const stopTyping = useCallback(() => { }, []);

  return {
    messages,
    isLoading,
    typingUsers: [],
    isTyping,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
  };
}
