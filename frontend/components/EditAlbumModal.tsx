"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit3, FolderPlus, Lock, Unlock, Loader2, FileText } from "lucide-react";

interface Album {
  id: string | number;
  title?: string;
  name?: string;
  description: string;
  category: string;
  isPrivate: boolean;
}

interface EditAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album | null;
  onUpdateSuccess: (updatedAlbum: any) => void;
}

export default function EditAlbumModal({ isOpen, onClose, album, onUpdateSuccess }: EditAlbumModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync state fields whenever a fresh target album container is passed to the editing grid
  useEffect(() => {
    if (album) {
      setTitle(album.title || album.name || "");
      setDescription(album.description || "");
      setCategory(album.category || "General");
      setIsPrivate(album.isPrivate || false);
      setErrorMessage("");
    }
  }, [album]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!album) return;
    if (!title.trim()) {
      setErrorMessage("Album title/name cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch(`https://eventlens-backend-cufi.onrender.com/api/albums/${album.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, name: title, description, category, isPrivate }),
      });

      const data = await res.json();

      if (data.success) {
        onUpdateSuccess(data.album);
        onClose();
      } else {
        setErrorMessage(data.message || "Failed to update album settings.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network connection timed out. Could not reach backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Frosted Background Backdrop Mask overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Premium Glassmorphism Dialog Panel box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#121212]/90 border border-white/10 w-full max-w-lg rounded-3xl p-6 md:p-8 text-white shadow-2xl backdrop-blur-xl overflow-hidden z-10"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Edit Album Details</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 text-sm px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Album Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Tech Summit 2026"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Photoshoot">Photoshoot</option>
                  <option value="Cultural Fest">Cultural Fest</option>
                  <option value="Party">Party</option>
                  <option value="Competition">Competition</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Description field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a premium metadata summary of this folder block details..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Privacy Toggler */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  {isPrivate ? <Lock className="w-5 h-5 text-purple-400" /> : <Unlock className="w-5 h-5 text-green-400" />}
                  <div>
                    <p className="text-sm font-semibold text-white">Private Album Protection</p>
                    <p className="text-xs text-gray-400 mt-0.5">Restrict media content viewing access solely to logged-in system entities.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 outline-none ${isPrivate ? "bg-purple-600 flex justify-end" : "bg-gray-600 flex justify-start"}`}
                >
                  <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>

              {/* Layout actions button grid row alignment */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}