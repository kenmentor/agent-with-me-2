import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_ENV === "production"
  ? "https://agent-with-me-backend.onrender.com"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5036";

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(`${SOCKET_URL}/chat`, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitEvent = (event: string, data: any): void => {
  if (socket?.connected) {
    socket.emit(event, data);
  }
};

export const onEvent = (event: string, callback: (data: any) => void): void => {
  if (socket) {
    socket.on(event, callback);
  }
};

export const offEvent = (event: string, callback?: (data: any) => void): void => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
};