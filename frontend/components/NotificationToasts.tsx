"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, Tag, X, Bell } from "lucide-react";

export default function NotificationToasts() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Connect to the real-time SSE stream on your backend
    const eventSource = new EventSource(`https://eventlens-backend-cufi.onrender.com/api/notifications/stream/demo-user-id`);

    eventSource.onmessage = (event) => {
      try {
        const newNotif = JSON.parse(event.data);
        const localId = Date.now() + Math.random(); // Unique ID for the UI
        
        // Add to the screen
        setNotifications((prev) => [...prev, { ...newNotif, localId }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.localId !== localId));
        }, 5000);
      } catch (err) {
        console.error("Error parsing toast notification:", err);
      }
    };

    return () => eventSource.close();
  }, []);

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.localId !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "LIKE": return <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />;
      case "COMMENT": return <MessageSquare className="w-5 h-5 text-blue-400 fill-blue-400/20" />;
      case "TAG": return <Tag className="w-5 h-5 text-purple-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.localId}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="w-80 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50 flex items-start gap-4 pointer-events-auto"
          >
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              {getIcon(notif.type)}
            </div>
            
            <div className="flex-1 mt-0.5">
              <p className="text-sm text-white font-medium">{notif.message}</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">Just now</p>
            </div>

            <button 
              onClick={() => removeNotification(notif.localId)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}