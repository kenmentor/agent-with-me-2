"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Play, Pause, X, ImageOff } from "lucide-react";
import Req from "@/app/utility/axios";

const { app, base } = Req;

const propertyCache = new Map<string, any>();

export function parseMessageTag(text: string): { type: string; value: string } | null {
  const propMatch = text.match(/\{\{property:(\w+)\}\}/);
  if (propMatch) return { type: "property", value: propMatch[1] };
  const audioMatch = text.match(/\{\{audio:(https?:\/\/[^\}]+)\}\}/);
  if (audioMatch) return { type: "audio", value: audioMatch[1] };
  const imageMatch = text.match(/\{\{image:(https?:\/\/[^\}]+)\}\}/);
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
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.addEventListener("ended", () => setPlaying(false));
    audio.addEventListener("timeupdate", () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    });
    return () => {
      audio.pause();
      audio.removeEventListener("ended", () => setPlaying(false));
      audio.removeEventListener("timeupdate", () => {});
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[200px] max-w-[260px] ${
        isOwn ? "bg-white text-gray-900 rounded-br-md" : "bg-black text-white rounded-bl-md"
      }`}>
        <button onClick={togglePlay} className="flex-shrink-0">
          {playing ? (
            <Pause className={`h-5 w-5 ${isOwn ? "text-black" : "text-white"}`} />
          ) : (
            <Play className={`h-5 w-5 ${isOwn ? "text-black" : "text-white"}`} fill="currentColor" />
          )}
        </button>
        <div className="flex-1">
          <div className={`h-1.5 rounded-full overflow-hidden ${isOwn ? "bg-gray-200" : "bg-gray-700"}`}>
            <div
              className={`h-full rounded-full transition-all duration-150 ${isOwn ? "bg-black" : "bg-white"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={`text-xs mt-1 ${isOwn ? "text-gray-500" : "text-gray-400"}`}>Voice message</p>
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
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setExpanded(false)}>
          <button className="absolute top-4 right-4 text-white">
            <X className="h-8 w-8" />
          </button>
          <Image
            src={url}
            alt="Shared image"
            width={800}
            height={600}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
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
