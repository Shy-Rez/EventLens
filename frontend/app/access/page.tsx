"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Users, UserPlus, Loader2, X, CheckCircle2, Camera, Trash2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";

export default function AccessControlPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("CLUB_MEMBER"); // 🔥 Default now matches Enum

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch("https://eventlens-backend-cufi.onrender.com/api/users");
      const data = await res.json();
      if (data.success) {
        const sorted = data.users.sort((a: any, b: any) => {
          if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
          if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
          return 0;
        });
        setUsers(sorted);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Role Change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`https://eventlens-backend-cufi.onrender.com/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert("Failed to update role. Please ensure the backend route is added.");
      }
    } catch (error) {
      console.error("Failed to update role", error);
    }
  };

  // Handle User Deletion
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;

    try {
      const res = await fetch(`https://eventlens-backend-cufi.onrender.com/api/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert("Failed to delete user.");
      }
    } catch (error) {
      console.error("Deletion error:", error);
    }
  };

  // Handle Add New User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("https://eventlens-backend-cufi.onrender.com/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newUserName, 
          email: newUserEmail, 
          role: newUserRole 
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setUsers([data.user, ...users]); 
        setIsAddModalOpen(false);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserRole("CLUB_MEMBER"); // 🔥 Reset to safe default
      } else {
         alert("Failed to add user. Check backend console.");
      }
    } catch (error) {
      console.error("Failed to add user", error);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-8">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-400" />
                Access Control
              </h1>
              <p className="text-gray-400 mt-2">Manage team roles, club members, and permissions.</p>
            </div>
            
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
            >
              <UserPlus className="w-4 h-4" /> Add Member
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                    <th className="p-5 font-semibold">User</th>
                    <th className="p-5 font-semibold">Email</th>
                    <th className="p-5 font-semibold">Joined</th>
                    <th className="p-5 font-semibold text-right">Role & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <motion.tr 
                      key={user.id} 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-5 text-gray-400">{user.email}</td>
                      <td className="p-5 text-gray-500 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-3">
                          
                          {/* 👑 Role Badges */}
                          {user.role === 'ADMIN' && <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Shield className="w-3 h-3"/> ADMIN</span>}
                          {user.role === 'PHOTOGRAPHER' && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Camera className="w-3 h-3"/> PHOTOGRAPHER</span>}
                          {/* 🔥 Updated badge to check for CLUB_MEMBER */}
                          {user.role === 'CLUB_MEMBER' && <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Users className="w-3 h-3"/> MEMBER</span>}
                          {user.role === 'VIEWER' && <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">VIEWER</span>}
                          
                          {/* 🔥 The Dropdown with Safe Enum Values */}
                          <select 
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-black/50 border border-white/10 text-white text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="PHOTOGRAPHER">Photographer</option>
                            {/* 🔥 Ensure the value perfectly matches the backend Enum */}
                            <option value="CLUB_MEMBER">Member</option>
                            <option value="VIEWER">Viewer</option>
                          </select>

                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg transition opacity-0 group-hover:opacity-100 ml-2"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-500">
                        No users found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* --- ADD USER MODAL --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#111] border border-white/10 p-8 rounded-3xl w-full max-w-md relative shadow-2xl"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="absolute top-6 right-6 text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-400" /> Add New Member
              </h2>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
                  <input 
                    type="text" required value={newUserName} onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email Address</label>
                  <input 
                    type="email" required value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g. john@college.edu"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Assign Role</label>
                  <select 
                    value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="VIEWER">Viewer (Public Albums Only)</option>
                    {/* 🔥 Ensure the value perfectly matches the backend Enum */}
                    <option value="CLUB_MEMBER">Member (Upload Access)</option>
                    <option value="PHOTOGRAPHER">Photographer (Verified Uploader)</option>
                    <option value="ADMIN">Admin (Full Control)</option>
                  </select>
                </div>
                
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg mt-4">
                  Confirm & Add User
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
