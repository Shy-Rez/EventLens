"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, ImageIcon, ImageOff } from "lucide-react";
import MediaModal from "./MediaModal"; // <-- Modal Import

interface MediaItem {
  id: string;
  url: string;
  type: string;
  createdAt: string;
  tags: string[]; 
}

export default function MediaGallery({ eventId }: { eventId: string }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State to track which image was clicked
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Fetch the media when the component loads
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(`https://eventlens-backend-cufi.onrender.com/api/events/${eventId}/media`);
        const data = await response.json();
        if (data.success) {
          setMedia(data.media);
        }
      } catch (error) {
        console.error("Failed to fetch media:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [eventId]);

  // --- AI SEARCH LOGIC ---
  const filteredMedia = media.filter((item) => {
    if (!searchQuery) return true; 
    
    const lowerQuery = searchQuery.toLowerCase();
    
    const matchesTags = item.tags && item.tags.some(tag => 
      tag.toLowerCase().includes(lowerQuery)
    );

    return matchesTags;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-blue-500" />
          Event Gallery
        </h2>

        {/* --- THE AI SEARCH BAR --- */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search AI tags (e.g. 'crowd', 'laptop', 'dog')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all duration-300"
          />
        </div>
      </div>

      {/* Empty State / No Results */}
      {filteredMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/5 border border-white/10 rounded-2xl border-dashed">
          <ImageOff className="w-12 h-12 text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-400">No media found</h3>
          {searchQuery && (
            <p className="text-gray-500 mt-2">No AI tags matched "{searchQuery}"</p>
          )}
        </div>
      ) : (
        /* The Masonry Grid */
        <motion.div layout className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          <AnimatePresence>
            {filteredMedia.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                onClick={() => setSelectedMedia(item)} // <-- FIX 1: Added onClick to open modal
                className="cursor-pointer relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 break-inside-avoid" // <-- FIX 2: Added cursor-pointer
              >
                {item.type === "VIDEO" ? (
                  <video src={item.url} controls className="w-full h-auto object-cover" />
                ) : (
                  <img src={item.url} alt="Event upload" className="w-full h-auto object-cover" />
                )}

                {/* Hover Overlay with AI Tag Pills */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  
                  {/* Display AI Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {item.tags.slice(0, 3).map((tag, i) => ( 
                        <span key={i} className="px-2 py-1 bg-blue-500/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-xs text-white/60 font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* FIX 3: Render the Social Engine Modal at the bottom */}
      <MediaModal 
        media={selectedMedia} 
        isOpen={!!selectedMedia} 
        onClose={() => setSelectedMedia(null)} 
      />
    </div>
  );
}