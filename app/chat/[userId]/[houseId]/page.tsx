"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Ship } from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import { Calendar, Phone, Mail } from "lucide-react";
import { useParams } from "next/navigation";

interface RequiredField {
  id: string;
  label: string;
  status: "pending" | "checked";
  description?: string;
  category: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function LogisticsQuoteInterface() {
  const [input, setInput] = useState("");

  const { id } = useParams();
  // This would normally fetch from a database based on the ID
  const agent = {
    name: "Jane Smith",
    phone: "(305) 555-1234",
    email: "jane.smith@example.com",
    image: "/placeholder.svg?height=200&width=200",
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to GlobalShip Logistics! I'm here to help you get an instant quote for your international shipment. Let's start with the basics - are you looking to import or export goods?",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      role: "user",
      content: "Hi! I need to export goods from the US to Germany.",
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: "3",
      role: "assistant",
      content:
        "Perfect! An export from US to Germany. What type of transport would you prefer - maritime (sea freight), air freight, or do you need a recommendation based on your cargo?",
      timestamp: new Date(Date.now() - 180000),
    },
    {
      id: "4",
      role: "user",
      content: "I think maritime would be more cost-effective for my shipment.",
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: "5",
      role: "assistant",
      content:
        "Great choice! Maritime freight is indeed cost-effective for most shipments. Now, which US port would you like to ship from? Popular options include Los Angeles, Long Beach, New York, or Savannah.",
      timestamp: new Date(Date.now() - 60000),
    },
  ]);

  const [requiredFields, setRequiredFields] = useState<RequiredField[]>([
    {
      id: "shipment_direction",
      label: "Shipment Direction",
      status: "checked",
      description: "Import or Export",
      category: "Basic Info",
    },
    {
      id: "transport_type",
      label: "Transport Type",
      status: "checked",
      description: "Maritime, Air, or Land transport",
      category: "Basic Info",
    },
    {
      id: "origin_country",
      label: "Origin Country",
      status: "pending",
      description: "Country of departure",
      category: "Routing",
    },
    {
      id: "origin_port",
      label: "Origin Port/Airport",
      status: "pending",
      description: "Departure port or airport",
      category: "Routing",
    },
    {
      id: "destination_country",
      label: "Destination Country",
      status: "checked",
      description: "Country of arrival",
      category: "Routing",
    },
    {
      id: "destination_port",
      label: "Destination Port/Airport",
      status: "pending",
      description: "Arrival port or airport",
      category: "Routing",
    },
    {
      id: "incoterm",
      label: "Incoterm",
      status: "pending",
      description: "FOB, CIF, DAP, etc.",
      category: "Terms",
    },
    {
      id: "estimated_ship_date",
      label: "Ship Date",
      status: "pending",
      description: "When do you want to ship?",
      category: "Timeline",
    },
    {
      id: "total_weight_kg",
      label: "Total Weight",
      status: "pending",
      description: "Weight in kilograms",
      category: "Cargo Details",
    },
    {
      id: "volume_m3",
      label: "Volume",
      status: "pending",
      description: "Volume in cubic meters",
      category: "Cargo Details",
    },
    {
      id: "goods_description",
      label: "Goods Description",
      status: "pending",
      description: "What are you shipping?",
      category: "Cargo Details",
    },
    {
      id: "contact_name",
      label: "Contact Name",
      status: "pending",
      description: "Your full name",
      category: "Contact Info",
    },
    {
      id: "contact_email",
      label: "Email Address",
      status: "pending",
      description: "For quote delivery",
      category: "Contact Info",
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Thank you! Let me update your shipment details and continue with the next requirement...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const completedCount = requiredFields.filter(
    (field) => field.status === "checked"
  ).length;
  const totalCount = requiredFields.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  // Group fields by category
  const fieldsByCategory = requiredFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, RequiredField[]>);

  const getTransportIcon = () => {
    // This would be dynamic based on selected transport type
    return <Ship className="w-4 h-4 text-white" />;
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Chat Interface - Left Side */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-zinc-900/50 border-b border-zinc-800  backdrop-blur-sm">
          <div className="Z  text-white p-6 ">
            <div className="mb-4 flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full">
                <Image
                  src={agent.image || "/placeholder.svg"}
                  alt={agent.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">Listing Agent</p>
              </div>
            </div>
            <div className=" space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{agent.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{agent.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[85%] ${
                    message.role === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user"
                        ? "bg-white text-black"
                        : "bg-gradient-to-r from-blue-600 to-cyan-500"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Ship className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-white text-black ml-auto"
                          : "bg-zinc-800 text-white border border-zinc-700"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    <p
                      className={`text-xs px-2 ${
                        message.role === "user"
                          ? "text-right text-zinc-500"
                          : "text-zinc-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-zinc-900/50 border-t border-zinc-800 p-4 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your shipment requirements..."
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 pr-12 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <Button
                  onClick={handleSend}
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black hover:bg-zinc-200 rounded-lg h-8 w-8 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Required Fields Sidebar - Right Side */}
    </div>
  );
}
