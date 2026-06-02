import { useEffect, useState } from "react";
import { WifiOff, CloudUpload } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useOfflineSync } from "@/lib/offline-sync";

export function OnlineStatusBanner() {
  const online = useOnlineStatus();
  const { pendingCount } = useOfflineSync();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (!online) {
    return (
      <div
        role="status"
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-center text-sm font-medium text-destructive-foreground shadow"
      >
        <WifiOff className="h-4 w-4" />
        <span>You are offline. Reports you submit will sync automatically when reconnected.</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div
        role="status"
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground shadow"
      >
        <CloudUpload className="h-4 w-4 animate-pulse" />
        <span>
          Syncing {pendingCount} pending report{pendingCount === 1 ? "" : "s"}…
        </span>
      </div>
    );
  }

  return null;
}
