// Service worker + install prompt management.
// Strict guards prevent the SW from ever registering inside the Lovable
// editor preview iframe or on preview hosts (which would cache stale builds).

export function isPreviewEnvironment(): boolean {
  if (typeof window === "undefined") return true;
  // Inside an iframe — Lovable editor preview always is.
  let inIframe = false;
  try {
    inIframe = window.self !== window.top;
  } catch {
    inIframe = true;
  }
  const host = window.location.hostname;
  const isLovablePreview =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host.includes("lovableproject-dev.com") ||
    host.startsWith("preview--");
  return inIframe || isLovablePreview;
}

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  if (isPreviewEnvironment()) {
    // Defensive: clean up any SW that may have been registered previously
    // so the editor preview never serves stale cached HTML.
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    } catch {
      /* ignore */
    }
    return;
  }

  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (err) {
    console.warn("Service worker registration failed:", err);
  }
}

// ---------------- Install prompt (Android / desktop Chrome) ----------------

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(available: boolean) => void>();

export function initInstallPromptListener(): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((cb) => cb(true));
  };
  const installedHandler = () => {
    deferredPrompt = null;
    listeners.forEach((cb) => cb(false));
  };
  window.addEventListener("beforeinstallprompt", handler);
  window.addEventListener("appinstalled", installedHandler);
  return () => {
    window.removeEventListener("beforeinstallprompt", handler);
    window.removeEventListener("appinstalled", installedHandler);
  };
}

export function subscribeInstallAvailability(cb: (available: boolean) => void): () => void {
  listeners.add(cb);
  cb(deferredPrompt !== null);
  return () => listeners.delete(cb);
}

export async function triggerInstallPrompt(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredPrompt) return "unavailable";
  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  listeners.forEach((cb) => cb(false));
  return choice.outcome;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isIos(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
