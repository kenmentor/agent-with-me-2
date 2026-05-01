"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send, Loader2, Phone, Mail, MapPin, Bed, Mic, Image as ImageIcon, X, Square } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useChatStore, ChatMessage } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axios";
import { format, isToday, isYesterday } from "date-fns";
import { initializeSocket, disconnectSocket, emitEvent, onEvent, offEvent, getSocket, onReconnect, offReconnect } from "@/app/utility/socket";
import { ChatConversationSkeleton } from "@/components/ui/skeleton";
import { getDisplayName, getFirstName } from "@/lib/utils";
import { MessageRenderer, parseMessageTag } from "@/components/MessageRenderer";

const { base, app } = Req;

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const houseId = params.houseId as string;
  
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
  const [participant, setParticipant] = useState<{_id: string; userName: string; firstName?: string; lastName?: string; avatar?: string} | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(40).fill(4));
  const [animFrame, setAnimFrame] = useState(0);
  const [property, setProperty] = useState<{_id: string; title: string; price: number; thumbnail?: string; images?: {url: string}[]; type?: string; state?: string; lga?: string; bedrooms?: number; bathrooms?: number} | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProperty = useCallback(async () => {
    if (!houseId) return;
    try {
      const res = await app.get(`${base}/v1/house/detail/${houseId}`);
      const data = res.data?.data;
      if (data) setProperty(data);
    } catch (err) {
      console.error("Error fetching property:", err);
    }
  }, [houseId]);

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
    fetchProperty();
    
    return () => {
      emitEvent("leave_conversation", { conversationId: userId });
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [_hasHydrated, isAuthenticated, user, router, userId]);

  useEffect(() => {
    const handleReconnect = () => {
      console.log("Chat conversation [houseId]: socket reconnected, rejoin conversation and refetch messages");
      emitEvent("join_conversation", { conversationId: userId });
      fetchMessages();
    };

    onReconnect(handleReconnect);

    return () => {
      offReconnect(handleReconnect);
    };
  }, [userId, fetchMessages]);

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

    if (/\{\{property:\w+\}\}/.test(newMessage.trim())) {
      return;
    }
    
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

  const sendTagMessage = async (tag: string) => {
    if (!user?._id || !userId) return;
    
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: user._id,
      receiverId: userId,
      content: tag,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setMessages((prev) => [...prev, tempMessage]);
    setSending(true);
    
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("send_message", {
        receiverId: userId,
        content: tag,
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
          content: tag,
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
      } finally {
        setSending(false);
      }
    }
  };

  const handleMediaUpload = async (file: File, mediaType: "audio" | "image") => {
    if (!file || uploading) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", mediaType);
    
    try {
      const res = await app.post(`${base}/v1/chat/upload-media`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const { url, type } = res.data?.data || {};
      if (url) {
        const tag = type === "audio" ? `{{audio:${url}}}` : `{{image:${url}}}`;
        await sendTagMessage(tag);
      }
    } catch (err) {
      console.error("Error uploading media:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleMediaUpload(file, "image");
    }
    e.target.value = "";
  };

  const toggleRecording = async () => {
    if (recording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/ogg")
          ? "audio/ogg"
          : "";

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevels = () => {
        analyser.getByteFrequencyData(dataArray);
        const windowPos = (Date.now() * 0.002) % 40;
        const levels = Array.from({ length: 40 }, (_, i) => {
          const index = Math.floor((i / 40) * bufferLength);
          const raw = dataArray[index] / 255;
          const distanceFromWindow = Math.abs(i - windowPos);
          const windowIntensity = Math.max(0, 1 - distanceFromWindow / 14);
          const base = Math.max(4, raw * 100);
          const wave = Math.sin(i * 0.4 + Date.now() * 0.006) * 15 * windowIntensity;
          return base + wave;
        });
        setAudioLevels(levels);
        setAnimFrame((f) => f + 1);
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/mp3" });
        const ext = mimeType.includes("webm") ? "webm" : mimeType.includes("ogg") ? "ogg" : "mp3";
        const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: blob.type });
        await handleMediaUpload(file, "audio");
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setRecording(false);
    setRecordingTime(0);
    setAudioLevels(new Array(40).fill(4));
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const imageInputRef = useRef<HTMLInputElement>(null);

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
            {getFirstName(participant)?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h2 className="text-white font-semibold">{getDisplayName(participant) || "Chat"}</h2>
          <p className="text-gray-400 text-xs">Tap to view profile</p>
        </div>
      </header>

      {property && (
        <Link href={`/properties/${property._id}`}>
          <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 flex-shrink-0 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-200 relative">
                {property.thumbnail || property.images?.[0]?.url ? (
                  <Image
                    src={property.thumbnail || property.images![0].url}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Bed className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{property.title}</p>
                <p className="text-xs text-blue-600 font-medium">₦{property.price?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Link>
      )}

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
                    const msgContent = (message as any).text || message.content;
                    const tag = parseMessageTag(msgContent);

                    if (tag) {
                      return <MessageRenderer key={message.id} content={msgContent} isOwn={isOwnMessage} />;
                    }

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
                          <p className="text-sm whitespace-pre-wrap">{msgContent}</p>
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

      <div className="p-3 pb-[40px] sm:p-4 bg-white border-t border-gray-200 safe-area-bottom">
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {recording && (
          <div className="mb-3 px-2">
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex items-center gap-[2px] flex-1 h-8 overflow-hidden">
                {audioLevels.map((level, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-red-500"
                    style={{
                      height: `${Math.max(4, Math.min(100, level))}%`,
                      minHeight: "4px",
                      opacity: 0.3 + Math.min(0.7, level / 80),
                      transition: "height 60ms ease-out, opacity 60ms ease-out",
                    }}
                  />
                ))}
              </div>
              <span className="text-sm font-mono font-medium text-red-500 flex-shrink-0">{formatRecordingTime(recordingTime)}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={stopRecording}
                className="h-8 px-2 text-xs text-gray-500 hover:text-red-500 flex-shrink-0"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex gap-1 pb-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading || sending || recording}
              className="h-10 w-10 rounded-full text-gray-500 hover:text-black hover:bg-gray-100"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={toggleRecording}
              disabled={uploading || sending}
              className={`h-10 w-10 rounded-full transition-colors ${
                recording
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "text-gray-500 hover:text-black hover:bg-gray-100"
              }`}
            >
              {recording ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
            </Button>
          </div>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef as any}
              placeholder={recording ? "Recording..." : "Type a message..."}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyPress}
              disabled={sending || recording}
              rows={1}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 max-h-32"
              style={{ minHeight: '48px' }}
            />
          </div>
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending || recording}
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
