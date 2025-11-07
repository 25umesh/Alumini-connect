// src/hooks/useRealtimeListener.ts
import { useEffect } from "react";

/** Generic placeholder for any real-time websocket or event listener you may add later */
export default function useRealtimeListener(eventName: string, handler: (...args:any[]) => void) {
  useEffect(() => {
    // TODO: add websocket or SSE subscription
    return () => {
      // cleanup
    };
  }, [eventName]);
}
