"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, UploadCloud, Image as ImageIcon, Video, Trash2, Download } from "lucide-react";
import useRole from "@/hooks/useRole"; 
import MediaUploadZone from "../../../components/MediaUploadZone";
import MediaLightbox from "../../../components/MediaLightbox";
import Sidebar from "@/components/Sidebar"; // 🚀 IMPORTED THE SIDEBAR

export default function EventUploadStudioPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentMedia, setRecentMedia] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  // Connect standardized role parameters mapping framework
  const { role, isMounted, canUpload } = useRole();

  useEffect(() => {
    const fetchEventData = async () => {
      // 🚀 THE ACCESS CONTROL FIX: Hold fire until permissions populate fully
      if (!role) {
        console.log("[Upload Studio Page] Resolving client validation clearance tiers...");
        return;
      }

      try {
        setIsLoading(true);
        // Forward uppercase credentials parameter straight into backend filtration queries
        const res = await fetch(`http://localhost:5000/api/events/${eventId}?role=${role.toUpperCase()}`);
        const data = await res.json();
        
        if (data.success) {
          setEvent(data.event);
          const allMedia = data.event.albums?.flatMap((album: any) => album.media) || [];
          const sortedMedia = allMedia.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentMedia(sortedMedia);
        } else {
          console.warn("Target private folder context rejected visibility requirements.");
        }
      } catch (error) {
        console.error("Failed to fetch event data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId && role) fetchEventData();
  }, [eventId, role]); // Sits cleanly synced to active context updates

  // Handle Media Deletion
  const handleDeleteMedia = async (mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this file?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/media/${mediaId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setRecentMedia(prev => prev.filter(m => m.id !== mediaId));
      } else {
        alert("Failed to delete: " + data.message);
      }
    } catch (error) {
      console.error("Deletion error:", error);
    }
  };

  // Handle Dynamic Watermarked Downloads
  const handleWatermarkedDownload = async (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const userStr = localStorage.getItem("user");
    const activeRole = userStr ? JSON.parse(userStr).role : "VIEWER";
    const clubName = "EventLens";
    const eventName = event?.name || "Event";

    let downloadUrl = item.url;
    
    if (item.type === 'IMAGE' || !item.url.includes('.mp4')) {
      const watermarkText = encodeURIComponent(`${clubName} | ${eventName} | ${activeRole}`);
      const transformation = `l_text:Arial_20_bold:${watermarkText},co_white,g_south_east,x_20,y_20,o_60`;
      downloadUrl = item.url.replace('/upload/', `/upload/${transformation}/`);
    }

    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${eventName.replace(/\s+/g, '_')}_${item.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(downloadUrl, '_blank');
    }
  };

  // Hydration fallback validation
  if (!isMounted) return null;

  // 🚀 FIXED: Wrapped the loading state in the Global Layout Shell
  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[#0a0a0a] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </main>
      </div>
    );
  }

  // 🚀 FIXED: Wrapped the main render in the Global Layout Shell
  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      
      {/* Pinned Left Sidebar */}
      <Sidebar />

      {/* Main Padded Content Area */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[#0a0a0a]">
        
        <div className="w-full max-w-5xl mx-auto relative">
          <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 space-y-8">
            
            {/* Back Link Control */}
            <button 
              onClick={() => router.push('/uploads')}
              className="flex items-center text-sm font-semibold tracking-wide text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Upload Studio
            </button>

            {/* HERO BANNER INFORMATION LAYER */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Upload Studio</h1>
                  <p className="text-gray-400 mt-1 text-sm flex items-center gap-2">
                    Add media files to: <strong className="text-blue-300">{event?.name || "Event"}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* DROPZONE INTEGRATION SECTOR */}
            <div className="mb-16">
              <MediaUploadZone eventId={eventId} />
            </div>

            {/* RECENT UPLOADS MATRIX LAYER FEED */}
            <div>
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wider text-gray-400">
                <ImageIcon className="w-5 h-5 text-gray-400" /> 
                Recently Uploaded Media
              </h2>
              
              {recentMedia.length === 0 ? (
                <div className="p-12 border border-white/5 rounded-3xl bg-white/[0.01] flex flex-col items-center justify-center text-gray-500 text-sm">
                  <p>No media files have been uploaded to this event yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {recentMedia.slice(0, 10).map((item) => (
                    <motion.div
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group rounded-xl overflow-hidden bg-black aspect-square border border-white/10 cursor-pointer shadow-lg"
                    >
                      {item.type === 'VIDEO' ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <Video className="w-8 h-8 text-white/50" />
                          <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                        </div>
                      ) : (
                        <img src={item.url} alt="Uploaded" className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                      )}
                      
                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-16">
                            {item.tags && item.tags.length > 0 ? (
                              item.tags.slice(0, 2).map((tag: string, i: number) => (
                                <span key={i} className="text-[9px] font-bold bg-blue-500/80 text-white px-2 py-0.5 rounded-full border border-blue-400/30 backdrop-blur-md uppercase tracking-wide">
                                  #{tag}
                                </span>
                              ))
                            ) : null}
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            {canUpload && (
                              <button 
                                onClick={(e) => handleDeleteMedia(item.id, e)} 
                                className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg backdrop-blur-sm text-white transition-colors shadow-lg"
                                title="Delete File"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button 
                              onClick={(e) => handleWatermarkedDownload(item, e)} 
                              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm text-white transition-colors shadow-lg"
                              title="Download Protected Copy"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Added {new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <AnimatePresence>
            {selectedMedia && (
              <MediaLightbox 
                media={selectedMedia} 
                onClose={() => setSelectedMedia(null)} 
              />
            )}
          </AnimatePresence>
        </div>
        
      </main>
    </div>
  );
}