"use client";

import { useState, useEffect } from "react";

export default function useRole() {
  const [role, setRole] = useState<string>("VIEWER"); 
  const [user, setUser] = useState<any>(null); 
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); 
    const userStr = localStorage.getItem("user"); 
    
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser); 
        if (parsedUser.role) setRole(parsedUser.role.toUpperCase());
      } catch (error) {
        console.error("Failed to parse role", error);
      }
    }
  }, []);

  return {
    isMounted,
    role,
    user, 
    
    isAdmin: role === "ADMIN",
    // 🚀 THE FIX: We merge Photographer and Club Member so they share identical UI/Access
    isPhotographer: role === "PHOTOGRAPHER" || role === "CLUB_MEMBER", 
    isMember: role === "CLUB_MEMBER",
    isViewer: role === "VIEWER",
    
    // Both roles can now upload
    canUpload: role === "ADMIN" || role === "PHOTOGRAPHER" || role === "CLUB_MEMBER",
    
    // Both roles can now delete media
    canDelete: role === "ADMIN" || role === "PHOTOGRAPHER" || role === "CLUB_MEMBER",
    
    // Only Admins can manage access
    canManageAccess: role === "ADMIN",
  };
}