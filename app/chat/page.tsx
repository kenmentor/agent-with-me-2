"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axois";
import { 
  initializeSocket, 
  onEvent, 
  offEvent, 
  isSocketConnected 
} from "@/app/utility/socket";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";

const { base, app } = Req;

interface ChatUser {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  isUnread: boolean;
  unreadCount: number;
}

export default function ChatListPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, getUserId } = useAuthStore();
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const res = await app.get(`${base}/v1/chat/messages/${userId}`);
      const data = res.data?.data;
      
      if (data && data.messages && data.messages.length > 0) {
        const userMap = new Map<string, ChatUser>();
        
        data.messages.forEach((msg: any) => {
          const otherUserId = msg.otherUserId || (msg.senderId === userId ? msg.receiverId : msg.senderId);
          const otherUserName = msg.otherUserName || "User";
          const isSentByMe = msg.senderId === userId;
          const isRead = msg.read === true;
          
          if (!userMap.has(otherUserId)) {
            userMap.set(otherUserId, {
              userId: otherUserId,
              userName: otherUserName,
              lastMessage: msg.content || "",
              lastMessageTime: msg.createdAt || msg.timestamp,
              isUnread: !isSentByMe && !isRead,
              unreadCount: !isSentByMe && !isRead ? 1 : 0,
            });
          } else {
            const existing = userMap.get(otherUserId)!;
            if (new Date(msg.createdAt) > new Date(existing.lastMessageTime)) {
              existing.lastMessage = msg.content || "";
              existing.lastMessageTime = msg.createdAt || msg.timestamp;
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
      } else {
        setChatUsers([]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
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
    const handleNewMessage = (data: { message: any }) => {
      const userId = getUserId();
      if (!userId) return;
      
      const { message } = data;
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      
      setChatUsers(prev => {
        const existing = prev.find(c => c.userId === otherUserId);
        
        if (existing) {
          return prev.map(c => {
            if (c.userId === otherUserId) {
              const isUnread = message.senderId !== userId;
              return {
                ...c,
                lastMessage: message.content,
                lastMessageTime: message.timestamp || message.createdAt,
                isUnread: isUnread,
                unreadCount: isUnread ? c.unreadCount + 1 : c.unreadCount,
              };
            }
            return c;
          }).sort((a, b) => 
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
          );
        }
        return prev;
      });
    };

    onEvent("new_message", handleNewMessage);

    return () => {
      offEvent("new_message", handleNewMessage);
    };
  }, [getUserId]);

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };
console.log("Chat Users:", chatUsers);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-6 py-3">
          <Link href="/properties">
            <Button variant="ghost" size="icon" className="rounded-full bg-black text-white hover:bg-gray-800">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Messages</h1>
        </div>

        {chatUsers.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start a conversation by contacting an agent
              </p>
              <Link href="/properties">
                <Button className="bg-black hover:bg-gray-800">
                  Browse Properties
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {chatUsers.map((chatUser) => (
              <Link
                key={chatUser.userId}
                href={`/chat/${chatUser.userId}`}
              >
                <Card className={`bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
                  chatUser.isUnread ? "border-l-4 border-l-blue-500" : ""
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-12 w-12 ${chatUser.isUnread ? "ring-2 ring-blue-500" : ""}`}>
                        <AvatarFallback className="bg-gray-800 text-white text-lg">
                          {chatUser.userName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`${chatUser.isUnread ? "font-bold" : "font-semibold"} text-gray-900`}>
                            {chatUser.userName}
                          </h3>
                          <div className="flex items-center gap-2">
                            {chatUser.isUnread && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {chatUser.unreadCount}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTime(chatUser.lastMessageTime)}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm truncate ${chatUser.isUnread ? "text-gray-800 font-medium" : "text-gray-600"}`}>
                          {chatUser.lastMessage}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
