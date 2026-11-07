// Background sync: flush pending offline reports to Supabase when online.
// Runs on mount and whenever the browser regains connectivity. Also tries to
// register a real Background Sync (Chromium/Android) so submissions go out
// even if the user closes the tab — falls back gracefully where unsupported.

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  countPending,
  listPending,
  removePending,
  updatePending,
  type PendingReport,
} from "@/lib/offline-queue";

async function flushOne(r: PendingReport): Promise<boolean> {
  try {
    const { data: newId, error } = await supabase.rpc(
      "submit_report",
      r.payload as never
    );
    if (error || !newId) throw error ?? new Error("submit_report failed");
    const reportId = newId as string;

    for (const m of r.media) {
      const ext = m.filename.split(".").pop() || "bin";
      const path = `${reportId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("report-media")
        .upload(path, m.blob, { contentType: m.mimeType });
      if (upErr) {
        console.error("offline-sync upload error", upErr);
        continue;
      }

      await supabase.from("report_media").insert({
        report_id: reportId,
        kind: m.kind,
        storage_path: path,
        mime_type: m.mimeType,
        size_bytes: m.blob.size,
        transcription: null,
      });
    }

    await removePending(r.id);
    return true;
  } catch (e) {
    console.error("offline-sync failed for", r.id, e);
    await updatePending({
      ...r,
      attempts: r.attempts + 1,
      lastError: e instanceof Error ? e.message : String(e),
    });
    return false;
  }
}

async function tryBackgroundSync() {
  if (typeof navigator === "undefined") return;
  try {
    const reg = await navigator.serviceWorker?.ready;
    const sync = (reg as unknown as { sync?: { register: (tag: string) => Promise<void> } })?.sync;
    if (sync) await sync.register("flush-pending-reports");
  } catch {
    /* not supported (Safari/iOS) */
  }
}

export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const flushing = useRef(false);

  const refreshCount = async () => setPendingCount(await countPending());

  const flush = async () => {
    if (flushing.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    flushing.current = true;
    try {
      const items = await listPending();
      if (items.length === 0) return;
      let success = 0;
      for (const r of items) {
        const ok = await flushOne(r);
        if (ok) success++;
      }
      await refreshCount();
      if (success > 0) {
        toast.success(
          success === 1
            ? "1 offline report submitted"
            : `${success} offline reports submitted`
        );
      }
    } finally {
      flushing.current = false;
    }
  };

  useEffect(() => {
    void refreshCount();
    void tryBackgroundSync();
    void flush();

    const onOnline = () => {
      void tryBackgroundSync();
      void flush();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void flush();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { pendingCount, flush };
}
