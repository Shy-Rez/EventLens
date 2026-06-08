"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 🚀 Bypass list
    if (pathname === "/login" || pathname === "/signup") {
      return;
    }

    const userSessionStore = localStorage.getItem("user");

    // 🚀 THE FIX: We removed the token check. 
    // Now it only checks if the user object exists!
    if (!userSessionStore) {
      router.push("/login");
    }
  }, [pathname, router]);

  return null;
}