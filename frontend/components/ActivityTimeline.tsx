"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Image as ImageIcon, Video, User, Star, Loader2 } from "lucide-react";

// Matches the data structure we built in the Express backend
interface Activity {
  id: string | number;
  type: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  previewUrl?: string;
}

export default function ActivityTimelineTab() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Fetching from your local backend
        const res = await fetch("http://localhost:5000/api/activity");
        const data = await res.json();
        
        if (data.success) {
          setActivities(data.activities);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
    
    // Optional: Set up a polling interval to auto-refresh every 10 seconds
    // const interval = setInterval(fetchActivities, 10000);
    // return () => clearInterval(interval);
  }, []);

  // Helper to format timestamps nicely
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
    });
  };

  // Helper to pick the right icon based on activity type
  const getIcon = (type: string) => {
    if (type === 'VIDEO_UPLOAD') return <Video className="w-5 h-5 text-purple-400" />;
    if (type === 'PHOTO_UPLOAD') return <ImageIcon className="w-5 h-5 text-blue-400" />;
    if (type === 'USER_JOINED') return <User className="w-5 h-5 text-green-400" />;
    return <Star className="w-5 h-5 text-yellow-400" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p>Loading timeline...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
      <div className="flex items-center space-x-3 mb-8">
        <Clock className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Platform Activity</h2>
      </div>

      {activities.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No recent activity found. Start uploading media!</p>
        </div>
      ) : (
        <div className="relative border-l border-white/10 ml-4 space-y-8 pb-4">
          <AnimatePresence>
            {activities.map((activity, idx) => (
              <motion.div
                key={activity.id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-8"
              >
                {/* The Timeline Node (Icon) */}
                <div className="absolute -left-[20px] top-1 bg-[#121212] p-2 rounded-full border border-white/10 shadow-lg">
                  {getIcon(activity.type)}
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-gray-300">
                      <span className="font-semibold text-white">{activity.user}</span>{' '}
                      {activity.action}{' '}
                      <span className="font-medium text-blue-400">{activity.target}</span>
                    </p>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>

                  {/* If the activity has a preview image (like an upload), show a thumbnail! */}
                  {activity.previewUrl && (
                    <div className="mt-4 rounded-xl overflow-hidden h-32 w-48 relative border border-white/10">
                      <img 
                        src={activity.previewUrl} 
                        alt="Activity preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}