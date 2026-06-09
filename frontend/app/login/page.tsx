"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Shield, Camera, Users, Eye, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");

    const loginEmail = directEmail || email;
    const loginPassword = directEmail ? "password123" : password;

    console.log(`[Login Attempt] Sending -> Email: ${loginEmail}, Password: ${loginPassword}`);

    try {
      const res = await fetch("https://eventlens-backend-cufi.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      console.log("[Backend Response] ->", data);

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "/"; 
        
      }else {
        setError(data.message || "Invalid credentials");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("[Network Error] ->", err);
      setError("Failed to connect to the authentication server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center relative overflow-hidden">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 z-10 px-6">
        
        <div className="flex-1 text-center md:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 mb-6 flex items-center justify-center mx-auto md:mx-0 shadow-lg shadow-blue-500/30">
            <span className="text-white font-extrabold text-3xl">C</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4">
            Event <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Lens</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
            A media vault for college communities with access control, facial recognition, and infinite cloud galleries.
          </p>
        </div>

        {/* Right Side: Login Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Access Gateway</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 mb-8">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                placeholder="Work Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Authenticate <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="border-t border-white/10 pt-6">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold text-center mb-4">Judge Evaluation Hub</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={(e) => handleLogin(e, "admin@club.edu")} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition text-xs font-bold border border-red-500/20">
                <Shield className="w-3.5 h-3.5" /> Admin
              </button>
              <button onClick={(e) => handleLogin(e, "photo@club.edu")} className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition text-xs font-bold border border-blue-500/20">
                <Camera className="w-3.5 h-3.5" /> Photographer
              </button>
              <button onClick={(e) => handleLogin(e, "member@club.edu")} className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition text-xs font-bold border border-green-500/20">
                <Users className="w-3.5 h-3.5" /> Member
              </button>
              <button onClick={(e) => handleLogin(e, "viewer@club.edu")} className="flex items-center gap-2 p-2 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 transition text-xs font-bold border border-gray-500/20">
                <Eye className="w-3.5 h-3.5" /> Viewer
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
