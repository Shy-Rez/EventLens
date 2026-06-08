"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Folder, Calendar, Image as ImageIcon, Loader2, ArrowRight, Tag } from "lucide-react";

export default function EventGrid() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname(); // Detects if we are in /uploads or /albums!

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("https://eventlens-backend-cufi.onrender.com/api/events");
        const data = await res.json();
        if (data.success) {
          // Sort events so the newest ones appear first
          const sortedEvents = data.events.sort((a: any, b: any) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setEvents(sortedEvents);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="border-2 border-dashed border-white/10 rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-white/5">
        <Folder className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Events Found</h3>
        <p className="text-gray-400 max-w-sm">
          There are no events available yet. Ask an admin to create a new event from the Dashboard!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {events.map((event, i) => {
        // Calculate the total number of media items across all sub-albums
        const totalMedia = event.albums?.reduce((acc: number, album: any) => acc + (album.media?.length || 0), 0) || 0;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            // Dynamically route to either /uploads/123 or /albums/123 based on where the user clicked!
            onClick={() => router.push(`${pathname}/${event.id}`)}
            className="group cursor-pointer bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 flex flex-col"
          >
            {/* Banner Image / Gradient Fallback */}
            <div className="h-40 bg-gradient-to-br from-blue-900/40 to-purple-900/40 relative overflow-hidden border-b border-white/5">
              {event.coverImage && (
                <img 
                  src={event.coverImage} 
                  alt={event.name} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" 
                />
              )}
              {/* Dark gradient to make text readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-80" />
              
              {/* Floating Folder Icon */}
              <div className="absolute bottom-4 left-4 p-2.5 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 text-blue-400 group-hover:text-purple-400 group-hover:scale-110 transition-all">
                <Folder className="w-5 h-5" />
              </div>
            </div>

            {/* Event Info Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-3 truncate group-hover:text-blue-400 transition-colors">
                  {event.name}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                    <Calendar className="w-3 h-3 text-blue-400" /> 
                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                    <Tag className="w-3 h-3 text-purple-400" />
                    {event.category || "General"}
                  </span>
                </div>
              </div>

              {/* Bottom Footer (Item Count & Action) */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full">
                  <ImageIcon className="w-4 h-4" /> {totalMedia} {totalMedia === 1 ? 'Item' : 'Items'}
                </span>
                <span className="text-sm font-bold text-blue-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                  {pathname.includes('/uploads') ? "Open Studio" : "View Gallery"} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}