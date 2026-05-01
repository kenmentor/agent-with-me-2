"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Play, Pause, X, ImageOff } from "lucide-react";
import Req from "@/app/utility/axios";

const { app, base } = Req;

const propertyCache = new Map<string, any>();

let currentPlayingAudio: HTMLAudioElement | null = null;

function stopAllAudio() {
  if (currentPlayingAudio) {
    currentPlayingAudio.pause();
    currentPlayingAudio.currentTime = 0;
    currentPlayingAudio = null;
  }
}

export function parseMessageTag(text: string): { type: string; value: string } | null {
  const propMatch = text.match(/\{\{property:(\w+)\}\}/);
  if (propMatch) return { type: "property", value: propMatch[1] };
  const audioMatch = text.match(/\{\{audio:(.+?)\}\}/);
  if (audioMatch) return { type: "audio", value: audioMatch[1] };
  const imageMatch = text.match(/\{\{image:(.+?)\}\}/);
  if (imageMatch) return { type: "image", value: imageMatch[1] };
  return null;
}

function PropertyMessageCard({ propertyId }: { propertyId: string }) {
  const [prop, setProp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propertyCache.has(propertyId)) {
      setProp(propertyCache.get(propertyId));
      setLoading(false);
      return;
    }

    app.get(`${base}/v1/house/detail/${propertyId}`)
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          propertyCache.set(propertyId, data);
          setProp(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading || !prop) {
    return (
      <div className="rounded-2xl overflow-hidden bg-gray-100 w-52 animate-pulse">
        <div className="h-24 bg-gray-200" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <Link href={`/properties/${prop._id}`} className="block">
      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white hover:shadow-md transition-shadow">
        {prop.thumbnail || prop.images?.[0]?.url ? (
          <div className="relative w-52 h-24 bg-gray-100">
            <Image src={prop.thumbnail || prop.images[0].url} alt={prop.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-52 h-24 bg-gray-100 flex items-center justify-center">
            <Bed className="h-8 w-8 text-gray-300" />
          </div>
        )}
        <div className="p-2.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{prop.title}</p>
          <p className="text-xs text-blue-600 font-medium">₦{prop.price?.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {prop.bedrooms && <Bed className="h-3 w-3 text-gray-400" />}
            <span className="text-xs text-gray-500">
              {prop.bedrooms} bd{prop.bedrooms !== 1 ? "s" : ""}
              {prop.bathrooms && ` · ${prop.bathrooms} ba${prop.bathrooms !== 1 ? "ths" : ""}`}
            </span>
          </div>
          {(prop.lga || prop.state) && (
            <p className="text-xs text-gray-400 truncate mt-0.5">
              <MapPin className="h-3 w-3 inline mr-0.5 -mt-0.5" />
              {prop.lga}{prop.state ? `, ${prop.state}` : ""}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function AudioMessageCard({ url, isOwn }: { url: string; isOwn: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [animFrame, setAnimFrame] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animRef = useRef<number>(0);
  const barCount = 40;

  useEffect(() => {
    const audio = new Audio();
    audio.src = url;
    audio.preload = "metadata";
    audioRef.current = audio;

    const onLoaded = () => {
      setDuration(audio.duration);
      setLoaded(true);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
      currentPlayingAudio = null;
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      cancelAnimationFrame(animRef.current);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [url]);

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(animRef.current);
      return;
    }
    const tick = () => {
      setAnimFrame((f) => f + 1);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  const togglePlay = () => {
    if (!audioRef.current || !loaded) return;
    if (playing) {
      audioRef.current.pause();
      currentPlayingAudio = null;
    } else {
      stopAllAudio();
      currentPlayingAudio = audioRef.current;
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = percent * duration;
    setCurrentTime(percent * duration);
  };

  const progress = duration ? currentTime / duration : 0;
  const windowOffset = progress * barCount;
  const activeColor = isOwn ? "bg-black" : "bg-white";
  const dimColor = isOwn ? "bg-gray-300" : "bg-gray-600";

  const bars = Array.from({ length: barCount }, (_, i) => {
    const distanceFromWindow = Math.abs(i - windowOffset);
    const isActive = i <= windowOffset;
    const nearWindow = Math.max(0, 1 - distanceFromWindow / 12);

    const staticHeight = 15 + Math.sin(i * 0.35 + 1.2) * 12 + Math.cos(i * 0.25) * 8;
    const dynamicWave = playing
      ? Math.sin(i * 0.4 + animFrame * 0.08) * 10 * nearWindow
      : 0;
    const pulse = playing && isActive ? Math.sin(i * 0.6 + animFrame * 0.05) * 5 * (1 - i / barCount) : 0;

    const height = Math.max(4, staticHeight + dynamicWave + pulse);

    const opacity = isActive ? (isOwn ? 1 : 1) : (isOwn ? 0.35 : 0.3);

    return (
      <div
        key={i}
        className={`w-[3px] rounded-full ${isActive ? activeColor : dimColor}`}
        style={{
          height: `${height}%`,
          minHeight: "4px",
          opacity,
          transition: "height 60ms ease-out",
        }}
      />
    );
  });

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[240px] max-w-[300px] ${
        isOwn ? "bg-white text-gray-900 rounded-br-md" : "bg-black text-white rounded-bl-md"
      }`}>
        <button
          onClick={togglePlay}
          disabled={!loaded}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            isOwn
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          {playing ? (
            <Pause className="h-4 w-4" fill="currentColor" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
          )}
        </button>
        <div className="flex-1" onClick={handleSeek}>
          <div className="flex items-center gap-[2px] h-10 overflow-hidden">
            {bars}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className={`text-[10px] font-medium ${isOwn ? "text-gray-400" : "text-gray-500"}`}>
              {formatTime(currentTime)}
            </span>
            <span className={`text-[10px] font-medium ${isOwn ? "text-gray-400" : "text-gray-500"}`}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageMessageCard({ url, isOwn }: { url: string; isOwn: boolean }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (error) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <div className="rounded-2xl bg-gray-100 px-4 py-3 flex items-center gap-2">
          <ImageOff className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">Failed to load image</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <button onClick={() => setExpanded(true)} className="block max-w-[240px]">
          <div className="rounded-2xl overflow-hidden shadow-sm bg-gray-100">
            <div className="relative w-56 h-40 bg-gray-100">
              {loading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
              <Image
                src={url}
                alt="Shared image"
                fill
                className={`object-cover transition-opacity ${loading ? "opacity-0" : "opacity-100"}`}
                onLoad={() => setLoading(false)}
                onError={() => setError(true)}
              />
            </div>
          </div>
        </button>
      </div>

      {expanded && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setExpanded(false)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X className="h-8 w-8" />
          </button>
          <img
            src={url}
            alt="Shared image"
            className="max-w-full max-h-[90vh] object-contain rounded-lg animate-in zoom-in-95 duration-200"
          />
        </div>
      )}
    </>
  );
}

export function MessageRenderer({ content, isOwn }: { content: string; isOwn: boolean }) {
  const tag = parseMessageTag(content);

  if (!tag) return null;

  switch (tag.type) {
    case "property":
      return <PropertyMessageCard propertyId={tag.value} />;
    case "audio":
      return <AudioMessageCard url={tag.value} isOwn={isOwn} />;
    case "image":
      return <ImageMessageCard url={tag.value} isOwn={isOwn} />;
    default:
      return null;
  }
}
