"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FolderOpen, Image as ImageIcon, Video, Calendar, Tag, Download, Trash2, Share2, UploadCloud, Loader2 } from "lucide-react";
import useRole from "@/hooks/useRole"; 
import MediaLightbox from "../../../components/MediaLightbox";
import ShareAlbumModal from "../../../components/ShareAlbumModal";
import Sidebar from "@/components/Sidebar";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  // 1. ALL STATE & REFS
  const [event, setEvent] = useState<any>(null);
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [displayedMediaCount, setDisplayedMediaCount] = useState(12);
  const observer = useRef<IntersectionObserver | null>(null);

  // Grab the reactive permissions state context from your standardized auth hook
  const { role, canUpload } = useRole();

  // 🚀 THE FINAL ROOT FIX: Force the page to hold its fetch until useRole() finishes parsing disk storage
  useEffect(() => {
    const fetchEventDetails = async () => {
      // 🛑 GUARD: If role is still loading or null, FREEZE execution here!
      if (!role) {
        console.log("[Single Event Viewer] Role context uninitialized. Holding network handshake thread...");
        return;
      }

      try {
        setIsLoading(true);
        console.log(`[Single Event Viewer] Authenticated fetch request using role parameter: ${role.toUpperCase()}`);
        
        // Explicitly pass your verified administrative role parameter in UPPERCASE
        const res = await fetch(`https://eventlens-backend-cufi.onrender.com/api/events/${eventId}?role=${role.toUpperCase()}`);
        const data = await res.json();
        
        if (data.success) {
          setEvent(data.event);
          if (data.event.albums && data.event.albums.length > 0) {
            setActiveAlbumId(data.event.albums[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch event data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchEventDetails();
  }, [eventId, role]);

  // 3. SAFE DERIVED DATA
  const activeAlbum = event?.albums?.find((a: any) => a.id === activeAlbumId);

  // 4. CALLBACK HOOK (Infinite Scroll)
  const lastMediaElementRef = useCallback((node: any) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && activeAlbum?.media?.length > displayedMediaCount) {
        setDisplayedMediaCount(prevCount => prevCount + 8);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, activeAlbum, displayedMediaCount]);

  // Handle Media Deletion
  const handleDeleteMedia = async (mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this file?")) return;

    try {
      const res = await fetch(`https://eventlens-backend-cufi.onrender.com/api/media/${mediaId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setEvent((prevEvent: any) => {
          const updatedAlbums = prevEvent.albums.map((album: any) => {
            if (album.id === activeAlbumId) {
              return { ...album, media: album.media.filter((m: any) => m.id !== mediaId) };
            }
            return album;
          });
          return { ...prevEvent, albums: updatedAlbums };
        });
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
      console.error("Download failed, falling back to new tab", error);
      window.open(downloadUrl, '_blank');
    }
  };

  // 5. EARLY RETURNS (Wrapped in Layout Shell to prevent Sidebar flicker)
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

  if (!event) {
    return (
      <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[#0a0a0a] flex flex-col items-center justify-center text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-400">Album Vault Unavailable</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">This folder item is private or does not exist under your current account clearances profile nodes.</p>
          <button onClick={() => router.push('/albums')} className="mt-4 text-sm font-bold text-blue-400 hover:underline">
            &larr; Return to Workspace Albums
          </button>
        </main>
      </div>
    );
  }

  // 6. MAIN RENDER WITH PREMIUM INLINE CANVAS UI
  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      
      {/* Pinned Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[#0a0a0a]">
        <div className="w-full max-w-7xl mx-auto space-y-8 relative">
          
          {/* Subtle Background Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10">
            {/* Back Button Link */}
            <Link href="/albums" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6 group text-sm font-semibold tracking-wide">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Events Feed
            </Link>

            {/* PREMIUM EVENT HERO BANNER */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 mb-12 backdrop-blur-xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                    {event.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    {event.date && (
                      <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-blue-300">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    {event.category && (
                      <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-purple-300">
                        <Tag className="w-3.5 h-3.5" />
                        {event.category}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-400 leading-relaxed max-w-3xl text-base">
                    {event.description || "No description provided for this event metadata schema block."}
                  </p>
                </div>

                <div className="flex-shrink-0 mt-4 md:mt-0">
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 w-full md:w-auto text-sm"
                  >
                    <Share2 className="w-4 h-4" /> Share Workspace Folder
                  </button>
                </div>
              </div>
            </div>

            <ShareAlbumModal 
              isOpen={isShareModalOpen} 
              onClose={() => setIsShareModalOpen(false)} 
              eventId={eventId} 
              eventName={event.name} 
            />

            {/* GALLERY HEADLINE ACTIONS ROW */}
            <div className="flex items-center justify-between mb-8 border-t border-white/5 pt-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 tracking-wide">
                <ImageIcon className="w-5 h-5 text-blue-400" /> 
                Added Media
              </h2>
              <Link href={`/uploads?eventId=${eventId}`} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition bg-blue-500/10 px-4 py-2.5 rounded-xl border border-blue-500/10">
                + Add New Media
              </Link>
            </div>

            {/* MEDIA TILES MATRIX GALLERY */}
            {!activeAlbum?.media || activeAlbum.media.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No data media records matching choice</h3>
                <p className="text-gray-400 max-w-sm mx-auto mb-6 text-sm leading-relaxed">
                  This specific collection folder is empty. Use the upload interface tool to push images into the cloud.
                </p>
                <Link 
                  href={`/uploads?eventId=${eventId}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-wide"
                >
                  Launch Upload Studio
                </Link>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                <AnimatePresence>
                  {activeAlbum.media.slice(0, displayedMediaCount).map((item: any, index: number) => {
                    const isLastElement = index === displayedMediaCount - 1;

                    return (
                      <motion.div
                        key={item.id}
                        ref={isLastElement ? lastMediaElementRef : null}
                        onClick={() => setSelectedMedia(item)}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group rounded-xl overflow-hidden bg-black aspect-square border border-white/10 cursor-pointer shadow-lg"
                      >
                        {item.type === 'VIDEO' ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <Video className="w-8 h-8 text-white/50 animate-pulse" />
                            <video src={item.url} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                          </div>
                        ) : (
                          <img src={item.url} alt="Media" className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                        )}
                        
                        {/* Hover Card Overlay UI */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-16">
                              {item.tags && item.tags.length > 0 ? (
                                item.tags.slice(0, 2).map((tag: string, i: number) => (
                                  <span key={i} className="text-[9px] font-bold bg-blue-500/80 text-white px-2 py-0.5 rounded-full border border-blue-400/30 backdrop-blur-md uppercase tracking-wider">
                                    #{tag}
                                  </span>
                                ))
                              ) : null}
                            </div>
                            
                            {/* Interactive Tool Actions */}
                            <div className="flex items-center gap-1.5">
                              {canUpload && (
                                <button 
                                  onClick={(e) => handleDeleteMedia(item.id, e)} 
                                  className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg backdrop-blur-sm text-white transition-colors flex-shrink-0"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button 
                                onClick={(e) => handleWatermarkedDownload(item, e)} 
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm text-white transition-colors flex-shrink-0"
                                title="Download Protected Asset"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-[10px] text-gray-400 font-medium">Uploaded {new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
          
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