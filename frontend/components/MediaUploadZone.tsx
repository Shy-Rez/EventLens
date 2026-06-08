"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, X, CheckCircle2, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MediaUploadZone({ eventId }: { eventId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadReport, setUploadReport] = useState<{
    success: boolean;
    count?: number;
    message?: string;
    duplicates?: string[];
    moderated?: string[];
  } | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov']
    },
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
    onDropRejected: (fileRejections) => {
      console.error("Rejected files:", fileRejections);
      alert("⚠️ Some files were rejected. Please only upload images (JPG, PNG, WEBP) or videos (MP4, MOV).");
    }
  });

  // AI Model loading removed from upload zone

  // Upload Handler with full state report mappings
  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

    const validMediaFiles = files.filter(file => {
      const isMedia = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isSmallEnough = file.size <= MAX_FILE_SIZE;
      return isMedia && isSmallEnough;
    });

    if (validMediaFiles.length === 0) {
      setIsUploading(false);
      setFiles([]);
      return;
    }

    let totalUploadedCount = 0;
    let finalDuplicates: string[] = [];
    let finalModerated: string[] = [];
    let uploadFailed = false;

    // SCAN FACES BEFORE UPLOAD REMOVED
    const faceVectorsData: Record<string, number[]> = {};

    const BATCH_SIZE = 2; 
    
    try {
      for (let i = 0; i < validMediaFiles.length; i += BATCH_SIZE) {
        const batchFiles = validMediaFiles.slice(i, i + BATCH_SIZE);
        const formData = new FormData();
        
        batchFiles.forEach((file) => formData.append("media", file));
        formData.append("eventId", eventId);
        formData.append("faceVectors", JSON.stringify(faceVectorsData));

        const res = await fetch("https://eventlens-backend-cufi.onrender.com/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          uploadFailed = true;
          break;
        }

        const data = await res.json();
        if (data.success) {
          totalUploadedCount += data.count || 0;
          if (data.duplicates) finalDuplicates = [...finalDuplicates, ...data.duplicates];
          if (data.moderated) finalModerated = [...finalModerated, ...data.moderated];
        } else {
          uploadFailed = true;
          break;
        }
      }

      if (!uploadFailed) {
        setUploadReport({ 
          success: true, 
          count: totalUploadedCount,
          duplicates: finalDuplicates,
          moderated: finalModerated
        });
        setFiles([]);
      } else {
        setUploadReport({ success: false, message: "Upload operation rejected by remote host." });
      }

    } catch (error) {
      setUploadReport({ success: false, message: "Connection to upload gateway stream lost." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* COMPACT DROPZONE UI */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/20'} hover:border-blue-500/50 bg-black/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group relative`}
      >
        <input {...getInputProps()} />
        <UploadCloud className={`w-10 h-10 transition-colors mb-3 ${isDragActive ? 'text-blue-400 scale-110' : 'text-gray-500 group-hover:text-blue-400'}`} />
        <h3 className="text-lg font-bold text-white mb-1">
          {isDragActive ? "Drop files here to add..." : "Click to Upload / Drag and Drop"}
        </h3>
        <p className="text-sm text-gray-500 text-center">JPG, PNG, WEBP, MP4, MOV (Max 50MB)</p>
      </div>

      {/* IMAGE PREVIEWS CONTROL ARRAY CONTAINER */}
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="text-white text-sm font-medium flex items-center justify-between">
            <span>Ready to upload ({files.length} items)</span>
            <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:underline">Clear All</button>
          </h4>
          
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {files.slice(0, 12).map((file, i) => {
              const isImage = file.type.startsWith('image/');
              const objectUrl = isImage ? URL.createObjectURL(file) : null;
              
              return (
                <div key={i} className="relative bg-white/5 border border-white/10 rounded-xl aspect-square flex items-center justify-center overflow-hidden group">
                  {isImage ? (
                    <img src={objectUrl!} alt="Preview asset container element" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300 group-hover:scale-110" />
                  ) : (
                    <div className="flex flex-col items-center">
                       <File className="w-6 h-6 text-blue-400 mb-1" />
                       <span className="text-[8px] text-blue-400 font-bold">VIDEO</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 backdrop-blur-md">
                    <p className="text-[9px] text-gray-300 truncate text-center font-medium px-1">{file.name}</p>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      setFiles(files.filter((_, index) => index !== i));
                    }}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-500 text-white rounded-md transition opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
            
            {files.length > 12 && (
              <div className="relative bg-white/5 border border-white/10 rounded-xl aspect-square flex flex-col items-center justify-center shadow-inner">
                <p className="text-lg font-bold text-white">+{files.length - 12}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">more</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUploading ? "Uploading & Scanning for AI Tags..." : "Upload to Gallery"}
          </button>
        </div>
      )}

      {/* UPLOAD REPORT SUMMARY DIALOG WINDOW CONTAINER */}
      <AnimatePresence>
        {uploadReport && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-lg relative shadow-2xl overflow-hidden space-y-6"
            >
              {uploadReport.success ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 border-b border-white/10 pb-6">
                    <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center border border-green-500/30">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Upload Complete</h2>
                      <p className="text-gray-400 text-sm">Successfully processed {uploadReport.count} files.</p>
                    </div>
                  </div>

                  {uploadReport.duplicates && uploadReport.duplicates.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start space-x-4">
                      <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-blue-400 font-bold mb-1">Prevented {uploadReport.duplicates.length} Duplicates</h4>
                        <p className="text-xs text-blue-200/70 truncate max-w-[340px]">
                          {uploadReport.duplicates.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {uploadReport.moderated && uploadReport.moderated.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start space-x-4">
                      <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-red-400 font-bold mb-1">AI Moderated {uploadReport.moderated.length} Files</h4>
                        <p className="text-xs text-red-200/70 truncate max-w-[340px]">
                          Blocked: {uploadReport.moderated.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => window.location.reload()} 
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition"
                  >
                    Got it, view gallery
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Upload Failed</h2>
                  <p className="text-gray-400">{uploadReport.message}</p>
                  
                  <button 
                    onClick={() => setUploadReport(null)} 
                    className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}