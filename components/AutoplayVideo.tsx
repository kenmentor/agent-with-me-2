"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, X, LoaderPinwheel } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // To hold natural video aspect ratio
  const [videoAspect, setVideoAspect] = useState<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.videoWidth && video.videoHeight) {
        const aspect = video.videoWidth / video.videoHeight;
        setVideoAspect(aspect);
      }
    };

    const updateProgress = () => {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent || 0);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", updateProgress);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = time;
    setProgress(parseFloat(e.target.value));
  };

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => togglePlay(), 400);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
  };

  if (!src) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center text-white rounded-xl">
        <LoaderPinwheel className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* 🎞️ Thumbnail preview */}
      <div
        onClick={openModal}
        className="relative w-full max-w-4xl mx-auto aspect-[9/16] sm:aspect-video overflow-hidden rounded-2xl shadow-xl cursor-pointer group"
      >
        <video
          src={src}
          poster={poster}
          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition"
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="bg-white/20 backdrop-blur-lg p-5 rounded-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <Play className="w-10 h-10 text-white" />
          </motion.div>
        </div>
      </div>

      {/* 🎬 Fullscreen Modal Player */}
      {/* 🎬 Fullscreen Modal Player */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white z-50 transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Responsive video container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative flex items-center justify-center w-full h-screen"
            >
              <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="max-h-screen max-w-full object-contain mx-auto"
                playsInline
                muted={isMuted}
                preload="metadata"
              />

              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 flex flex-col gap-2">
                <input
                  type="range"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1 accent-blue-500 cursor-pointer"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white" />
                      )}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
