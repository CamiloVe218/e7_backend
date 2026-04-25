'use client';

import { useEffect, useCallback } from 'react';
import { getSocket } from '@/lib/socket';

export function useSocket(event: string, handler: (data: any) => void) {
  useEffect(() => {
    const socket = getSocket();

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [event, handler]);
}

export function useSocketEvents(
  events: Record<string, (data: any) => void>,
) {
  useEffect(() => {
    const socket = getSocket();

    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [events]);
}
