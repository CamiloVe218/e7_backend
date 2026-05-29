import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(token: string): Socket {
  const s = getSocket();
  // Update auth token — socket.io-client picks this up on the next connect()
  s.auth = { token };
  if (s.connected) {
    s.disconnect();
    s.connect();
  } else {
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
}
