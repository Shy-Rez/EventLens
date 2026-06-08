"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Database, HardDrive, Cloud, Server, AlertCircle, 
  Trash2, RefreshCw, FileImage, ShieldCheck, Activity 
} from "lucide-react";
import useRole from "@/hooks/useRole";
import Sidebar from "@/components/Sidebar";

export default function StorageConfigPage() {
  const { role, isMounted } = useRole();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ media: 0, users: 0 });

  // Fetch basic system stats to anchor the storage metrics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("https://eventlens-backend-cufi.onrender.com/api/analytics");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch storage hooks", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (role === "ADMIN") fetchStats();
  }, [role]);

  // Hackathon Simulation Metrics (Based on real database counts)
  const simulatedStorageGB = (stats.media * 0.04).toFixed(2); // Assume ~40MB per original raw image
  const compressedStorageGB = (stats.media * 0.008).toFixed(2); // Assume ~8MB after WebP Compression
  const compressionRatio = Math.floor((1 - (Number(compressedStorageGB) / Number(simulatedStorageGB))) * 100) || 80;
  const cdnBandwidth = (stats.media * 0.15).toFixed(1); 

  if (!isMounted) return null;

  // Security Gate
  if (role !== "ADMIN") {
    return (
      <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold">Clearance Denied</h1>
          <p className="text-gray-400 mt-2">Storage infrastructure requires ADMIN authorization.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative bg-[#0a0a0a]">
        <div className="w-full max-w-7xl mx-auto space-y-8 relative">
          
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-green-600/5 rounded-full blur-[120px] pointer-events-none" />

          <header className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
                <Database className="w-8 h-8 text-green-400" />
                Storage & Infrastructure
              </h1>
              <p className="text-gray-400 text-sm mt-2 max-w-2xl">
                Manage cloud media capacity and storage.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Cloudinary Sync Active</span>
            </div>
          </header>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {[
              { title: "Raw Asset Volume", value: `${simulatedStorageGB} GB`, icon: HardDrive, color: "text-blue-400", desc: "Uncompressed uploads" },
              { title: "Optimized Vault", value: `${compressedStorageGB} GB`, icon: Cloud, color: "text-green-400", desc: `Auto-WebP Delivery` },
              { title: "Compression Savings", value: `${compressionRatio}%`, icon: Activity, color: "text-purple-400", desc: "Bandwidth preserved" },
              { title: "CDN Traffic", value: `${cdnBandwidth} GB`, icon: Server, color: "text-orange-400", desc: "Global edge delivery" },
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 p-6 rounded-3xl relative overflow-hidden shadow-lg"
              >
                <stat.icon className={`w-6 h-6 mb-4 ${stat.color}`} />
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-300 font-medium">{stat.title}</p>
                <p className="text-xs text-gray-500 mt-2">{stat.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            
            {/* Storage Distribution Chart (Simulated visually with CSS) */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between shadow-lg h-[400px]">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Media Distribution</h2>
                <p className="text-sm text-gray-400 mb-8">Current allocation of Cloudinary storage</p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2 font-bold">
                    <span className="text-blue-400 flex items-center gap-2"><FileImage className="w-4 h-4"/> Event Photos (WebP)</span>
                    <span>{compressedStorageGB} GB</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 1 }} className="h-full bg-blue-500 rounded-full" />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2 font-bold">
                    <span className="text-purple-400 flex items-center gap-2"><Database className="w-4 h-4"/> AI Vector Embeddings</span>
                    <span>0.05 GB</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '5%' }} transition={{ duration: 1 }} className="h-full bg-purple-500 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2 font-bold">
                    <span className="text-gray-400 flex items-center gap-2"><Trash2 className="w-4 h-4"/> Soft-Deleted (Trash)</span>
                    <span>1.20 GB</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '12%' }} transition={{ duration: 1 }} className="h-full bg-gray-600 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Trash & Recovery Panel */}
            <div className="lg:col-span-1 bg-red-900/10 border border-red-500/20 rounded-3xl p-8 shadow-lg flex flex-col h-[400px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Media Trash</h2>
              </div>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Media deleted by moderators are held in storage for 30 days before permanent deletion.
              </p>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center">
                        <FileImage className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-300">IMG_409{i}.jpg</p>
                        <p className="text-[10px] text-gray-500">Deleted 2 days ago</p>
                      </div>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 p-2 opacity-0 group-hover:opacity-100 transition-opacity" title="Restore Asset">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm rounded-xl border border-red-500/20 transition-colors">
                Empty Trash Now
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
