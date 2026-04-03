import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date | string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date | string;
  unreadCount: number;
  propertyContext?: {
    propertyId: string;
    propertyTitle: string;
  };
}

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  activeConversation: string | null;
  isLoading: boolean;
  
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  setActiveConversation: (id: string | null) => void;
  markAsRead: (conversationId: string) => void;
  setLoading: (loading: boolean) => void;
  getTotalUnread: () => number;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversation: null,
      isLoading: false,

      setConversations: (conversations) => set({ conversations }),

      setMessages: (conversationId, messages) => set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages,
        },
      })),

      addMessage: (conversationId, message) => set((state) => {
        const existingMessages = state.messages[conversationId] || [];
        const exists = existingMessages.some(m => m.id === message.id);
        if (exists) return state;

        return {
          messages: {
            ...state.messages,
            [conversationId]: [...existingMessages, message],
          },
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  lastMessage: message.content,
                  lastMessageTime: message.timestamp,
                  unreadCount: message.senderId !== conv.participantId
                    ? conv.unreadCount + 1
                    : conv.unreadCount,
                }
              : conv
          ).sort((a, b) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
          }),
        };
      }),

      setActiveConversation: (id) => set({ activeConversation: id }),

      markAsRead: (conversationId) => set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ),
      })),

      setLoading: (loading) => set({ isLoading: loading }),

      getTotalUnread: () => {
        return get().conversations.reduce((total, conv) => total + conv.unreadCount, 0);
      },
    }),
    {
      name: "agent-with-me-chat",
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
      }),
    }
  )
);
