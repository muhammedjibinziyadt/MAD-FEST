"use client";

import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { Wifi, WifiOff } from "lucide-react";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connectionState, setConnectionState] = useState<string>("connecting");

  useEffect(() => {
    const pusher = getPusherClient();

    const handleConnectionStateChange = (state: string) => {
      setConnectionState(state);
    };

    pusher.connection.bind("state_change", (states: { previous: string; current: string }) => {
      handleConnectionStateChange(states.current);
    });

    handleConnectionStateChange(pusher.connection.state);

    return () => {
      pusher.disconnect();
    };
  }, []);

  return (
    <>
      {children}
      {/* Show connection status in dev mode */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/90 border border-white/10 px-3 py-2 text-xs backdrop-blur-sm shadow-lg">
            {connectionState === "connected" ? (
              <>
                <Wifi className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Real-time Connected</span>
              </>
            ) : connectionState === "connecting" || connectionState === "initialized" ? (
              <>
                <Wifi className="h-3 w-3 text-amber-400 animate-pulse" />
                <span className="text-amber-400 font-medium">Connecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-rose-400" />
                <span className="text-rose-400 font-medium">Disconnected</span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}










