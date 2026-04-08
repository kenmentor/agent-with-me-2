import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_ENV === "production"
  ? "https://agent-with-me-backend.onrender.com"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5036";

let socket: Socket | null = null;

export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(`${SOCKET_URL}/chat`, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 10000,
  });

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("disconnect", () => {
  });

  socket.on("connect_error", () => {
  });

  socket.on("reconnect_attempt", () => {
  });

  socket.on("reconnect_failed", () => {
  });

  return socket!;
};

export const getSocket = (): Socket | null => socket;

export const isSocketConnected = (): boolean => socket?.connected ?? false;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitEvent = (event: string, data?: any, callback?: (response: any) => void): void => {
  if (socket?.connected) {
    if (callback) {
      socket.emit(event, data, callback);
    } else {
      socket.emit(event, data);
    }
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

export const joinConversation = (conversationId: string, callback?: (response: any) => void): void => {
  emitEvent("join_conversation", { conversationId }, callback);
};

export const leaveConversation = (conversationId: string, callback?: (response: any) => void): void => {
  emitEvent("leave_conversation", { conversationId }, callback);
};

export const sendMessage = (
  receiverId: string,
  content: string,
  conversationId?: string,
  callback?: (response: any) => void
): void => {
  emitEvent("send_message", { receiverId, content, conversationId }, callback);
};

export const startTyping = (conversationId: string, receiverId: string): void => {
  emitEvent("typing_start", { conversationId, receiverId });
};

export const stopTyping = (conversationId: string, receiverId: string): void => {
  emitEvent("typing_stop", { conversationId, receiverId });
};

export const markMessagesRead = (conversationId: string, callback?: (response: any) => void): void => {
  emitEvent("mark_read", { conversationId }, callback);
};
