"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Home, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axois";
import { initializeSocket, disconnectSocket, onEvent, offEvent } from "@/app/utility/socket";
import { ChatListSkeleton } from "@/components/ui/skeleton";
import FeatureInProgressOverlay from "@/components/UnderConstruction";

const { base, app } = Req;

interface Conversation {
  _id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  propertyContext?: {
    propertyId: string;
    propertyTitle: string;
  };
}

export default function ChatListPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchConversations = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const res = await app.get(`${base}/v1/chat/${user._id}`).catch(() => ({ data: { data: [] } }));
      const data = res.data?.data || [];
      
      const formatted = data.map((conv: any) => ({
        _id: conv._id || conv.conversationId,
        participantId: conv.participantId,
        participantName: conv.participantName || conv.participant?.userName || "User",
        participantAvatar: conv.participantAvatar || conv.participant?.avatar,
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv.unreadCount || 0,
        propertyContext: conv.propertyContext,
      }));
      
      setConversations(formatted);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [app, base, user?._id]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }
    
    const token = localStorage.getItem("token");
    if (token) {
      initializeSocket(token);
    }
    
    fetchConversations();
    
    return () => {
      disconnectSocket();
    };
  }, [_hasHydrated, isAuthenticated, user, router, fetchConversations]);

  useEffect(() => {
    const handleNewMessage = () => {
      fetchConversations();
    };
    
    const handleMessagesRead = () => {
      fetchConversations();
    };
    
    onEvent("new_message", handleNewMessage);
    onEvent("messages_read", handleMessagesRead);
    
    return () => {
      offEvent("new_message", handleNewMessage);
      offEvent("messages_read", handleMessagesRead);
    };
  }, [fetchConversations]);

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 py-3">
          <Link href="/properties">
            <Button variant="ghost" size="icon" className="rounded-full bg-black text-white hover:bg-gray-800">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Messages</h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>

        {/* Conversations List */}
        {loading ? (
          <ChatListSkeleton />
        ) : filteredConversations.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchQuery ? "No conversations found" : "No messages yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? "Try a different search term"
                  : "Start a conversation by contacting an agent about a property"}
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
            {filteredConversations.map((conv) => (
              <Link
                key={conv._id}
                href={`/chat/${conv.participantId}`}
              >
                <Card className="bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-black text-white text-lg">
                          {conv.participantName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conv.participantName}
                          </h3>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>

                        {/* Property Context */}
                        {conv.propertyContext && (
                          <p className="text-xs text-gray-500 truncate mb-1">
                            Re: {conv.propertyContext.propertyTitle}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage || "Start a conversation"}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-black text-white rounded-full px-2">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <FeatureInProgressOverlay>
        <div className="hidden">Placeholder</div>
      </FeatureInProgressOverlay>
    </div>
  );
}
