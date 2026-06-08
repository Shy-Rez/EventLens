"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FolderPlus, Users, Activity, Lock, Eye, Calendar, Loader2, Sparkles, ArrowRight, Heart, Clock, Image as ImageIcon, Video , UserPlus} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar"; 
import useRole from "@/hooks/useRole";

export default function DashboardPage() {
  const router = useRouter();
  const { role, user, isMounted, canUpload, isAdmin } = useRole();
  
  // 🚀 THE FIX: Added 'likes' to the stats state, and created a state for 'recentActivity'
  const [stats, setStats] = useState({ users: 0, events: 0, media: 0, likes: 0 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(true); 

  useEffect(() => {
    if (!isMounted) return;
    const hasToken = localStorage.getItem("user");

    if (!hasToken) {
      router.push("/login");
      return;
    }

    if (role) {
      setIsVerifying(false); 

      // 1. Fetch Admin Analytics (Includes Total Likes)
      if (isAdmin) {
        fetch("https://eventlens-backend-cufi.onrender.com/api/analytics")
          .then(res => res.json())
          .then(data => { 
            if (data.success) setStats(data.stats); 
          });
      }

      // 2. Fetch Recent Event Vaults
      fetch(`https://eventlens-backend-cufi.onrender.com/api/events?role=${role}`)
        .then(res => res.json())
        .then(data => { 
          if (data.success) setRecentEvents(data.events.slice(0, 3)); 
        });

      // 3. 🚀 THE FIX: Fetch the Global Activity Feed (Recently Uploaded Media)
      fetch(`https://eventlens-backend-cufi.onrender.com/api/activity`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setRecentActivity(data.activities);
        });
    }
  }, [role, isMounted, isAdmin, router]);

  if (!isMounted || isVerifying) {
    return (
      <div className="flex h-screen w-full bg-[#050505] items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-row w-full h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 relative z-10">
          
          {/* HERO BANNER */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Dashboard</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                  Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{user?.name?.split(" ")[0] || "User"}</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl">
                  {isAdmin ? " System overview and analytics." : "Explore the latest event collections and media vaults."}
                </p>
              </div>
              <div className="px-6 py-3 bg-black/40 border border-white/5 rounded-2xl text-sm font-extrabold uppercase tracking-widest text-gray-300 shadow-inner flex flex-col items-end">
                <span className="text-[10px] text-gray-500 mb-1">Clearance Level</span>
                <span className={isAdmin ? "text-red-400" : "text-blue-400"}>{role.replace("_", " ")}</span>
              </div>
            </div>
          </motion.div>

          {/* 🚀 THE FIX: ADMIN ANALYTICS DASHBOARD (Now includes Likes Counter) */}
          {isAdmin && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-wide text-gray-300">
                <Activity className="w-5 h-5 text-green-400" /> Activity Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Assets", value: stats.media, icon: ImageIcon, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Total Interactions", value: stats.likes, icon: Heart, color: "text-pink-400", bg: "bg-pink-500/10" }, // 🚀 LIKES COUNTER
                  { label: "Active Albums", value: stats.events, icon: FolderPlus, color: "text-purple-400", bg: "bg-purple-500/10" },
                  { label: "Registered Users", value: stats.users, icon: Users, color: "text-green-400", bg: "bg-green-500/10" },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col justify-between hover:bg-white/10 transition-colors duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-extrabold text-white mb-1">{stat.value}</h3>
                      <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Events & Actions */}
            <div className="lg:col-span-2 space-y-12">
              {/* Workspace Actions */}
              {canUpload && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 tracking-wide text-gray-300">
                    Workspace Actions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => router.push("/uploads")} className="bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 p-6 rounded-3xl flex items-center justify-between transition-all duration-300 text-left group">
                      <div className="flex items-center gap-5">
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">Upload Studio</h3>
                          <p className="text-sm text-gray-400">Upload photos and videos</p>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => router.push("/albums")} className="bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 p-6 rounded-3xl flex items-center justify-between transition-all duration-300 text-left group">
                      <div className="flex items-center gap-5">
                        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <FolderPlus className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">Create Event</h3>
                          <p className="text-sm text-gray-400">Generate a new album</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Recent Event Vaults */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 tracking-wide text-gray-300">
                  <Eye className="w-5 h-5 text-blue-400" /> Recent Albums
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {recentEvents.length === 0 ? (
                    <div className="col-span-2 p-12 text-center border border-white/10 rounded-[2rem] bg-white/5 text-gray-400">
                      <p className="text-sm">There are no public albums currently available.</p>
                    </div>
                  ) : (
                    recentEvents.map((event, index) => {
                      const isPrivate = event.albums?.[0] ? !event.albums[0].isPublic : false;
                      return (
                        <div key={event.id} onClick={() => router.push(`/albums/${event.id}`)} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-xl group">
                          <div className="flex justify-between items-start mb-6">
                            <div className="bg-black/50 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-300 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-blue-400" />
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            {isPrivate && (
                              <div className="bg-red-500/20 text-red-400 p-2 rounded-xl border border-red-500/20" title="Private Album"><Lock className="w-4 h-4" /></div>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-blue-300 transition-colors">{event.name}</h3>
                          <p className="text-sm text-gray-400 mb-6 font-medium">{event.category}</p>
                          <div className="flex items-center text-xs text-blue-400 font-bold uppercase tracking-wider">
                            View Assets <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>

            {/* 🚀 THE FIX: RIGHT COLUMN (Recently Uploaded Media Feed) */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-3 tracking-wide text-gray-300">
                <Clock className="w-5 h-5 text-purple-400" /> Recent Activity
              </h2>
              
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 h-[600px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center mt-10">No recent media uploads.</p>
                ) : (
                  recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-2xl transition-colors group">
                      
                      {/* 🚀 THE FIX: Dynamic Icons based on Activity Type */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 relative border border-white/10">
                        {activity.type === 'USER_JOINED' ? (
                          <div className="w-full h-full flex items-center justify-center bg-green-500/10 border border-green-500/20">
                            <UserPlus className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform duration-500" />
                          </div>
                        ) : activity.type === 'VIDEO_UPLOAD' ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <Video className="w-6 h-6 text-white/50 group-hover:scale-110 transition-transform duration-500" />
                          </div>
                        ) : (
                          <img src={activity.previewUrl || "/placeholder.jpg"} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm text-gray-300 leading-tight">
                          <span className="font-bold text-white">{activity.user}</span> {activity.action}{" "}
                          {activity.target && (
                            <span className="font-bold text-blue-400 cursor-pointer hover:underline">{activity.target}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}
