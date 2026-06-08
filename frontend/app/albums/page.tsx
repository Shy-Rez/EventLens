"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, Folder, Tag, ArrowDownAZ, Search, X, Edit, Lock, Unlock, FolderPlus } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import useRole from "@/hooks/useRole";
import EditAlbumModal from "@/components/EditAlbumModal";
import CreateEventModal from "@/components/CreateEventModal"; // 🚀 IMPORT THE MODAL

export default function AlbumsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "category">("date");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  
  // 🚀 STATE FOR CREATION MODAL
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { role, canUpload } = useRole();
  
  // 🚀 THE FIX: A persistent tracker to ignore slow, overlapping "VIEWER" requests
  const activeRequest = useRef(0);

  const fetchEvents = async () => {
    if (!role) {
      console.log("[Albums Control] Role resolution pending...");
      return;
    }

    // Increment the request ID every time a fetch is triggered
    const requestId = ++activeRequest.current;

    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5000/api/events?role=${role.toUpperCase()}`);
      
      if (!res.ok) throw new Error("Network route unavailable.");
      const data = await res.json();
      
      // 🔥 CRITICAL CHECK: Only update the screen if this is the MOST RECENT request
      if (data.success && requestId === activeRequest.current) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Live platform transaction link interrupted:", error);
    } finally {
      // Only remove the loading spinner if a newer request hasn't already taken over
      if (requestId === activeRequest.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [role]);

  const openEditFlow = (album: any) => {
    setSelectedAlbum(album);
    setIsEditModalOpen(true);
  };

  const handleAlbumUpdate = (updatedAlbum: any) => {
    fetchEvents();
  };

  // 🚀 INSTANTLY UPDATE UI ON CREATION
  const handleEventCreated = (newEvent: any) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const sortedAndFilteredEvents = [...events]
    .filter(event => event.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "category") return a.category.localeCompare(b.category);
      if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });

  return (
    <div className="flex flex-row w-full h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/5 p-6 rounded-3xl border border-white/10 shadow-lg">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Events and Albums
              </h1>
              <p className="text-gray-400 mt-2 text-sm mb-4">Manage your event details and media collections.</p>
              
              {/* 🚀 THE CREATE BUTTON (Only visible if canUpload) */}
              {canUpload && (
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm"
                >
                  <FolderPlus className="w-4 h-4" /> Create New Event
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="relative">
                <ArrowDownAZ className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-40 bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer transition-colors"
                >
                  <option value="date">Newest First</option>
                  <option value="name">Alphabetical</option>
                  <option value="category">By Category</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 bg-white/5 rounded-3xl w-full"></div>
              <div className="h-48 bg-white/5 rounded-3xl w-full"></div>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {sortedAndFilteredEvents.map((event) => {
                  const targetAlbum = event.albums?.[0];
                  const isFolderPrivate = targetAlbum ? !targetAlbum.isPublic : false;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={event.id}
                      className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group relative flex flex-col justify-between min-h-[220px]"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-wrap gap-2">
                          <div className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {event.category}
                          </div>

                          {isFolderPrivate ? (
                            <div className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-500/30 flex items-center shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                              <Lock className="w-3 h-3 mr-1.5" />
                              Private 
                            </div>
                          ) : (
                            <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full border border-green-500/30 flex items-center">
                              <Unlock className="w-3 h-3 mr-1.5" />
                              Public
                            </div>
                          )}
                        </div>

                        {canUpload && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditFlow(targetAlbum || { ...event, id: event.id });
                            }}
                            className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-blue-400 transition-colors shadow-md z-10"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="my-2">
                        <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {event.description || "No metadata description summary supplied."}
                        </p>
                      </div>
                      
                      <Link
                        href={`/albums/${event.id}`}
                        className="pt-4 border-t border-white/10 flex items-center justify-between text-sm mt-4 hover:bg-white/5 -mx-6 -mb-6 px-6 py-4 rounded-b-3xl transition-colors"
                      >
                        <div className="flex items-center text-purple-400 font-medium">
                          <Folder className="w-4 h-4 mr-2" />
                          {event.albums?.length || 0} Albums
                        </div>
                        <span className="text-blue-400 font-medium group-hover:translate-x-1 transition-transform flex items-center">
                          Open Event &rarr;
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </main>

      <EditAlbumModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        album={selectedAlbum}
        onUpdateSuccess={handleAlbumUpdate}
      />

      {/* 🚀 THE CREATION MODAL */}
      <CreateEventModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleEventCreated}
      />
    </div>
  );
}