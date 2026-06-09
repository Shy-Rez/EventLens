"use client";

import NotificationToasts from "./NotificationToasts";


interface WrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: WrapperProps) {
  return (
    <>

        <NotificationToasts />
        {children}

    </>
  );
}