import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_ENV === "production"
  ? "https://agent-with-me-backend.onrender.com"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5036";

let socket: Socket | null = null;
let connectionCallbacks: ((connected: boolean) => void)[] = [];
let reconnectCallbacks: (() => void)[] = [];
let isFirstConnection = true;

interface QueuedMessage {
  receiverId: string;
  content: string;
  conversationId?: string;
  timestamp: number;
}

let messageQueue: QueuedMessage[] = [];
let isProcessingQueue = false;

const STORAGE_KEY = "chat_message_queue";

const saveQueueToStorage = () => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messageQueue));
    } catch (e) {
      console.error("Failed to save message queue:", e);
    }
  }
};

const loadQueueFromStorage = (): QueuedMessage[] => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load message queue:", e);
      return [];
    }
  }
  return [];
};

const processQueue = async () => {
  if (isProcessingQueue || !socket?.connected || messageQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (messageQueue.length > 0 && socket?.connected) {
    const msg = messageQueue[0];
    try {
      await new Promise<void>((resolve, reject) => {
        socket?.emit("send_message", {
          receiverId: msg.receiverId,
          content: msg.content,
          conversationId: msg.conversationId,
        }, (response: any) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.message || "Failed to send"));
          }
        });
      });
      messageQueue.shift();
      saveQueueToStorage();
    } catch (error) {
      console.error("Failed to process queued message:", error);
      break;
    }
  }

  isProcessingQueue = false;
  if (messageQueue.length > 0 && socket?.connected) {
    setTimeout(processQueue, 1000);
  }
};

export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  messageQueue = loadQueueFromStorage();

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
    connectionCallbacks.forEach(cb => cb(true));
    
    if (!isFirstConnection) {
      console.log("Socket reconnected, firing reconnect callbacks");
      reconnectCallbacks.forEach(cb => cb());
      processQueue();
    }
    isFirstConnection = false;
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
    connectionCallbacks.forEach(cb => cb(false));
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
    connectionCallbacks.forEach(cb => cb(false));
  });

  return socket!;
};

export const getSocket = (): Socket | null => socket;

export const isSocketConnected = (): boolean => socket?.connected ?? false;

export const onConnectionChange = (callback: (connected: boolean) => void): void => {
  connectionCallbacks.push(callback);
  if (socket?.connected) {
    callback(true);
  }
};

export const offConnectionChange = (callback: (connected: boolean) => void): void => {
  connectionCallbacks = connectionCallbacks.filter(cb => cb !== callback);
};

export const onReconnect = (callback: () => void): void => {
  reconnectCallbacks.push(callback);
};

export const offReconnect = (callback: () => void): void => {
  reconnectCallbacks = reconnectCallbacks.filter(cb => cb !== callback);
};

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

export const sendMessageWithFallback = async (
  receiverId: string,
  content: string,
  conversationId: string | undefined,
  apiCallback?: (response: any) => void
): Promise<{ success: boolean; message?: any; viaApi?: boolean }> => {
  if (socket?.connected) {
    return new Promise((resolve) => {
      socket!.emit("send_message", { receiverId, content, conversationId }, (response: any) => {
        if (apiCallback) apiCallback(response);
        resolve({ success: response.success, message: response.message });
      });
    });
  } else {
    console.log("Socket not connected, using REST API fallback");
    return { success: false, viaApi: true };
  }
};

export const queueMessage = (receiverId: string, content: string, conversationId?: string): void => {
  const queuedMsg: QueuedMessage = {
    receiverId,
    content,
    conversationId,
    timestamp: Date.now(),
  };
  messageQueue.push(queuedMsg);
  saveQueueToStorage();
  console.log("Message queued for later delivery:", messageQueue.length, "messages");
};

export const getQueuedMessages = (): QueuedMessage[] => [...messageQueue];

export const clearMessageQueue = (): void => {
  messageQueue = [];
  saveQueueToStorage();
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

export const onDeliveryReceipt = (callback: (data: any) => void): void => {
  onEvent("delivery_receipt", callback);
};

export const offDeliveryReceipt = (callback: (data: any) => void): void => {
  offEvent("delivery_receipt", callback);
};

export const onReadReceipt = (callback: (data: any) => void): void => {
  onEvent("read_receipt", callback);
};

export const offReadReceipt = (callback: (data: any) => void): void => {
  offEvent("read_receipt", callback);
};