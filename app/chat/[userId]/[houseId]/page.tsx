"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Send, User, Ship, Phone, Mail, Dot } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function DashboardChat() {
  const [input, setInput] = useState("");
  const { userId, houseId } = useParams();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi there 👋 Welcome to your property dashboard. How can I assist you today?",
      timestamp: new Date(Date.now() - 200000),
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Got it 👍 I’ll update your dashboard information accordingly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#0b0b0c] text-white">
      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-6xl mx-auto border-x border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image
                src="/placeholder.svg?height=100&width=100"
                alt="Agent"
                fill
                className="object-cover"
              />
              <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border border-zinc-900" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Jane Smith</h2>
              <p className="text-sm text-zinc-400">Property Agent</p>
            </div>
          </div>

          <div className="text-right text-sm text-zinc-400">
            <p>
              User ID: <span className="text-white font-medium">{userId}</span>
            </p>
            <p>
              House ID:{" "}
              <span className="text-white font-medium">{houseId}</span>
            </p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6 py-6 space-y-6 bg-zinc-950/60">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-end gap-3 max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md ${
                    message.role === "user"
                      ? "bg-white text-black"
                      : "bg-gradient-to-r from-blue-600 to-cyan-500"
                  }`}
                >
                  {message.role === "user" ? (
                    <User size={16} />
                  ) : (
                    <Ship size={16} />
                  )}
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === "user"
                      ? "bg-white text-black"
                      : "bg-zinc-800/80 text-white border border-zinc-700"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur-md">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl py-3 pr-12 focus:ring-2 focus:ring-blue-500 transition"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button
              onClick={handleSend}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl px-5 shadow-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
