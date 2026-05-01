"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2, Check, CheckCheck, Mic, Image as ImageIcon, Square, Trash2, Play, Pause } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Req from "@/app/utility/axois";
import { format, isToday, isYesterday } from "date-fns";
import {
  initializeSocket,
  disconnectSocket,
  onEvent,
  offEvent,
  sendMessage as socketSendMessage,
  startTyping,
  stopTyping,
  isSocketConnected,
  onReconnect,
  offReconnect,
  onDeliveryReceipt,
  offDeliveryReceipt,
  onReadReceipt,
  offReadReceipt,
  queueMessage,
  emitEvent
} from "@/app/utility/socket";
import { ChatConversationSkeleton } from "@/components/ui/skeleton";
import { getDisplayName, getFirstName } from "@/lib/utils";
import api, { baseURL } from "@/lib/api";
import { toast } from "sonner";
import { MessageRenderer, parseMessageTag } from "@/components/MessageRenderer";
import { useLongPress } from "@/hooks/useLongPress";

const base = baseURL;
const app = api;

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  timestamp?: string;
  read: boolean;
  delivered?: boolean;
  status?: "sending" | "sent" | "delivered" | "read" | "failed" | "queued";
}

interface MessageItemProps {
  msg: Message;
  userId: string;
  onLongPress: (messageId: string, e: React.MouseEvent | React.TouchEvent | null) => void;
  formatTime: (date: string) => string;
}

function MessageItem({ msg, userId, onLongPress, formatTime }: MessageItemProps) {
  const isOwn = msg.senderId === userId;
  const tag = parseMessageTag(msg.content);
  const isWithinHour = new Date(msg.timestamp || msg.createdAt) > new Date(Date.now() - 3600000);

  const longPress = useLongPress({
    onLongPress: () => {
      if (isOwn && isWithinHour) {
        onLongPress(msg._id, null);
      }
    },
  });

  const canDelete = isOwn && isWithinHour;
  const handlers = canDelete ? longPress.handlers : {};
  const deleteClasses = canDelete ? "cursor-pointer select-none" : "";

  if (tag) {
    return (
      <div key={msg._id} {...handlers} className={deleteClasses}>
        <MessageRenderer content={msg.content} isOwn={isOwn} />
      </div>
    );
  }

  return (
    <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`} {...handlers}>
      <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
        isOwn && isWithinHour
          ? "bg-black text-white rounded-br-md cursor-pointer select-none"
          : isOwn
            ? "bg-black text-white rounded-br-md"
            : "bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm"
      }`}>
        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
        <p className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? "text-gray-400" : "text-gray-500"}`}>
          {formatTime(msg.timestamp || msg.createdAt)}
          {isOwn && (
            <span className="flex items-center">
              {msg.status === "sending" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : msg.status === "failed" ? (
                <span className="text-red-500 text-xs">Failed</span>
              ) : msg.status === "queued" ? (
                <span className="text-yellow-500 text-xs">Queued</span>
              ) : msg.read ? (
                <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
              ) : msg.delivered || msg.status === "delivered" ? (
                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const receiverId = params.userId as string;

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const getUserId = useAuthStore((state) => state.getUserId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [participant, setParticipant] = useState<{_id: string; userName: string; firstName?: string; lastName?: string} | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(40).fill(4));
  const [recordingPreview, setRecordingPreview] = useState<{ url: string; blob: Blob; duration: number } | null>(null);
  const [deleteMenu, setDeleteMenu] = useState<{ messageId: string; x: number; y: number } | null>(null);
  const hasMarkedRead = useRef(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedMsgIds = useRef<Set<string>>(new Set());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const markMessagesAsRead = async () => {
    const userId = getUserId();
    console.log("📖 markMessagesAsRead called:", { userId, conversationId, receiverId, hasMarkedRead: hasMarkedRead.current });
    if (!userId || hasMarkedRead.current) {
      console.log("📖 Skipping mark as read:", { noUserId: !userId, alreadyMarked: hasMarkedRead.current });
      return;
    }

    // Only mark as read messages from the other person (not our sent messages)
    const unreadMessages = messages.filter(m => m.senderId !== userId && !m.read);
    console.log("📖 Unread messages to mark:", unreadMessages.length);

    if (unreadMessages.length === 0) {
      console.log("📖 No unread messages, skipping");
      hasMarkedRead.current = true;
      return;
    }

    try {
      hasMarkedRead.current = true;
      const res = await app.put(`${base}/v1/chat/read`, {
        conversationId: conversationId || null,
        userId,
        otherUserId: receiverId
      });
      console.log("✅ Mark as read response:", res.data);

      // Only mark messages from receiver as read
      setMessages(prev => prev.map(m => 
        m.senderId !== userId ? { ...m, read: true } : m
      ));
    } catch (err: any) {
      console.error("❌ Failed to mark as read:", err);
      console.error("❌ Response:", err.response?.data);
      hasMarkedRead.current = false;
    }
  };

  useEffect(() => {
    if (!_hasHydrated) {
      return;
    }
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const userId = useAuthStore.getState().getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    if (receiverId?.toString() === userId?.toString()) {
      toast.error("You can't chat with yourself");
      router.push("/chat");
      return;
    }

    // Fetch messages via REST - always works
    const loadMessages = async () => {
      try {
        setLoading(true);
        const res = await app.get(`${base}/v1/chat/${userId}/${receiverId}`);
        const data = res.data?.data;
        
        if (data) {
          setMessages(data.messages || []);
          setParticipant(data.participant || { _id: receiverId, userName: "User" });
          if (data.conversationId) {
            setConversationId(data.conversationId);
          }
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([]);
        setParticipant({ _id: receiverId, userName: "User" });
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [_hasHydrated, isAuthenticated, router, receiverId, base]);

  const fetchMessages = async (userId: string) => {
    try {
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log("⏱️ Fetch timeout - stopping loading");
        setLoading(false);
      }, 15000); // 15 second timeout
      
      console.log("📋 Fetching messages for:", userId, receiverId);
      const res = await app.get(`${base}/v1/chat/${userId}/${receiverId}`);
      
      clearTimeout(timeoutId);
      
      const data = res.data?.data;
      console.log("📋 Response data:", data);
      
      if (data) {
        setMessages(data.messages || []);
        setParticipant(data.participant || { _id: receiverId, userName: "User" });
        
        console.log("📋 Setting conversationId:", data.conversationId);
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
      }
    } catch (err: any) {
      console.error("Error fetching messages:", err);
      console.error("Response:", err.response?.data);
      // Still show UI even if API fails
      setMessages([]);
      setParticipant({ _id: receiverId, userName: "User" });
    } finally {
      setLoading(false);
    }
  };

  // Still allow UI to show even without messages

  useEffect(() => {
    if (conversationId && messages.length > 0 && !loading) {
      markMessagesAsRead();
    }
  }, [conversationId, messages.length, loading]);

  useEffect(() => {
    const handleReconnect = () => {
      console.log("Chat conversation: socket reconnected, refetching messages");
      const userId = getUserId();
      if (userId) {
        fetchMessages(userId);
      }
    };

    onReconnect(handleReconnect);

    return () => {
      offReconnect(handleReconnect);
    };
  }, [getUserId]);

  useEffect(() => {
    const handleConnect = () => {
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleNewMessage = async (data: { message: any }) => {
      const userId = getUserId();
      const { message } = data;
      const msgId = message._id;
      
      if (!msgId || processedMsgIds.current.has(msgId)) return;
      processedMsgIds.current.add(msgId);
      
      setMessages((prev) => {
        if (prev.some((m) => m._id === msgId)) return prev;
        const tempExists = prev.find((m) => 
          m._id?.toString().startsWith("temp-") && 
          m.senderId === message.senderId && 
          m.content === message.content
        );
        if (tempExists) {
          return prev.map((m) => 
            m._id === tempExists._id ? { ...message, status: "sent" as const } : m
          );
        }
        return [...prev, { ...message, status: "sent" as const }];
      });
      
      if (message.senderId !== userId && message.conversationId) {
        try {
          emitEvent("message_ack", {
            messageId: message._id,
            conversationId: message.conversationId,
            status: "delivered"
          });
        } catch (err) {
          console.error("Failed to send ACK:", err);
        }
      }
      
      markMessagesAsRead();
      scrollToBottom();
    };

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === receiverId) {
        setIsTyping(data.isTyping);
      }
    };

    const handleMessageSent = (data: { success: boolean; message?: any }) => {
      if (data.success && data.message) {
        setSending(false);
        const serverMsg = data.message;
        const msgId = serverMsg._id;
        if (msgId) processedMsgIds.current.add(msgId);
        setMessages((prev) => {
          const tempMsg = prev.find((m) => m._id?.toString().startsWith("temp-"));
          if (!tempMsg) return prev;
          return prev.map((m) =>
            m._id === tempMsg._id ? { ...serverMsg, status: "sent" as const } : m
          );
        });
      }
    };

    const handleMessagesRead = (data: { conversationId: string; readBy: string; receiverId?: string }) => {
      if (data.readBy === receiverId || data.receiverId === receiverId) {
        setMessages(prev => prev.map(m => 
          m.senderId !== userId ? { ...m, read: true, status: "read" as const } : m
        ));
      }
    };

    const handleDeliveryReceipt = (data: { messageId?: string; conversationId: string; status: string; messages?: any[] }) => {
      if (data.messages && data.messages.length > 0) {
        setMessages(prev => prev.map(m => {
          const delivered = data?.messages?.some(dm => dm._id === m._id);
          return delivered ? { ...m, delivered: true, status: "delivered" as const } : m;
        }));
      } else if (data.messageId) {
        setMessages(prev => prev.map(m => 
          m._id === data.messageId ? { ...m, delivered: true, status: "delivered" as const } : m
        ));
      }
    };

    const handleReadReceipt = (data: { conversationId: string; status: string }) => {
      setMessages(prev => prev.map(m => ({ ...m, read: true, status: "read" as const })));
    };

    // Set initial connection status
    setSocketConnected(isSocketConnected());

    onEvent("connect", handleConnect);
    onEvent("disconnect", handleDisconnect);
    onEvent("new_message", handleNewMessage);
    onEvent("typing", handleTyping);
    onEvent("message_sent", handleMessageSent);
    onEvent("messages_read", handleMessagesRead);
    onDeliveryReceipt(handleDeliveryReceipt);
    onReadReceipt(handleReadReceipt);

    return () => {
      offEvent("connect", handleConnect);
      offEvent("disconnect", handleDisconnect);
      offEvent("new_message", handleNewMessage);
      offEvent("typing", handleTyping);
      offEvent("message_sent", handleMessageSent);
      offEvent("messages_read", handleMessagesRead);
      offDeliveryReceipt(handleDeliveryReceipt);
      offReadReceipt(handleReadReceipt);
    };
  }, [receiverId, getUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const userId = getUserId();
    if (!newMessage.trim() || !userId || sending) return;

    if (/\{\{property:\w+\}\}/.test(newMessage.trim())) {
      return;
    }

    const tempMsg = {
      _id: `temp-${Date.now()}`,
      senderId: userId,
      receiverId,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      read: false,
      status: "sending" as const,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");
    setSending(true);
    scrollToBottom();

    if (isSocketConnected()) {
      socketSendMessage(
        receiverId,
        newMessage.trim(),
        conversationId || undefined,
        () => {
          setSending(false);
        }
      );
    } else {
      queueMessage(receiverId, newMessage.trim(), conversationId || undefined);
      setMessages((prev) => prev.map((m) => 
        m._id === tempMsg._id ? { ...m, status: "queued" as const } : m
      ));
      setSending(false);
    }
  };

  const sendTagMessage = async (tag: string) => {
    const userId = getUserId();
    if (!userId || sending) return;

    const tempMsg = {
      _id: `temp-${Date.now()}`,
      senderId: userId,
      receiverId,
      content: tag,
      createdAt: new Date().toISOString(),
      read: false,
      status: "sending" as const,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setSending(true);
    scrollToBottom();

    if (isSocketConnected()) {
      socketSendMessage(
        receiverId,
        tag,
        conversationId || undefined,
        () => {
          setSending(false);
        }
      );
    } else {
      queueMessage(receiverId, tag, conversationId || undefined);
      setMessages((prev) => prev.map((m) =>
        m._id === tempMsg._id ? { ...m, status: "queued" as const } : m
      ));
      setSending(false);
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

  const startRecording = async () => {
    setRecordingPreview(null);
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
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      const startTime = Date.now();
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/mp3" });
        const url = URL.createObjectURL(blob);
        const duration = recordingTime || Math.round((Date.now() - startTime) / 1000);
        setRecordingPreview({ url, blob, duration });
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setPaused(false);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setPaused(true);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setPaused(false);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
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
    setPaused(false);
    setRecordingTime(0);
    setAudioLevels(new Array(40).fill(4));
  };

  const discardRecording = () => {
    setRecordingPreview(null);
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
    setPaused(false);
    setRecordingTime(0);
    setAudioLevels(new Array(40).fill(4));
  };

  const discardPreview = () => {
    if (recordingPreview?.url) {
      URL.revokeObjectURL(recordingPreview.url);
    }
    setRecordingPreview(null);
  };

  const sendVoiceNote = async () => {
    if (!recordingPreview) return;
    const { blob } = recordingPreview;
    const mimeType = blob.type || "audio/webm";
    const ext = mimeType.includes("webm") ? "webm" : mimeType.includes("ogg") ? "ogg" : "mp3";
    const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: mimeType });
    await handleMediaUpload(file, "audio");
    setRecordingPreview(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    const currentUserId = getUserId();
    if (!currentUserId) return;

    try {
      await app.delete(`${base}/v1/chat/message`, {
        data: { messageId, userId: currentUserId },
      });

      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      setDeleteMenu(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete message");
      setDeleteMenu(null);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLongPressItem = (messageId: string, e: React.MouseEvent | React.TouchEvent | null) => {
    const clientX = e ? ("touches" in e ? e.touches[0].clientX : e.clientX) : 0;
    const clientY = e ? ("touches" in e ? e.touches[0].clientY : e.clientY) : 0;
    setDeleteMenu({ messageId, x: clientX, y: clientY });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, "HH:mm");
    if (isYesterday(d)) return `Yesterday ${format(d, "HH:mm")}`;
    return format(d, "MMM d, HH:mm");
  };

  const userId = getUserId();

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
          <p className="text-gray-400 text-xs flex items-center gap-1">
            {socketConnected ? (
              <><span className="w-2 h-2 bg-green-500 rounded-full" /> Online</>
            ) : (
              <><span className="w-2 h-2 bg-gray-500 rounded-full" /> Connecting...</>
            )}
          </p>
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
            {messages.map((msg) => (
              <MessageItem
                key={msg._id}
                msg={msg}
                userId={userId}
                onLongPress={handleLongPressItem}
                formatTime={formatTime}
              />
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "150ms"}} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="p-3 pb-[40px] sm:p-4 bg-white border-t border-gray-200">
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {recording && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
            <div className="flex items-center gap-[2px] flex-1 h-8 overflow-hidden">
              {audioLevels.map((level, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-red-500"
                  style={{
                    height: `${Math.max(4, Math.min(100, level))}%`,
                    minHeight: "4px",
                    opacity: paused ? 0.2 : 0.3 + Math.min(0.7, level / 80),
                    transition: "height 60ms ease-out, opacity 60ms ease-out",
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-mono font-medium text-red-500 flex-shrink-0">{formatRecordingTime(recordingTime)}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={paused ? resumeRecording : pauseRecording}
              className="h-10 w-10 rounded-full flex-shrink-0 hover:bg-gray-100"
            >
              {paused ? <Play className="h-5 w-5 text-gray-600" /> : <Pause className="h-5 w-5 text-gray-600" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={discardRecording}
              className="h-10 w-10 rounded-full flex-shrink-0 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        )}

        {recordingPreview && (
          <div className="flex items-center gap-3 px-2">
            <audio src={recordingPreview.url} preload="metadata" className="hidden" id="preview-audio" />
            <button
              onClick={() => {
                const a = document.getElementById("preview-audio") as HTMLAudioElement;
                if (a?.paused) a.play();
                else if (a) a.pause();
              }}
              className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 hover:bg-gray-800 transition-colors"
            >
              <Play className="h-4 w-4 ml-0.5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Voice note</p>
              <p className="text-xs text-gray-400">{formatRecordingTime(recordingPreview.duration)}</p>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={discardPreview}
              className="h-10 w-10 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={sendVoiceNote}
              disabled={uploading}
              className="h-10 w-10 bg-black hover:bg-gray-800 rounded-full flex-shrink-0"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
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
          </div>
          <textarea
            placeholder={recording ? "Recording..." : "Type a message..."}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              startTyping(receiverId, receiverId);
              typingTimeoutRef.current = setTimeout(() => {
                stopTyping(receiverId, receiverId);
              }, 2000);
            }}
            onKeyDown={handleKeyPress}
            disabled={sending || recording}
            rows={1}
            className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50"
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
          <Button
            size="icon"
            onClick={recording ? stopRecording : newMessage.trim() ? handleSendMessage : startRecording}
            disabled={uploading || (sending && !recording)}
            className={`h-12 w-12 rounded-full flex-shrink-0 transition-all ${
              recording
                ? "bg-red-500 hover:bg-red-600 text-white"
                : newMessage.trim()
                  ? "bg-black hover:bg-gray-800 text-white"
                  : "bg-black hover:bg-gray-800 text-white"
            }`}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : recording ? (
              <Square className="h-5 w-5" />
            ) : newMessage.trim() ? (
              <Send className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {deleteMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDeleteMenu(null)} />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-150"
            style={{ top: deleteMenu.y - 10, left: Math.min(deleteMenu.x, typeof window !== "undefined" ? window.innerWidth - 160 : 300) }}
          >
            <button
              onClick={() => handleDeleteMessage(deleteMenu.messageId)}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 text-left"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
