import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NotificationToasts from "@/components/NotificationToasts";
import SessionGuard from "@/components/SessionGuard";
import OfflineManager from "@/components/OfflineManager";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventMedia Platform",
  description: "Premium Event & Media Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        

        <OfflineManager />
        

        <ClientLayoutWrapper>

          <SessionGuard />
          {children}
        </ClientLayoutWrapper>
        

        <NotificationToasts />
        
      </body>
    </html>
  );
}