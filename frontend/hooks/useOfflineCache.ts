"use client";

export function useOfflineCache() {
  const writeCacheRecord = (key: string, data: any) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`offline_cache_${key}`, JSON.stringify({
        payload: data,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.error("Local storage serialization failure:", e);
    }
  };

  const readCacheRecord = (key: string): any | null => {
    if (typeof window === "undefined") return null;
    try {
      const storedItem = localStorage.getItem(`offline_cache_${key}`);
      if (!storedItem) return null;
      
      const parsedRecord = JSON.parse(storedItem);
      console.log(`[Offline Cache Engine] Loaded fallback payload metrics for key: ${key}`);
      return parsedRecord.payload;
    } catch (e) {
      return null;
    }
  };

  return { writeCacheRecord, readCacheRecord };
}