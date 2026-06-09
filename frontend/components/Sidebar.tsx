"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Image as ImageIcon, 
  UploadCloud, 
  ScanFace, 
  ListFilter, 
  ShieldAlert, 
  LogOut, 
  Database 
} from "lucide-react";
import useRole from "@/hooks/useRole";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, isMounted } = useRole();

  if (!isMounted) return null;

  const navLinks = [
    { name: "Dashboard", href: "/", icon: Home, roles: ["ADMIN", "PHOTOGRAPHER", "CLUB_MEMBER", "VIEWER"] },
    { name: "Events and Albums", href: "/albums", icon: ImageIcon, roles: ["ADMIN", "PHOTOGRAPHER", "CLUB_MEMBER", "VIEWER"] },
    { name: "Upload Studio", href: "/uploads", icon: UploadCloud, roles: ["ADMIN", "PHOTOGRAPHER", "CLUB_MEMBER"] },
    { name: "Advanced Search", href: "/advanced-search", icon: ListFilter, roles: ["ADMIN", "PHOTOGRAPHER", "CLUB_MEMBER", "VIEWER"] },
    { name: "Facial Recognition", href: "/search", icon: ScanFace, roles: ["ADMIN", "PHOTOGRAPHER", "CLUB_MEMBER", "VIEWER"] },
    { name: "Storage", href: "/storage", icon: Database, roles: ["ADMIN"] },
    { name: "Access Control", href: "/access", icon: ShieldAlert, roles: ["ADMIN"] },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };

  return (
    <aside className="w-64 h-full bg-[#050505] border-r border-white/10 flex flex-col justify-between flex-shrink-0">
      <div>
        <div className="h-20 flex items-center px-8 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 mr-3 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-wide">
            EventLens
          </h1>
        </div>

        <nav className="p-4 space-y-1.5 mt-4">
          {navLinks.map((link) => {
            if (!link.roles.includes(role || "VIEWER")) return null;
            
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/20 shadow-lg" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                <span className="font-semibold tracking-wide text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="bg-black/50 border border-white/10 p-4 rounded-2xl mb-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Active Profile</p>
          <p className="text-sm text-white font-bold truncate">Workspace Account</p>
          <p className="text-xs text-blue-400 font-bold mt-1 uppercase">{role.replace("_", " ")}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors border border-red-500/20"
        >
          <LogOut className="w-4 h-4 mr-2" /> End Session
        </button>
      </div>
    </aside>
  );
}