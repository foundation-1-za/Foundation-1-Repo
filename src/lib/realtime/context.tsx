'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface RealtimeContextType {
  isConnected: boolean;
  onlineUsers: string[];
  subscribe: (channelName: string, callback: (payload: unknown) => void) => () => void;
  subscribeToTable: (table: string, callback: (payload: RealtimePostgresChangesPayload<unknown>) => void, filter?: string) => () => void;
  broadcast: (channelName: string, event: string, payload: unknown) => Promise<void>;
  trackPresence: (channelName: string, userId: string, userInfo: Record<string, unknown>) => void;
  untrackPresence: (channelName: string) => void;
  startTyping: (channelName: string, userId: string, userName: string) => void;
  stopTyping: (channelName: string, userId: string) => void;
  typingUsers: Record<string, { userId: string; userName: string; timestamp: number }[]>;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const supabase = useRef(createClient()).current;
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<RealtimeContextType['typingUsers']>({});
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Check connection status
  useEffect(() => {
    const channel = supabase.channel('connection-check')
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  // Subscribe to broadcast channel
  const subscribe = useCallback((channelName: string, callback: (payload: unknown) => void) => {
    const existingChannel = channelsRef.current.get(channelName);
    if (existingChannel) {
      existingChannel.unsubscribe();
    }

    const channel = supabase.channel(channelName)
      .on('broadcast', { event: '*' }, (payload) => {
        callback(payload.payload);
      })
      .subscribe();

    channelsRef.current.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      channelsRef.current.delete(channelName);
    };
  }, [supabase]);

  // Subscribe to Postgres changes
  const subscribeToTable = useCallback((
    table: string,
    callback: (payload: RealtimePostgresChangesPayload<unknown>) => void,
    filter?: string
  ) => {
    const channelName = `table-${table}-${filter || 'all'}`;
    const existingChannel = channelsRef.current.get(channelName);
    if (existingChannel) {
      existingChannel.unsubscribe();
    }

    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filter,
        },
        callback
      )
      .subscribe();

    channelsRef.current.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      channelsRef.current.delete(channelName);
    };
  }, [supabase]);

  // Broadcast message
  const broadcast = useCallback(async (channelName: string, event: string, payload: unknown) => {
    const channel = channelsRef.current.get(channelName);
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    }
  }, []);

  // Track presence (online users)
  const trackPresence = useCallback((channelName: string, userId: string, userInfo: Record<string, unknown>) => {
    const presenceChannel = supabase.channel(`presence:${channelName}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const users = Object.keys(newState);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers((prev) => [...new Set([...prev, key])]);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== key));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track(userInfo);
        }
      });

    channelsRef.current.set(`presence:${channelName}`, presenceChannel);
  }, [supabase]);

  const untrackPresence = useCallback((channelName: string) => {
    const channel = channelsRef.current.get(`presence:${channelName}`);
    if (channel) {
      channel.unsubscribe();
      channelsRef.current.delete(`presence:${channelName}`);
    }
  }, []);

  // Typing indicators
  const startTyping = useCallback((channelName: string, userId: string, userName: string) => {
    broadcast(channelName, 'typing_start', { userId, userName, timestamp: Date.now() });

    // Clear existing timeout
    if (typingTimeoutRef.current[`${channelName}-${userId}`]) {
      clearTimeout(typingTimeoutRef.current[`${channelName}-${userId}`]);
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current[`${channelName}-${userId}`] = setTimeout(() => {
      stopTyping(channelName, userId);
    }, 3000);
  }, [broadcast]);

  const stopTyping = useCallback((channelName: string, userId: string) => {
    broadcast(channelName, 'typing_stop', { userId, timestamp: Date.now() });
    
    if (typingTimeoutRef.current[`${channelName}-${userId}`]) {
      clearTimeout(typingTimeoutRef.current[`${channelName}-${userId}`]);
      delete typingTimeoutRef.current[`${channelName}-${userId}`];
    }
  }, [broadcast]);

  // Listen for typing events
  useEffect(() => {
    const unsubscribe = subscribe('typing:*', (payload: unknown) => {
      const typingPayload = payload as { event: string; userId: string; userName: string; timestamp: number; channelName?: string };
      const channelName = typingPayload.channelName || 'default';
      
      setTypingUsers((prev) => {
        const current = prev[channelName] || [];
        
        if (typingPayload.event === 'typing_start') {
          // Add or update user
          const filtered = current.filter((u) => u.userId !== typingPayload.userId);
          return {
            ...prev,
            [channelName]: [...filtered, { userId: typingPayload.userId, userName: typingPayload.userName, timestamp: typingPayload.timestamp }],
          };
        } else if (typingPayload.event === 'typing_stop') {
          return {
            ...prev,
            [channelName]: current.filter((u) => u.userId !== typingPayload.userId),
          };
        }
        return prev;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      channelsRef.current.forEach((channel) => channel.unsubscribe());
      channelsRef.current.clear();
      Object.values(typingTimeoutRef.current).forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        onlineUsers,
        subscribe,
        subscribeToTable,
        broadcast,
        trackPresence,
        untrackPresence,
        startTyping,
        stopTyping,
        typingUsers,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
