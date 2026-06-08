"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineManager() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateNetworkStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);
    
    setIsOffline(!navigator.onLine);

    // 🚀 THE BULLETPROOF FIX:
    // Only register the service worker if we are running a production build.
    // This safely stops it from breaking your web page when running 'npm run dev'!
    if (
      typeof window !== "undefined" && 
      "serviceWorker" in navigator && 
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => {
          console.log("[PWA Success] Service worker active:", reg.scope);
        })
        .catch((err) => {
          console.error("[PWA Failure] Registration blocked:", err);
        });
    }

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold backdrop-blur-xl z-[9999] shadow-xl shadow-black/40 tracking-wide uppercase"
        >
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Offline Protocol Active — Viewing Local Cached Sandbox Vault</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}