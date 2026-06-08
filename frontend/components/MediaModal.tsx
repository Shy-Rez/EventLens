"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Send , Download } from "lucide-react";


interface MediaModalProps {
  media: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaModal({ media, isOpen, onClose }: MediaModalProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && media) {
      fetch(`http://localhost:5000/api/media/${media.id}/comments`)
        .then(res => res.json())
        .then(data => { if (data.success) setComments(data.comments); });
    }
  }, [isOpen, media]);

  const toggleLike = async () => {
    setIsLiked(!isLiked);
    await fetch(`http://localhost:5000/api/media/${media.id}/like`, { method: "POST" });
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const res = await fetch(`http://localhost:5000/api/media/${media.id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment })
    });
    const data = await res.json();
    
    if (data.success) {
      setComments([...comments, data.comment]);
      setNewComment("");
    }
  };

  const handleDownload = () => {
    if (!media) return;

    // ==========================================
    // 1. VIDEO DOWNLOAD HANDLER
    // ==========================================
    if (media.type === "VIDEO") {
      const urlParts = media.url.split('/upload/');
      if (urlParts.length === 2) {
        // Add Cloudinary's fl_attachment flag to force the browser to download the MP4
        const videoDlUrl = `${urlParts[0]}/upload/fl_attachment/${urlParts[1]}`;
        
        const a = document.createElement('a');
        a.href = videoDlUrl;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      return; // Stop here so it doesn't try to run the Image Canvas code
    }

    // ==========================================
    // 2. IMAGE DOWNLOAD HANDLER (With Watermark)
    // ==========================================
    const img = new Image();
    img.crossOrigin = "anonymous"; 
    img.src = media.url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0);

        const clubName = "EventMedia Club";
        const eventName = "Hackathon 2026";
        const userRole = "Photographer";
        const watermarkText = `${clubName} | ${eventName} | ${userRole}`;

        const fontSize = Math.max(12, Math.min(35, img.width * 0.02));
        ctx.font = `300 ${fontSize}px Arial, sans-serif`; 
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.textAlign = "right";
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        const padding = Math.max(15, img.width * 0.015);
        ctx.fillText(watermarkText, img.width - padding, img.height - padding);

        const a = document.createElement("a");
        a.download = `EventMedia_${media.id}.jpg`;
        a.href = canvas.toDataURL("image/jpeg", 0.9);
        a.click();
      }
    };
  };

  if (!isOpen || !media) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
        {/* Dark blurred background backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-6xl h-[85vh] bg-[#121212] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10 z-10"
        >
          <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-black transition">
            <X className="w-5 h-5" />
          </button>

          {/* LEFT SIDE: The Image */}
          <div className="flex-1 bg-black flex items-center justify-center relative group">
            {media.type === "VIDEO" ? (
              <video src={media.url} controls className="max-w-full max-h-full object-contain" />
            ) : (
              <img src={media.url} alt="Media" className="max-w-full max-h-full object-contain" />
            )}
          </div>

          {/* RIGHT SIDE: Social Sidebar */}
          <div className="w-full md:w-96 flex flex-col bg-[#0a0a0a] border-l border-white/10 h-full">
            
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
              <div>
                <p className="text-white font-bold text-sm">Event Uploader</p>
                <p className="text-gray-500 text-xs">{new Date(media.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Comments Area (Scrollable) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center mt-10">No comments yet. Be the first!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-white">
                        <span className="font-bold mr-2">{comment.user?.name || "User"}</span>
                        {comment.content}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">Just now</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action Bar (Likes) */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <button onClick={toggleLike} className="group">
                  <Heart className={`w-7 h-7 transition-all ${isLiked ? "fill-red-500 text-red-500 scale-110" : "text-white group-hover:text-red-400"}`} />
                </button>
                <MessageCircle className="w-7 h-7 text-white hover:text-gray-300 cursor-pointer transition-colors" />
              </div>

              {/* NEW: Download Button */}
                <button onClick={handleDownload} className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg">
                  <Download className="w-4 h-4" />
                  Save Image
                </button>

              {/* Comment Input */}
              <form onSubmit={postComment} className="flex items-center relative">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 placeholder-gray-500 pr-10"
                />
                <button type="submit" disabled={!newComment.trim()} className="absolute right-0 text-blue-500 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  Post
                </button>
              </form>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}