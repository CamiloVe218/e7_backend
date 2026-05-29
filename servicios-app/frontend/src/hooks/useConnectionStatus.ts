'use client';

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';

export function useConnectionStatus(): boolean {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    // Sync with current state immediately
    setConnected(socket.connected);

    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect',    onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect',    onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return connected;
}
