import React from "react";
import Sidebar from "../../../components/Sidebar";
import MediaUploadZone from "../../../components/MediaUploadZone";
import MediaGallery from "../../../components/MediaGallery";

// Next.js 15 requires params to be handled as a Promise
export default async function EventStudioPage({ params }: { params: Promise<{ eventId: string }> }) {
  // Await the params safely
  const { eventId } = await params;

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden">
      
      {/* 1. Fixed Sidebar Layout (Matching the Dashboard) */}
      <div className="w-64 flex-shrink-0 border-r border-white/10">
        <Sidebar />
      </div>

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Event Studio</h1>
            <p className="text-gray-400">
              Unique Event ID: <span className="text-blue-400 font-mono text-sm">{eventId}</span>
            </p>
          </header>

          {/* We dynamically pass the URL parameter straight to our components! */}
          <MediaUploadZone eventId={eventId} />
          
          <div className="mt-8">
            <MediaGallery eventId={eventId} />
          </div>
        </div>
      </main>
    </div>
  );
}