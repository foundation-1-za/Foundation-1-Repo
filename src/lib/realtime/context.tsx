'use client';

import React, { createContext, useContext, useState } from 'react';

const RealtimeContext = createContext<any>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);

  const value = {
    isConnected,
    onlineUsers: [],
    subscribe: () => () => { },
    subscribeToTable: () => () => { },
    broadcast: async () => { },
    trackPresence: () => { },
    untrackPresence: () => { },
    startTyping: () => { },
    stopTyping: () => { },
    typingUsers: {},
  };

  return (
    <RealtimeContext.Provider value={value}>
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
