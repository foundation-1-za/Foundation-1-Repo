'use client';

import React, { useEffect, useState } from 'react';
import { useRealtime } from '@/lib/realtime/context';
import { Bell, X, Wifi, WifiOff } from 'lucide-react';
import styles from './RealtimeNotification.module.css';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

export function RealtimeStatus() {
  const { isConnected } = useRealtime();

  return (
    <div className={`${styles.status} ${isConnected ? styles.connected : styles.disconnected}`}>
      {isConnected ? (
        <>
          <Wifi size={14} />
          <span>Live</span>
        </>
      ) : (
        <>
          <WifiOff size={14} />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}

export function RealtimeNotificationToast() {
  const { subscribe, isConnected } = useRealtime();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to notifications
    const unsubscribe = subscribe('notifications', (payload: unknown) => {
      const notif = payload as Notification;
      const id = `${notif.timestamp}-${Math.random()}`;
      
      setNotifications((prev) => [...prev, { ...notif, id }]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, isConnected]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`${styles.toast} ${styles[notif.type]}`}
          onClick={() => removeNotification(notif.id)}
        >
          <Bell size={16} />
          <div className={styles.toastContent}>
            <strong>{notif.title}</strong>
            <span>{notif.message}</span>
          </div>
          <button className={styles.closeBtn}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function TypingIndicator({ users }: { users: { userId: string; userName: string; timestamp: number }[] }) {
  if (users.length === 0) return null;

  const text = users.length === 1 
    ? `${users[0].userName} is typing...`
    : users.length === 2
    ? `${users[0].userName} and ${users[1].userName} are typing...`
    : `${users[0].userName} and ${users.length - 1} others are typing...`;

  return (
    <div className={styles.typingIndicator}>
      <span className={styles.typingDots}>
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span className={styles.typingText}>{text}</span>
    </div>
  );
}

export function OnlineIndicator({ userIds }: { userIds: string[] }) {
  if (userIds.length === 0) return null;

  return (
    <div className={styles.onlineIndicator}>
      <span className={styles.onlineDot}></span>
      <span className={styles.onlineText}>
        {userIds.length} online
      </span>
    </div>
  );
}
