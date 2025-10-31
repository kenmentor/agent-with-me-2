"use client";

import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

export default function UserAvatar() {
  const user = useAuthStore((state) => state.user);
  const [blurData, setBlurData] = useState<string | undefined>();

  // Generate blur placeholder dynamically if avatar exists
  useEffect(() => {
    async function generateBlur() {
      if (!user?.avater) return;
      try {
        const res = await fetch(
          `/api/blur?url=${encodeURIComponent(user.avater)}`
        );
        const data = await res.json();
        setBlurData(data.blurDataURL);
      } catch (err) {
        console.error("Failed to load blur preview:", err);
      }
    }
    generateBlur();
  }, [user?.avater]);

  if (!user) return null; // safety check

  const avatarUrl = user?.avater;
  const initials = user?.userName?.[0]?.toUpperCase() || "?";

  return (
    <div className="relative flex items-center justify-center size-[40px]">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`${user.userName}'s Avatar`}
          width={40}
          height={40}
          quality={80}
          placeholder={blurData ? "blur" : "empty"}
          blurDataURL={blurData}
          className="rounded-full border border-white/20 object-cover transition-all duration-500"
        />
      ) : (
        <div className="flex items-center justify-center rounded-full border border-white/20 bg-neutral-800 text-white font-medium size-[40px] select-none">
          {initials}
        </div>
      )}
    </div>
  );
}
