import React from "react";
import Sidebar from "../../../components/Sidebar";
import MediaUploadZone from "../../../components/MediaUploadZone";
import MediaGallery from "../../../components/MediaGallery";

export default async function EventStudioPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden">
      
      <div className="w-64 flex-shrink-0 border-r border-white/10">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Event Studio</h1>
            <p className="text-gray-400">
              Unique Event ID: <span className="text-blue-400 font-mono text-sm">{eventId}</span>
            </p>
          </header>

          <MediaUploadZone eventId={eventId} />
          
          <div className="mt-8">
            <MediaGallery eventId={eventId} />
          </div>
        </div>
      </main>
    </div>
  );
}