import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES, type ReportStatus } from "@/lib/report-utils";

export const Route = createFileRoute("/staff/reports/$id")({
  component: ReportDetail,
});

type Report = {
  id: string;
  tracking_code: string;
  category: string;
  agency: string;
  status: ReportStatus;
  language: string;
  description: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  region: string | null;
  town: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

type Media = {
  id: string;
  kind: "image" | "video" | "audio";
  storage_path: string;
  mime_type: string | null;
  transcription: string | null;
  signedUrl?: string;
};

type StatusEvent = {
  id: string;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_at: string;
};

function ReportDetail() {
  const { id } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();

  const [report, setReport] = useState<Report | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [events, setEvents] = useState<StatusEvent[]>([]);
  const [newStatus, setNewStatus] = useState<ReportStatus | "">("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data: r } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    setReport(r as Report | null);
    if (r) setNewStatus((r as Report).status);

    const { data: m } = await supabase
      .from("report_media")
      .select("id, kind, storage_path, mime_type, transcription")
      .eq("report_id", id);
    const mediaRows = (m as Media[]) ?? [];
    // Get signed URLs
    for (const item of mediaRows) {
      const { data: signed } = await supabase.storage
        .from("report-media")
        .createSignedUrl(item.storage_path, 3600);
      item.signedUrl = signed?.signedUrl;
    }
    setMedia(mediaRows);

    const { data: e } = await supabase
      .from("report_status_events")
      .select("id, from_status, to_status, note, created_at")
      .eq("report_id", id)
      .order("created_at", { ascending: false });
    setEvents((e as StatusEvent[]) ?? []);
  };

  useEffect(() => {
    if (authLoading || !user) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, authLoading]);

  const saveStatus = async () => {
    if (!report || !newStatus || !user) return;
    setSaving(true);
    const fromStatus = report.status;
    const { error: updErr } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", report.id);
    if (updErr) {
      toast.error(updErr.message);
      setSaving(false);
      return;
    }
    await supabase.from("report_status_events").insert({
      report_id: report.id,
      actor_user_id: user.id,
      from_status: fromStatus,
      to_status: newStatus,
      note: note.trim() || null,
      is_internal: false,
    });
    setNote("");
    setSaving(false);
    toast.success("Updated");
    void load();
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Button asChild variant="ghost" size="sm">
          <Link to="/staff">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t("dashboard")}
          </Link>
        </Button>

        <Card className="space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <code className="font-mono text-base font-semibold">{report.tracking_code}</code>
            <div className="flex gap-2">
              <Badge variant="outline">{report.agency}</Badge>
              <Badge>{t(`st_${report.status}`)}</Badge>
            </div>
          </div>
          <Field label={t("step_category")} value={t(`cat_${report.category}`)} />
          <Field label={t("language")} value={report.language} />
          <Field label={t("region")} value={report.region ?? "—"} />
          <Field label={t("town")} value={report.town ?? "—"} />
          <Field
            label="GPS"
            value={
              report.latitude && report.longitude
                ? `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`
                : "—"
            }
          />
          <Field label={t("contact_name")} value={report.contact_name ?? "—"} />
          <Field label={t("contact_phone")} value={report.contact_phone ?? "—"} />
          <Field label={t("contact_email")} value={report.contact_email ?? "—"} />
          {report.description && (
            <div>
              <div className="text-xs text-muted-foreground">{t("step_describe")}</div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{report.description}</p>
            </div>
          )}
        </Card>

        {media.length > 0 && (
          <Card className="space-y-3 p-5">
            <h2 className="text-sm font-semibold">Media</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {media.map((m) => (
                <div key={m.id} className="rounded-md border p-2">
                  {m.kind === "image" && m.signedUrl && (
                    <img src={m.signedUrl} alt="" className="w-full rounded" />
                  )}
                  {m.kind === "video" && m.signedUrl && (
                    <video src={m.signedUrl} controls className="w-full rounded" />
                  )}
                  {m.kind === "audio" && m.signedUrl && (
                    <audio src={m.signedUrl} controls className="w-full" />
                  )}
                  {m.transcription && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-semibold">Transcript: </span>
                      {m.transcription}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="space-y-3 p-5">
          <h2 className="text-sm font-semibold">{t("update_status")}</h2>
          <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ReportStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`st_${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder={t("add_note")}
            value={note}
            maxLength={1000}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button onClick={() => void saveStatus()} disabled={saving}>
            {saving ? t("loading") : t("save")}
          </Button>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold">History</h2>
          <ul className="mt-3 space-y-2">
            {events.length === 0 && (
              <li className="text-xs text-muted-foreground">No history yet.</li>
            )}
            {events.map((ev) => (
              <li key={ev.id} className="border-b border-border pb-2 last:border-0">
                <div className="text-xs text-muted-foreground">
                  {new Date(ev.created_at).toLocaleString()}
                </div>
                <div className="text-sm">
                  {ev.from_status ? `${t(`st_${ev.from_status}`)} → ` : ""}
                  {ev.to_status ? t(`st_${ev.to_status}`) : ""}
                </div>
                {ev.note && <div className="mt-1 text-sm text-muted-foreground">{ev.note}</div>}
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
