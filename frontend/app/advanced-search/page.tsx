"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar, Tag, Image as ImageIcon, Loader2 } from "lucide-react";
import useRole from "@/hooks/useRole";
import MediaLightbox from "@/components/MediaLightbox";
import Sidebar from "@/components/Sidebar";

export default function AdvancedSearchPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  const { role, isMounted } = useRole();

  useEffect(() => {
    const fetchAllMedia = async () => {
      if (!role) return;

      try {
        setIsLoading(true);
        const res = await fetch(`https://eventlens-backend-cufi.onrender.com/api/events?role=${role.toUpperCase()}`);
        const data = await res.json();
        
        if (data.success) {
          const extractedMedia = data.events.flatMap((event: any) => 
            event.albums?.flatMap((album: any) => 
              (album.media || []).map((m: any) => ({
                ...m,
                eventName: event.name,
                eventDate: event.date
              }))
            ) || []
          ).filter(Boolean); 

          setMedia(extractedMedia);
        }
      } catch (error) {
        console.error("Search index failed to load:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllMedia();
  }, [role]);

  const filteredAndSortedMedia = media
    .filter(item => {
      if (!item) return false;
      if (searchQuery === "") return true;
      
      const query = searchQuery.toLowerCase();
      const tagsToSearch = item.aiTags || item.tags || [];
      const matchesTags = tagsToSearch.some((t: string) => t.toLowerCase().includes(query));
      const matchesEvent = item.eventName?.toLowerCase().includes(query);
      
      return matchesTags || matchesEvent;
    })
    .sort((a, b) => {
      if (sortBy === "eventName") {
        return (a.eventName || "").localeCompare(b.eventName || "");
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (!isMounted) return null;

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[#0a0a0a]">
        <div className="w-full max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

          <header className="relative z-10">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
              Advanced Media Search
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl">
              Search any media file by Event name, Tags, Upload date, and User name. 
            </p>
          </header>

          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-lg relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search via AI tags or event names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer"
                >
                  <option value="date">Sort by: Date Added</option>
                  <option value="eventName">Group by: Event Name</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
              <p>Indexing master database arrays & AI tags...</p>
            </div>
          ) : filteredAndSortedMedia.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
              <Tag className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No matching assets found</h3>
              <p className="text-gray-400 text-sm">Adjust your text query to broaden the AI semantic search scope.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-10">
              <AnimatePresence>
                {filteredAndSortedMedia.map((item) => {
                  const tags = item.aiTags || item.tags || [];
                  
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelectedMedia(item)}
                      className="relative group rounded-xl overflow-hidden bg-black aspect-square border border-white/10 cursor-pointer shadow-lg"
                    >
                      <img src={item.url} alt="Media" className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700" />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((tag: string, i: number) => (
                            <span key={i} className="text-[9px] font-bold bg-purple-500/80 border border-purple-400/50 text-white px-2 py-0.5 rounded-full backdrop-blur-md uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm mb-0.5 truncate">{item.eventName || "Untitled Event"}</p>
                          <p className="text-[10px] text-gray-300 font-medium flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-purple-400" />
                            {new Date(item.createdAt || item.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          <AnimatePresence>
            {selectedMedia && (
              <MediaLightbox media={selectedMedia} onClose={() => setSelectedMedia(null)} />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
