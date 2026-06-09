"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/login" || pathname === "/signup") {
      return;
    }

    const userSessionStore = localStorage.getItem("user");

    if (!userSessionStore) {
      router.push("/login");
    }
  }, [pathname, router]);

  return null;
}