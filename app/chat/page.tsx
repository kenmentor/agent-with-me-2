"use client";

import { useState, useEffect, useCallback, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageCircle, Search, Check, CheckCheck, ArrowDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axios";
import { 
  initializeSocket, 
  onEvent, 
  offEvent, 
  isSocketConnected,
  onReconnect,
  offReconnect,
  onConnectionChange,
  offConnectionChange,
  onDeliveryReceipt,
  offDeliveryReceipt,
  onReadReceipt,
  offReadReceipt
} from "@/app/utility/socket";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { getDisplayName, getFirstName } from "@/lib/utils";

const { base, app } = Req;

interface ChatUser {
  userId: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  isUnread: boolean;
  unreadCount: number;
  isOnline?: boolean;
  lastMessageStatus?: "sent" | "delivered" | "read";
}

export default function ChatListPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, getUserId } = useAuthStore();
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastScrollPosition = useRef(0);
  const processedMessagesRef = useRef<Set<string>>(new Set());

  const fetchMessages = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      setLoading(true);
      const res = await app.get(`${base}/v1/chat/messages/${userId}`);
      const data = res.data?.data;
      
      if (data && data.messages && data.messages.length > 0) {
        const userMap = new Map<string, ChatUser>();
        
        data.messages.forEach((msg: any) => {
          if (!msg.content && !msg._id) return;
          
          const otherUserId = msg.otherUserId || (msg.senderId === userId ? msg.receiverId : msg.senderId);
          const otherUserName = msg.otherUserName || "User";
          const isSentByMe = msg.senderId === userId;
          const isRead = msg.read === true;
          const status = msg.status || (isRead ? "read" : msg.delivered ? "delivered" : "sent");
          
          if (!userMap.has(otherUserId)) {
            userMap.set(otherUserId, {
              userId: otherUserId,
              userName: otherUserName,
              lastMessage: msg.content || "",
              lastMessageTime: msg.createdAt || msg.timestamp,
              isUnread: !isSentByMe && !isRead,
              unreadCount: !isSentByMe && !isRead ? 1 : 0,
              lastMessageStatus: isSentByMe ? status : undefined,
            });
          } else {
            const existing = userMap.get(otherUserId)!;
            if (new Date(msg.createdAt) > new Date(existing.lastMessageTime)) {
              existing.lastMessage = msg.content || "";
              existing.lastMessageTime = msg.createdAt || msg.timestamp;
              if (isSentByMe) {
                existing.lastMessageStatus = status;
              }
            }
            if (!isSentByMe && !isRead) {
              existing.isUnread = true;
              existing.unreadCount++;
            }
          }
        });
        
        const chatUsersArray = Array.from(userMap.values()).sort(
          (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
        setChatUsers(chatUsersArray);
        
        setTimeout(() => {
          listRef.current?.scrollTo({ top: 0, behavior: "auto" });
        }, 0);
      }
    } catch (err) {
// console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const userId = getUserId();
    if (!userId) return;

    const token = localStorage.getItem("token");
    if (token && !isSocketConnected()) {
      initializeSocket(token);
    }

    fetchMessages();
  }, [_hasHydrated, isAuthenticated, router, fetchMessages, getUserId]);

  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      if (connected) {
        fetchMessages();
      }
    };

    onConnectionChange(handleConnectionChange);

    return () => {
      offConnectionChange(handleConnectionChange);
    };
  }, [fetchMessages]);

  useEffect(() => {
    const handleReconnect = () => {
// console.log("🔄 Chat list: socket reconnected, refetching all messages from server");
      fetchMessages();
    };

    onReconnect(handleReconnect);

    return () => {
      offReconnect(handleReconnect);
    };
  }, [fetchMessages]);

  // Also fetch on initial load when user comes online (session recovery)

  useEffect(() => {
    const handleNewMessage = (data: { message: any }) => {
      const userId = getUserId();
      if (!userId) return;
      
      const { message } = data;
      const messageId = message._id || message.id || `${message.senderId}-${message.timestamp || message.createdAt}`;
      if (processedMessagesRef.current.has(messageId)) return;
      processedMessagesRef.current.add(messageId);
      if (processedMessagesRef.current.size > 100) {
        processedMessagesRef.current = new Set(Array.from(processedMessagesRef.current).slice(-50));
      }
      
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const isSentByMe = message.senderId === userId;
      
      setChatUsers(prev => {
        const existing = prev.find(c => c.userId === otherUserId);
        
        if (existing) {
          const wasAtBottom = lastScrollPosition.current >= listRef.current!.scrollHeight - listRef.current!.clientHeight - 100;
          
          const updated = prev.map(c => {
            if (c.userId === otherUserId) {
              const isUnread = message.senderId !== userId;
              return {
                ...c,
                lastMessage: message.content,
                lastMessageTime: message.timestamp || message.createdAt,
                isUnread: isUnread,
                unreadCount: isUnread ? c.unreadCount + 1 : c.unreadCount,
                lastMessageStatus: isSentByMe ? (message.status || "sent") : c.lastMessageStatus,
              };
            }
            return c;
          }).sort((a, b) => 
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
          );
          
          if (!wasAtBottom && !isSentByMe) {
            setNewMessagesCount(prev => prev + 1);
            setShowScrollButton(true);
          }
          
          return updated;
        }
        return prev;
      });
    };

    const handleDeliveryReceipt = (data: { messages?: any[]; messageId?: string; conversationId?: string; status?: string }) => {
      setChatUsers(prev => {
        return prev.map(c => {
          if (data.messages && data.messages.length > 0) {
            const deliveredMsg = data.messages.find((m: any) => m.receiverId === c.userId);
            if (deliveredMsg) {
              return { ...c, lastMessageStatus: "delivered" as const };
            }
          }
          if (data.messageId) {
            return { ...c, lastMessageStatus: "delivered" as const };
          }
          return c;
        });
      });
    };

    const handleReadReceipt = (data: { conversationId?: string; status?: string }) => {
      setChatUsers(prev => {
        return prev.map(c => ({ ...c, lastMessageStatus: "read" as const }));
      });
    };

    const handleMessagesRead = (data: { conversationId: string; readBy: string }) => {
      const userId = getUserId();
      if (!userId) return;
      
      setChatUsers(prev => {
        return prev.map(c => {
          if (c.userId === data.readBy) {
            return { ...c, lastMessageStatus: "read" as const, isUnread: false, unreadCount: 0 };
          }
          return c;
        });
      });
    };

    const handleUserOnline = (data: { userId: string }) => {
      setOnlineUsers(prev => new Set(prev).add(data.userId));
    };

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    onEvent("new_message", handleNewMessage);
    onEvent("message_sent", handleNewMessage);
    onEvent("messages_read", handleMessagesRead);
    onEvent("user_online", handleUserOnline);
    onEvent("user_offline", handleUserOffline);
    onDeliveryReceipt(handleDeliveryReceipt);
    onReadReceipt(handleReadReceipt);

    return () => {
offEvent("new_message", handleNewMessage);
    offEvent("message_sent", handleNewMessage);
    offEvent("messages_read", handleMessagesRead);
      offEvent("user_online", handleUserOnline);
      offEvent("user_offline", handleUserOffline);
      offDeliveryReceipt(handleDeliveryReceipt);
      offReadReceipt(handleReadReceipt);
    };
  }, [getUserId]);

  const filteredChatUsers = chatUsers.filter(user => 
    getDisplayName(user).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth"
    });
    setNewMessagesCount(0);
    setShowScrollButton(false);
  };

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    lastScrollPosition.current = scrollTop;
    
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (isAtBottom) {
      setShowScrollButton(false);
      setNewMessagesCount(0);
    }
  };

  useEffect(() => {
    if (newMessagesCount > 0) {
      const timer = setTimeout(() => {
        setNewMessagesCount(0);
        setShowScrollButton(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [newMessagesCount]);

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: false });
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const totalUnreadConversations = chatUsers.filter(c => c.isUnread).length;
  const totalUnreadMessages = chatUsers.reduce((sum, c) => sum + c.unreadCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      <div className="max-w-2xl mx-auto bg-white h-full flex flex-col relative">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/properties">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              {totalUnreadMessages > 0 && (
                <p className="text-xs text-blue-600 font-medium">
                  {totalUnreadMessages} unread message{totalUnreadMessages !== 1 ? "s" : ""} in {totalUnreadConversations} conversation{totalUnreadConversations !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-black"
            />
          </div>
        </header>

        <div 
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto relative"
        >
          {filteredChatUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No results found" : "No messages yet"}
              </h3>
              <p className="text-gray-500 text-center mb-6">
                {searchQuery 
                  ? `No conversations matching "${searchQuery}"` 
                  : "Start a conversation by contacting an agent"}
              </p>
              {!searchQuery && (
                <Link href="/properties">
                  <Button className="bg-black hover:bg-gray-800 rounded-full px-6">
                    Browse Properties
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredChatUsers.map((chatUser) => (
                <Link
                  key={chatUser.userId}
                  href={`/chat/${chatUser.userId}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-4 flex items-center gap-4 overflow-hidden">
                    <div className="relative">
                      <Avatar className={`h-14 w-14 ${chatUser.isUnread ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}>
                        <AvatarFallback className="bg-gray-800 text-white text-lg">
                          {getFirstName(chatUser)?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {onlineUsers.has(chatUser.userId) && (
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`${chatUser.isUnread ? "font-bold" : "font-semibold"} text-gray-900 truncate pr-2`}>
                          {getDisplayName(chatUser)}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(chatUser.lastMessageTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 overflow-hidden">
                        <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
                          {chatUser.lastMessageStatus === "read" ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          ) : chatUser.lastMessageStatus === "delivered" ? (
                            <CheckCheck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          ) : chatUser.lastMessageStatus === "sent" ? (
                            <Check className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          ) : null}
                          <p className={`text-sm truncate overflow-hidden text-ellipsis ${chatUser.isUnread ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                            {chatUser.lastMessage}
                          </p>
                        </div>
                        {chatUser.isUnread && chatUser.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs font-medium min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center flex-shrink-0">
                            {chatUser.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-8 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2 animate-bounce cursor-pointer"
          >
            <ArrowDown className="w-5 h-5" />
            {newMessagesCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {newMessagesCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

