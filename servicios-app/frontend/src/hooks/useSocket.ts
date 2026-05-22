'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';

export function useSocket(event: string, handler: (data: any) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();
    const stable = (data: any) => handlerRef.current(data);
    socket.on(event, stable);
    return () => { socket.off(event, stable); };
  }, [event]);
}

export function useSocketEvents(events: Record<string, (data: any) => void>) {
  const handlersRef = useRef(events);
  // Always keep ref current so wrappers call the latest handler without re-subscribing
  handlersRef.current = events;

  // Static key derived from event names — these never change per dashboard instance
  const eventNamesRef = useRef(Object.keys(events).sort().join(','));

  useEffect(() => {
    const socket = getSocket();
    const names = eventNamesRef.current.split(',').filter(Boolean);

    const wrappers: Record<string, (data: any) => void> = {};
    names.forEach(name => {
      wrappers[name] = (data: any) => handlersRef.current[name]?.(data);
      socket.on(name, wrappers[name]);
    });

    return () => {
      names.forEach(name => socket.off(name, wrappers[name]));
    };
  // Event names are static per component mount — intentional empty deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
