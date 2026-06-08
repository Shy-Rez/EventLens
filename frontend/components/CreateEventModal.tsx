"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Type, Tag, Shield, Loader2, AlignLeft } from "lucide-react";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEvent: any) => void; // 🚀 THE FIX: Added onSuccess to update the grid instantly
}

export default function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: "", // 🚀 THE FIX: Changed 'name' to 'title' so the backend accepts it!
    description: "",
    date: "",
    category: "Photoshoot",
    isPublic: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("https://eventlens-backend-cufi.onrender.com/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.event); // Push the new event to the UI instantly
        
        // Reset form for next time
        setFormData({ title: "", description: "", date: "", category: "Photoshoot", isPublic: true });
        onClose();
      } else {
        alert(data.message || "Failed to create event.");
      }
    } catch (error) {
      console.error("Full Error details:", error);
      alert("Could not connect to backend server. Check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose} 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] rounded-[2rem] shadow-2xl overflow-hidden border border-white/10"
          >
            {/* Premium Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5 relative z-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">Create New Event</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
              
              {/* Event Name & Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                    Event Name
                  </label>
                  <div className="relative">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      required 
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-purple-500 focus:outline-none transition-colors" 
                      placeholder="e.g., Annual Tech Fest 2026" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                    Event Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="date" 
                      required 
                      value={formData.date} 
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-purple-500 focus:outline-none transition-colors [color-scheme:dark]" 
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                  Description
                </label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 w-4 h-4 text-gray-500" />
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    placeholder="Add some context about this event..." 
                    rows={2} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-purple-500 focus:outline-none transition-colors resize-none" 
                  />
                </div>
              </div>

              {/* Category & Privacy Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                    Category
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                      className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-purple-500 focus:outline-none transition-colors appearance-none"
                    >
                      <option value="Photoshoot">Photoshoot</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Cultural Fest">Cultural Fest</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                    Privacy Setting
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select 
                      value={formData.isPublic ? "Public" : "Private"} 
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === "Public" })} 
                      className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:border-purple-500 focus:outline-none transition-colors appearance-none"
                    >
                      <option value="Public">Public (Anyone can view)</option>
                      <option value="Private">Private (Members Only)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-white/10 mt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initialize Event Vault"}
                </button>
              </div>
            </form>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}