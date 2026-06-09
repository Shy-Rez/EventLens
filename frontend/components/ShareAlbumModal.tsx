"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, CheckCircle2, QrCode, Users, Shield } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

export default function ShareAlbumModal({ isOpen, onClose, eventId, eventName }: ShareModalProps) {
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000";
  const shareUrl = `${baseUrl}/albums/${eventId}${isCollaborative ? "?invite_token=collab_8f92a1" : "?view=public"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-md relative shadow-2xl overflow-hidden"
        >

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-blue-600/20 blur-[60px] pointer-events-none" />

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Share Album <QrCode className="w-5 h-5 text-blue-400" />
              </h2>
              <p className="text-gray-400 text-sm mt-1">{eventName}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-black/50 border border-white/5 rounded-2xl p-2 flex relative mb-8 z-10">
            <button 
              onClick={() => setIsCollaborative(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${!isCollaborative ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Shield className="w-4 h-4" /> View Only
            </button>
            <button 
              onClick={() => setIsCollaborative(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${isCollaborative ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Users className="w-4 h-4" /> Collaborative
            </button>
          </div>

          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="bg-white p-4 rounded-2xl shadow-xl mb-4 transition-all duration-300 transform hover:scale-105">
              <QRCodeCanvas 
                value={shareUrl} 
                size={180} 
                bgColor={"#ffffff"} 
                fgColor={"#000000"} 
                level={"H"} 
                includeMargin={false}
              />
            </div>
            <p className="text-sm text-gray-400 text-center px-4">
              {isCollaborative 
                ? "Scan to join the album and upload your own photos!" 
                : "Scan to instantly view this album on your phone."}
            </p>
          </div>

          <div className="relative z-10">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Share Link</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={shareUrl} 
                className="flex-1 bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-gray-300 focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg flex-shrink-0"
              >
                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}