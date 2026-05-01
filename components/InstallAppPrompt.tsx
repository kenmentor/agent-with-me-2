"use client";
import { useEffect, useState } from "react";

export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowModal(true), 800);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowModal(false);
    }
    setDeferredPrompt(null);
  };

  const handleSkip = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/30 px-4 pb-4 sm:pb-0">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-lg w-full max-w-sm overflow-hidden animate-slide-up">
        <div className="p-5 pb-2 flex items-start gap-4">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 45.396 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="M0 0L17.9781 5.93773L18.3963 60L0 53.9894L0 0Z" fill="#2563eb" fillRule="evenodd" transform="translate(27 0)" />
                <path d="M0 5.80534L12.975 0L12.975 53.9767L0 59L0 5.80534Z" fill="#2563eb" fillOpacity="0.7" fillRule="evenodd" transform="translate(14.35 0)" />
                <path d="M0 0L14.7218 4.49413L15.0642 45.4126L0 40.8633L0 0Z" fill="#2563eb" fillRule="evenodd" transform="translate(9.181 7.587)" />
                <path d="M0 4.32941L9.23646 0L9.23645 40.6186L0 44L0 4.32941Z" fill="#2563eb" fillOpacity="0.7" fillRule="evenodd" transform="translate(0 7.587)" />
              </g>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Install AgentWithMe
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add this app to your home screen for quick access and a better experience.
            </p>
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-700" />

        <div className="p-2">
          <button
            onClick={handleInstall}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
          >
            <span className="text-blue-600 text-sm font-medium">Install app</span>
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            onClick={handleSkip}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-gray-600 dark:text-gray-400 text-sm">Not now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
