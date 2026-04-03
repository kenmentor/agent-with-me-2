"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send, Loader2, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useChatStore, ChatMessage } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axois";
import { format, isToday, isYesterday } from "date-fns";
import { initializeSocket, disconnectSocket, emitEvent, onEvent, offEvent, getSocket } from "@/app/utility/socket";
import { ChatConversationSkeleton } from "@/components/ui/skeleton";

const { base, app } = Req;

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const { 
    conversations, 
    addMessage, 
    markAsRead, 
    setActiveConversation 
  } = useChatStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [participant, setParticipant] = useState<{_id: string; userName: string; avatar?: string} | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async () => {
    if (!user?._id || !userId) return;
    
    try {
      setLoading(true);
      const res = await app.get(`${base}/v1/chat/${user._id}/${userId}`).catch(() => ({ data: { data: { messages: [], participant: null } } }));
      const data = res.data?.data;
      
      if (data) {
        setMessages(data.messages || []);
        setParticipant(data.participant || { _id: userId, userName: "User" });
        setActiveConversation(userId);
        markAsRead(userId);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, [app, base, user?._id, userId, setActiveConversation, markAsRead]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }
    
    const token = localStorage.getItem("token");
    if (token) {
      initializeSocket(token);
      emitEvent("join_conversation", { conversationId: userId });
    }
    
    fetchMessages();
    
    return () => {
      emitEvent("leave_conversation", { conversationId: userId });
    };
  }, [_hasHydrated, isAuthenticated, user, router, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleNewMessage = (data: { message: ChatMessage }) => {
      if (data.message.senderId === userId || data.message.receiverId === userId) {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === data.message.id);
          if (!exists) {
            return [...prev, data.message];
          }
          return prev;
        });
        markAsRead(userId);
        scrollToBottom();
      }
    };
    
    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === userId) {
        setIsTyping(data.isTyping);
      }
    };
    
    const handleMessagesRead = () => {
      markAsRead(userId);
    };
    
    onEvent("new_message", handleNewMessage);
    onEvent("typing", handleTyping);
    onEvent("messages_read", handleMessagesRead);
    
    return () => {
      offEvent("new_message", handleNewMessage);
      offEvent("typing", handleTyping);
      offEvent("messages_read", handleMessagesRead);
    };
  }, [userId, markAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?._id || !userId) return;
    
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: user._id,
      receiverId: userId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    setSending(true);
    
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("send_message", {
        receiverId: userId,
        content: newMessage.trim(),
      }, (response: { success: boolean; message?: ChatMessage }) => {
        setSending(false);
        if (response.success && response.message) {
          setMessages((prev) => 
            prev.map((m) => (m.id === tempMessage.id ? { ...response.message!, timestamp: response.message!.timestamp || new Date().toISOString() } : m))
          );
          addMessage(userId, { ...response.message!, timestamp: response.message!.timestamp || new Date().toISOString() });
        }
      });
    } else {
      try {
        const res = await app.post(`${base}/v1/chat/send`, {
          senderId: user._id,
          receiverId: userId,
          content: newMessage.trim(),
        });
        
        if (res.data?.data) {
          const sentMessage = {
            ...res.data.data,
            senderId: res.data.data.senderId,
            receiverId: res.data.data.receiverId,
            content: res.data.data.content,
          };
          setMessages((prev) => 
            prev.map((m) => (m.id === tempMessage.id ? sentMessage : m))
          );
          addMessage(userId, sentMessage);
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
        setNewMessage(newMessage);
      } finally {
        setSending(false);
      }
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (socket?.connected) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitEvent("typing_start", { conversationId: userId, receiverId: userId });
      
      typingTimeoutRef.current = setTimeout(() => {
        emitEvent("typing_stop", { conversationId: userId, receiverId: userId });
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageDate = (date: Date | string) => {
    const d = new Date(date);
    if (isToday(d)) {
      return format(d, "HH:mm");
    } else if (isYesterday(d)) {
      return `Yesterday ${format(d, "HH:mm")}`;
    }
    return format(d, "MMM d, HH:mm");
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";
    
    messages.forEach((msg) => {
      const msgDate = format(new Date(msg.timestamp), "yyyy-MM-dd");
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    
    return groups;
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="bg-black p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/chat")}
          className="text-white hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-white text-black">
            {participant?.userName?.charAt(0)?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h2 className="text-white font-semibold">{participant?.userName || "Chat"}</h2>
          <p className="text-gray-400 text-xs">Tap to view profile</p>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4 bg-gray-50">
        {loading ? (
          <ChatConversationSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupMessagesByDate(messages).map((group) => (
              <div key={group.date}>
                <div className="flex justify-center mb-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {isToday(new Date(group.date))
                      ? "Today"
                      : isYesterday(new Date(group.date))
                      ? "Yesterday"
                      : format(new Date(group.date), "MMMM d, yyyy")}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {group.messages.map((message) => {
                    const isOwnMessage = message.senderId === user?._id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? "bg-black text-white rounded-br-md"
                              : "bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{(message as any).text || message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {formatMessageDate(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="p-3  pb-[40px] sm:p-4 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef as any}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyPress}
              disabled={sending}
              rows={1}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 max-h-32"
              style={{ minHeight: '48px' }}
            />
          </div>
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="h-12 w-12 bg-black hover:bg-gray-800 rounded-full flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
