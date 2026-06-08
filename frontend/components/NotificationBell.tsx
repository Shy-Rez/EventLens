"use client";

import { useEffect, useState } from "react";
import { Bell, Heart, MessageCircle, AtSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Hardcoded for demo purposes to match our backend emitter
  const userId = "demo-user-id"; 

  useEffect(() => {
    // Connect to our Backend Server-Sent Events stream
    const eventSource = new EventSource(`https://eventlens-backend-cufi.onrender.com/api/notifications/stream/${userId}`);

    eventSource.onmessage = (event) => {
      try {
        const newNotification = JSON.parse(event.data);
        // Only add to dropdown list (No toasts here!)
        setNotifications((prev) => [newNotification, ...prev]);
      } catch (err) {
        console.error("Error parsing bell notification:", err);
      }
    };

    return () => eventSource.close();
  }, []);

  const getIcon = (type: string) => {
    if (type === "LIKE") return <Heart className="w-4 h-4 text-red-400 fill-red-400" />;
    if (type === "COMMENT") return <MessageCircle className="w-4 h-4 text-blue-400 fill-blue-400" />;
    if (type === "TAG") return <AtSign className="w-4 h-4 text-purple-400" />;
    return <Bell className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="relative">
      
      {/* The Bell Icon */}
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
      >
        <Bell className="w-5 h-5 text-gray-300" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#111]" />
        )}
      </button>

      {/* The Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-4 w-80 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              {notifications.length > 0 && (
                <button onClick={() => setNotifications([])} className="text-xs text-blue-400 hover:text-blue-300">
                  Clear All
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No new notifications</div>
              ) : (
                notifications.map((notif, idx) => (
                  <div key={idx} className="p-4 border-b border-white/5 hover:bg-white/5 transition cursor-pointer flex items-start space-x-3">
                    <div className="mt-1 bg-white/10 p-1.5 rounded-full">{getIcon(notif.type)}</div>
                    <div>
                      <p className="text-sm text-gray-200">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt || Date.now()).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}