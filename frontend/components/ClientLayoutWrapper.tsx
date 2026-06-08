"use client";

import NotificationToasts from "./NotificationToasts";
// If you are using a Context Provider for sockets, import it here:
// import { NotificationProvider } from "@/context/NotificationContext";

interface WrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: WrapperProps) {
  return (
    <>
      {/* 🚀 THE FIX: We still pass children straight through to prevent double-sidebars, 
          BUT we mount the global WebSocket listener and Toasts back into the DOM! */}
      
      {/* <NotificationProvider> Uncomment this wrapper if your app uses a Context Provider */}
        <NotificationToasts />
        {children}
      {/* </NotificationProvider> */}
    </>
  );
}