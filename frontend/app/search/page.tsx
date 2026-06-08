"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, ArrowRight, Loader2, Camera, Focus, AlertCircle } from "lucide-react";
import useRole from "@/hooks/useRole";
import Sidebar from "@/components/Sidebar";
import MediaLightbox from "@/components/MediaLightbox";
import * as faceapi from 'face-api.js';

export default function AIFaceFinderPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Awaiting reference image...");
  
  const [matchedMedia, setMatchedMedia] = useState<any[]>([]);
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState<any>(null);

  const { isMounted } = useRole();

  // 🚀 LOAD NEURAL NETWORKS ON MOUNT
  // 🚀 LOAD NEURAL NETWORKS ON MOUNT (USING CLOUD CDN)
  useEffect(() => {
    const loadModels = async () => {
      try {
        // 🚀 THE FIX: Tell face-api to pull the models straight from the jsDelivr Cloud CDN
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights'; 
        
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load AI models from CDN:", err);
      }
    };
    loadModels();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setScanComplete(false);
      setMatchedMedia([]);
      setStatusMessage("Reference loaded. Ready to extract vectors.");
    }
  };

  // 🚀 UPDATED: EXTRACT VECTOR AND SEND TO BACKEND API
  const runRealVectorScan = async () => {
    if (!selectedImage) return;
    setIsScanning(true);
    setStatusMessage("Extracting 128D facial embeddings from your selfie...");

    try {
      // 1. Analyze the uploaded selfie in the browser
      const refImgElement = document.getElementById('reference-image') as HTMLImageElement;
      const refDetection = await faceapi.detectSingleFace(refImgElement).withFaceLandmarks().withFaceDescriptor();

      if (!refDetection) {
        setStatusMessage("ERROR: No face detected in your selfie. Please try a clearer photo.");
        setIsScanning(false);
        return;
      }

      // Convert the Float32Array to a standard JavaScript Array for the JSON payload
      const vectorArray = Array.from(refDetection.descriptor);
      setStatusMessage("Selfie embedded successfully. Querying database matrix...");

      // 2. Send the 128D vector to your new Backend Route
      const response = await fetch('http://localhost:5000/api/search/face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vector: vectorArray })
      });

      const data = await response.json();

      if (data.success) {
        setMatchedMedia(data.matches);
        setStatusMessage(`Scan complete. ${data.message}`);
        setScanComplete(true);
      } else {
        setStatusMessage(`ERROR: ${data.message}`);
      }

    } catch (err) {
      console.error("AI Scan Failed:", err);
      setStatusMessage("ERROR: Neural engine connection to backend failed.");
    } finally {
      setIsScanning(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[#0a0a0a]">
        <div className="w-full max-w-6xl mx-auto space-y-8 relative">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

          <header className="relative z-10 text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <ScanFace className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
              Facial Recognition
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Upload a reference photo, and the system uses facial recognition to find all other similar pictures in the library.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            
            <div className="lg:col-span-1">
              {!modelsLoaded ? (
                 <div className="bg-white/5 border border-white/10 rounded-3xl h-[400px] flex flex-col items-center justify-center text-center p-6 shadow-2xl">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Loading Application...</h3>
                    <p className="text-gray-500 text-xs">Please wait...</p>
                 </div>
              ) : !selectedImage ? (
                <label className="bg-white/5 border-2 border-dashed border-blue-500/30 rounded-3xl h-[400px] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-500/5 hover:border-blue-400 transition-all group shadow-2xl">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Camera className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Start Scan</h3>
                  <p className="text-gray-500 text-xs">Upload the reference photo</p>
                </label>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl text-center flex flex-col justify-between h-[400px]">
                  
                  <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.2)] mb-6">
                    <img id="reference-image" crossOrigin="anonymous" src={selectedImage} alt="Reference" className="w-full h-full object-cover" />
                    
                    {isScanning && (
                      <motion.div 
                        initial={{ top: "-10%" }}
                        animate={{ top: "110%" }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute left-0 right-0 h-12 bg-gradient-to-b from-transparent via-blue-400/50 to-blue-400 border-b-2 border-blue-300 shadow-[0_0_20px_rgba(96,165,250,1)] z-10"
                      />
                    )}
                  </div>

                  {!scanComplete ? (
                    <button 
                      onClick={runRealVectorScan}
                      disabled={isScanning}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isScanning ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Scanning database...</>
                      ) : (
                        <><ScanFace className="w-4 h-4" /> Running AI Scan</>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setSelectedImage(null); setStatusMessage("Awaiting reference image..."); }}
                      className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
                    >
                      <ArrowRight className="w-4 h-4" /> Reset Scanner
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md min-h-[400px] flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-white/10 gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Focus className="w-5 h-5 text-blue-400" /> Target Matches
                </h2>
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-full font-bold text-xs text-blue-400 w-fit">
                  {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertCircle className="w-3 h-3" />}
                  {statusMessage}
                </div>
              </div>

              {!scanComplete ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <ScanFace className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">Upload a photo and run the scanner to get matches.</p>
                </div>
              ) : matchedMedia.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <p className="text-sm">No faces matching the reference were found in the database.</p>
                </div>
              ) : (
                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {matchedMedia.map((item, idx) => (
                      <motion.div
                        key={item.id || idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.15 }}
                        onClick={() => setSelectedLightboxMedia(item)}
                        className="relative group rounded-xl overflow-hidden bg-black aspect-square border-2 border-blue-500/30 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:border-blue-400 transition-colors"
                      >
                        <img src={item.url} alt="Match" className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                        
                        <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
                          <div className="flex justify-between w-full">
                            <div className="w-3 h-3 border-t-2 border-l-2 border-blue-400"></div>
                            <div className="w-3 h-3 border-t-2 border-r-2 border-blue-400"></div>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded uppercase tracking-widest">
                              Match: {item.matchConfidence}%
                            </span>
                          </div>
                          <div className="flex justify-between w-full">
                            <div className="w-3 h-3 border-b-2 border-l-2 border-blue-400"></div>
                            <div className="w-3 h-3 border-b-2 border-r-2 border-blue-400"></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
            
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedLightboxMedia && (
          <MediaLightbox media={selectedLightboxMedia} onClose={() => setSelectedLightboxMedia(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}