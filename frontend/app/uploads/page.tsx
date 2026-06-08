"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Calendar, Tag, Folder, ArrowRight, Loader2, Lock, Unlock } from "lucide-react";
import useRole from "@/hooks/useRole"; 
import Sidebar from "../../components/Sidebar";

export default function UploadsHubPage() {
  const router = useRouter();
  const { role, isMounted } = useRole();

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 THE FIX: A persistent tracker to ignore slow, overlapping "VIEWER" requests
  const activeRequest = useRef(0);

  useEffect(() => {
    const fetchUploadableEvents = async () => {
      if (!role) {
        console.log("[Upload Studio] Waking up permission schemas context strings...");
        return;
      }

      const requestId = ++activeRequest.current;

      try {
        setIsLoading(true);
        const res = await fetch(`http://localhost:5000/api/events?role=${role.toUpperCase()}`);
        const data = await res.json();
        
        // 🔥 CRITICAL CHECK: Only update the screen if this is the MOST RECENT request
        if (data.success && requestId === activeRequest.current) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error("Failed to compile workspace uploads target folders feed maps:", error);
      } finally {
        if (requestId === activeRequest.current) {
          setIsLoading(false);
        }
      }
    };

    fetchUploadableEvents();
  }, [role]); 

  if (!isMounted) return null;

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <header>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Upload Studio
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
              Select an event down below to open the cloud media dropzone and media gallery.
            </p>
          </header>

          {isLoading ? (
            <div className="w-full h-[40vh] flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
              <p className="text-sm font-medium">Synchronizing structural database permissions tiers...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
              <UploadCloud className="w-12 h-12 text-gray-600 mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-white mb-1">No Operational Events Detected</h3>
              <p className="text-gray-400 text-sm max-w-sm">Please launch your administrative console panel to instantiate your primary events collections arrays.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {events.map((event) => {
                  const targetAlbum = event.albums?.[0];
                  const isFolderPrivate = targetAlbum ? !targetAlbum.isPublic : false;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={event.id}
                      onClick={() => router.push(`/uploads/${event.id}`)}
                      className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer relative flex flex-col justify-between min-h-[240px] shadow-lg shadow-black/20"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center">
                            <Tag className="w-3 h-3 mr-1.5" />
                            {event.category || "General"}
                          </div>

                          {isFolderPrivate ? (
                            <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                              <Lock className="w-3 h-3 mr-1.5" />
                              Private 
                            </div>
                          ) : (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center">
                              <Unlock className="w-3 h-3 mr-1.5" />
                              Public
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white mb-2 tracking-wide group-hover:text-blue-400 transition-colors">
                            {event.name}
                          </h3>
                          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                            {event.description || "No layout descriptive metadata context configured for this album record bundle node."}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs mt-4">
                        <span className="text-blue-400 font-bold uppercase tracking-wider group-hover:translate-x-1.5 transition-transform flex items-center gap-1.5">
                          <span>Open Event</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}