"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import UnderConstruction from "@/components/UnderConstruction";

interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export default function ChatDashboard() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<ChatItem[]>([]);

  // Dummy data (you can replace with API call easily)
  const dummyChats: ChatItem[] = [
    {
      id: "u1",
      name: "John Doe (Host)",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      lastMessage: "Alright, see you soon!",
      time: "09:45 AM",
      unread: 2,
    },
    {
      id: "u2",
      name: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      lastMessage: "Can I check in earlier?",
      time: "Yesterday",
      unread: 0,
    },
    {
      id: "u3",
      name: "David (Renter)",
      avatar: "https://randomuser.me/api/portraits/men/18.jpg",
      lastMessage: "Thanks for confirming my booking.",
      time: "Mon",
      unread: 0,
    },
  ];

  // Polling simulation
  useEffect(() => {
    setChats(dummyChats);
    const interval = setInterval(() => {
      // Example polling (replace this with real-time updates or API calls)
      setChats((prev) => [...prev]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectChat = (id: string) => {
    router.push(`/chat/${id}`);
  };

  return (
    <UnderConstruction>
      <div className="flex flex-col h-screen bg-black text-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold tracking-tight">Chats</h1>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-800">
          <Input
            placeholder="Search or start new chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-900 text-white border-none focus:ring-0 placeholder-gray-400"
          />
        </div>
        {/* Chat list */}
        <ScrollArea className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">No chats found</p>
          ) : (
            filteredChats.map((chat) => (
              <Card
                key={chat.id}
                className={cn(
                  "bg-black hover:bg-gray-900 border-none rounded-none cursor-pointer transition-all",
                  "flex items-center px-4 py-3"
                )}
                onClick={() => handleSelectChat(chat.id)}
              >
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback>{chat.name[0]}</AvatarFallback>
                </Avatar>

                <CardContent className="flex-1 p-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-white">{chat.name}</h3>
                    <span className="text-xs text-gray-400">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {chat.lastMessage}
                  </p>
                </CardContent>

                {chat.unread > 0 && (
                  <div className="ml-2 bg-white text-black text-xs font-bold rounded-full px-2 py-1">
                    {chat.unread}
                  </div>
                )}
              </Card>
            ))
          )}
        </ScrollArea>
      </div>
    </UnderConstruction>
  );
}
