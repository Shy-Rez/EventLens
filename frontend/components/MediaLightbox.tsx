"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Share2, Download, Star, UserPlus, Send, AtSign } from "lucide-react";

export default function MediaLightbox({ media, onClose }: { media: any, onClose: () => void }) {
   const [currentUser, setCurrentUser] = useState<any>(null);

   useEffect(() => {
     const userStr = localStorage.getItem("eventmedia_user") || localStorage.getItem("user");
     if (userStr) {
       setCurrentUser(JSON.parse(userStr));
     }
   }, []);

   const handleWatermarkedDownload = async () => {
    const role = currentUser ? currentUser.role : "GUEST";
    const clubName = "EventLens";
    const eventName = "Event Media"; 

    let downloadUrl = media.url;
    
    if (media.type === 'IMAGE' || !media.url.includes('.mp4')) {
      const watermarkText = encodeURIComponent(`${clubName} | ${eventName} | ${role}`);
      const transformation = `l_text:Arial_20_bold:${watermarkText},co_white,g_south_east,x_20,y_20,o_60`;
      downloadUrl = media.url.replace('/upload/', `/upload/${transformation}/`);
    }

    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `EventMedia_${media.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(downloadUrl, '_blank');
    }
  };

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0); 
  const [isFavorited, setIsFavorited] = useState(false);
  const [comments, setComments] = useState<any[]>([]); 
  const [newComment, setNewComment] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagQuery, setTagQuery] = useState("");

  useEffect(() => {
    const fetchInteractionData = async () => {
      try {
        const userId = currentUser?.id || ""; 
        const res = await fetch(`https://eventlens-backend-cufi.onrender.com/api/media/${media.id}/interactions?userId=${userId}`);
        const data = await res.json();
        
        if (data.success) {
          setComments(data.comments || []);
          setLikeCount(data.likeCount || 0); 
          setIsLiked(data.hasLiked || false);
        }
      } catch (error) {
        console.error("Failed to fetch media interactions:", error);
      }
    };

    if (currentUser !== null || localStorage.getItem("user") === null) {
      fetchInteractionData();
    }
  }, [media.id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return alert("Please log in to like media!");

    const previousLikedState = isLiked;
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      const res = await fetch(`https://eventlens-backend-cufi.onrender.com/api/media/${media.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }) 
      });
      
      const data = await res.json();

      if (!data.success) {
        setIsLiked(previousLikedState);
        setLikeCount((prev) => (previousLikedState ? prev + 1 : prev - 1));
      }
    } catch (error) {
      console.error("Failed to save like:", error);
      setIsLiked(previousLikedState);
      setLikeCount((prev) => (previousLikedState ? prev + 1 : prev - 1));
    }
  };

  const handleFavorite = () => setIsFavorited(!isFavorited);
  
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'EventMedia', url: media.url });
    } else {
      navigator.clipboard.writeText(media.url);
      alert("Link copied to clipboard!");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    
    const commentText = newComment;
    setNewComment(""); 

    const optimisticComment = { 
      userName: currentUser.name || currentUser.fullName || "Guest", 
      text: commentText 
    };
    setComments((prev) => [...prev, optimisticComment]);
    
    try {
      const res = await fetch(`https://eventlens-backend-cufi.onrender.com/api/media/${media.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: currentUser.id,
          content: commentText, 
          userName: currentUser.name || currentUser.fullName || "Guest" 
        })
      });
      
      const data = await res.json();
      if (!data.success) {
        console.error("Server failed to save comment.");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const handleTagUser = (e: React.FormEvent) => {
    e.preventDefault();
    if(!tagQuery) return;
    alert(`Successfully tagged @${tagQuery}! A notification has been sent.`);
    setShowTagInput(false);
    setTagQuery("");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col md:flex-row"
    >
      {/* Close Button */}
      <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
        <X className="w-6 h-6" />
      </button>

      {/* LEFT: Media Viewer */}
      <div className="flex-1 flex items-center justify-center p-2 md:p-4 bg-black/40 relative group">
        {media.type === 'VIDEO' ? (
          <video 
            src={media.url} 
            controls 
            autoPlay 
            className="w-auto h-auto max-w-[95%] max-h-[90vh] rounded-xl shadow-2xl" 
          />
        ) : (
          <img 
            src={media.url} 
            alt="Media" 
            className="w-auto h-auto max-w-[95%] max-h-[90vh] object-contain rounded-xl shadow-2xl transition-transform duration-300" 
          />
        )}
      </div>

      {/* RIGHT: Social Sidebar */}
      <div className="w-full md:w-96 bg-[#111] border-l border-white/10 flex flex-col h-full">
        
        {/* Author / Metadata Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
               {currentUser?.name?.charAt(0) || currentUser?.firstName?.charAt(0) || "G"}
            </div>
            <div>
              <p className="text-white font-medium">{currentUser?.name || currentUser?.fullName || "Guest User"}</p>
              <p className="text-xs text-gray-400">{new Date(media.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {/* 🚀 AI CAPTION BLOCK ADDED HERE */}
            {media.aiCaption && (
                <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                        AI Scene Description
                    </h4>
                    <p className="text-sm text-gray-300 italic">
                        {media.aiCaption}
                    </p>
                </div>
            )}
        </div>

        {/* Comments Feed - Now mapped to actual DB data */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-4">No comments yet. Be the first!</div>
          ) : (
            comments.map((c, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                  {(c.userName || c.user?.name)?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="text-white font-semibold mr-2">{c.userName || c.user?.name || "User"}</span>
                    <span className="text-gray-300">{c.text}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Interaction Bar */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button onClick={handleLike} className="group transition-transform active:scale-90">
                <Heart className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white group-hover:text-gray-300'}`} />
              </button>
              <button className="text-white hover:text-gray-300"><MessageCircle className="w-7 h-7" /></button>
              <button onClick={handleShare} className="text-white hover:text-gray-300"><Share2 className="w-7 h-7" /></button>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowTagInput(!showTagInput)} className="text-white hover:text-blue-400"><UserPlus className="w-6 h-6" /></button>
              <button onClick={handleWatermarkedDownload} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors" title="Download Watermarked Image">
              <Download className="w-5 h-5" />
            </button>
              <button onClick={handleFavorite}>
                <Star className={`w-7 h-7 ${isFavorited ? 'fill-yellow-500 text-yellow-500' : 'text-white hover:text-gray-300'}`} />
              </button>
            </div>
          </div>

          <p className="text-white font-semibold text-sm mb-4">{likeCount} likes</p>

          {/* Tagging Input Dropdown */}
          <AnimatePresence>
            {showTagInput && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4 overflow-hidden">
                <form onSubmit={handleTagUser} className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <AtSign className="w-4 h-4 text-blue-400 mr-2" />
                  <input type="text" placeholder="Tag a user..." value={tagQuery} onChange={(e) => setTagQuery(e.target.value)} className="bg-transparent flex-1 text-sm text-white focus:outline-none" />
                  <button type="submit" className="text-xs font-bold text-blue-400">TAG</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
            <input type="text" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="flex-1 bg-transparent border-none text-white focus:outline-none text-sm placeholder-gray-500" />
            <button type="submit" disabled={!newComment.trim()} className="text-blue-500 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Post
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}