'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRealtime } from '@/lib/realtime/context';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type ClientMessage = Database['public']['Tables']['client_messages']['Row'];

interface UseRealtimeMessagesOptions {
  clientId: string;
  onNewMessage?: (message: ClientMessage) => void;
}

export function useRealtimeMessages({ clientId, onNewMessage }: UseRealtimeMessagesOptions) {
  const supabase = createClient();
  const { subscribeToTable, startTyping, stopTyping, typingUsers, trackPresence, untrackPresence } = useRealtime();
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const typingChannel = `typing:client-${clientId}`;
  const presenceChannel = `client-${clientId}`;

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('client_messages')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to load messages:', error);
      } else {
        setMessages(data || []);
      }
      setIsLoading(false);
    };

    loadMessages();
  }, [clientId, supabase]);

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = subscribeToTable(
      'client_messages',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as ClientMessage;
          setMessages((prev) => [...prev, newMessage]);
          onNewMessage?.(newMessage);
        } else if (payload.eventType === 'UPDATE') {
          const updatedMessage = payload.new as ClientMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      },
      `client_id=eq.${clientId}`
    );

    return () => {
      unsubscribe();
    };
  }, [clientId, subscribeToTable, onNewMessage]);

  // Track presence (online status)
  useEffect(() => {
    trackPresence(presenceChannel, 'admin', { type: 'admin', clientId });
    return () => {
      untrackPresence(presenceChannel);
    };
  }, [presenceChannel, trackPresence, untrackPresence, clientId]);

  // Get typing users for this client
  const typingUsersList = typingUsers[typingChannel] || [];

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', user.user.id)
        .single();

      const senderName = profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Admin'
        : 'Admin';

      const { data, error } = await supabase
        .from('client_messages')
        .insert({
          client_id: clientId,
          sender_type: 'admin',
          sender_id: user.user.id,
          sender_name: senderName,
          content,
          status: 'delivered',
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    [clientId, supabase]
  );

  // Mark message as read
  const markAsRead = useCallback(
    async (messageId: string) => {
      const { data, error } = await supabase
        .from('client_messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          status: 'read',
        })
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setMessages((prev) => prev.map((m) => (m.id === messageId ? data : m)));
      return data;
    },
    [supabase]
  );

  // Typing handlers
  const handleStartTyping = useCallback(
    (userId: string, userName: string) => {
      if (!isTyping) {
        setIsTyping(true);
        startTyping(typingChannel, userId, userName);
      }
    },
    [isTyping, startTyping, typingChannel]
  );

  const handleStopTyping = useCallback(
    (userId: string) => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(typingChannel, userId);
      }
    },
    [isTyping, stopTyping, typingChannel]
  );

  return {
    messages,
    isLoading,
    typingUsers: typingUsersList,
    isTyping,
    sendMessage,
    markAsRead,
    startTyping: handleStartTyping,
    stopTyping: handleStopTyping,
  };
}
