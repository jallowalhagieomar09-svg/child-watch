import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  initInstallPromptListener,
  isIos,
  isStandalone,
  subscribeInstallAvailability,
  triggerInstallPrompt,
} from "@/lib/pwa";

const DISMISS_KEY = "cvgm-install-dismissed";

export function InstallPrompt() {
  const [available, setAvailable] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true); // start hidden until we check

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wasDismissed = localStorage.getItem(DISMISS_KEY) === "1";
    setDismissed(wasDismissed);

    const cleanupListener = initInstallPromptListener();
    const unsub = subscribeInstallAvailability((a) => setAvailable(a));

    // iOS Safari has no beforeinstallprompt — show manual hint if not installed.
    if (isIos() && !isStandalone() && !wasDismissed) {
      // Delay a moment so it doesn't compete with the splash.
      const t = setTimeout(() => setShowIosHint(true), 2500);
      return () => {
        clearTimeout(t);
        cleanupListener();
        unsub();
      };
    }

    return () => {
      cleanupListener();
      unsub();
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
    setShowIosHint(false);
  };

  if (dismissed || isStandalone()) return null;

  if (available) {
    return (
      <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,420px)] -translate-x-1/2 rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Install Child Voice GM</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Install the app for faster access and full offline use.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => void triggerInstallPrompt().then(dismiss)}>
                Install
              </Button>
              <Button size="sm" variant="ghost" onClick={dismiss}>
                Not now
              </Button>
            </div>
          </div>
          <button onClick={dismiss} aria-label="Dismiss" className="text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (showIosHint) {
    return (
      <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,420px)] -translate-x-1/2 rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Share className="h-5 w-5" />
          </div>
          <div className="flex-1 text-sm">
            <p className="font-semibold">Install on iPhone</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tap the <Share className="inline h-3.5 w-3.5" /> Share button, then choose
              <strong> Add to Home Screen</strong> to use Child Voice GM offline.
            </p>
          </div>
          <button onClick={dismiss} aria-label="Dismiss" className="text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
