import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Camera,
  Video,
  Mic,
  MapPin,
  Square,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Trash2,
  Copy,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES, generateTrackingCode, type ReportCategory } from "@/lib/report-utils";
import { supabase } from "@/integrations/supabase/client";
import { transcribeAudio } from "@/lib/transcribe.functions";
import { enqueueReport } from "@/lib/offline-queue";

export const Route = createFileRoute("/report")({
  component: ReportFlow,
});

type MediaItem = {
  id: string;
  kind: "image" | "video" | "audio";
  file: File;
  previewUrl: string;
};

function ReportFlow() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [region, setRegion] = useState("");
  const [town, setTown] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        addMedia({
          id: crypto.randomUUID(),
          kind: "audio",
          file,
          previewUrl: URL.createObjectURL(blob),
        });
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const addMedia = (item: MediaItem) => setMedia((m) => [...m, item]);
  const removeMedia = (id: string) => {
    setMedia((m) => {
      const item = m.find((x) => x.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return m.filter((x) => x.id !== id);
    });
  };

  const onPickFile = (kind: "image" | "video", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const max = kind === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > max) {
      toast.error(`File too large (max ${kind === "video" ? "50MB" : "10MB"})`);
      e.target.value = "";
      return;
    }
    addMedia({
      id: crypto.randomUUID(),
      kind,
      file,
      previewUrl: URL.createObjectURL(file),
    });
    e.target.value = "";
  };

  const useGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("Location captured");
      },
      () => toast.error("Could not get location")
    );
  };

  useEffect(() => {
    return () => {
      media.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        resolve(res.split(",")[1] ?? "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const submit = async () => {
    if (!category) return;
    setSubmitting(true);
    const code = generateTrackingCode();
    const cat = CATEGORIES.find((c) => c.key === category);
    const agency = cat?.agency ?? "both";

    const payload = {
      _tracking_code: code,
      _category: category,
      _agency: agency,
      _language: lang,
      _description: description,
      _contact_name: contactName,
      _contact_phone: contactPhone,
      _contact_email: contactEmail,
      _latitude: coords?.lat ?? undefined,
      _longitude: coords?.lng ?? undefined,
      _region: region,
      _town: town,
    };

    // Offline path: queue locally — sync will replay it when reconnected.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      try {
        await enqueueReport({
          id: crypto.randomUUID(),
          trackingCode: code,
          payload,
          media: media.map((m) => ({
            id: m.id,
            kind: m.kind,
            blob: m.file,
            filename: m.file.name,
            mimeType: m.file.type,
          })),
          createdAt: Date.now(),
          attempts: 0,
        });
        // Hint the SW to flush as soon as connectivity returns.
        try {
          const reg = await navigator.serviceWorker?.ready;
          const sync = (reg as unknown as {
            sync?: { register: (tag: string) => Promise<void> };
          })?.sync;
          await sync?.register("flush-pending-reports");
        } catch {
          /* not supported */
        }
        toast.success("Saved offline. We'll submit it when you reconnect.");
        setTrackingCode(code);
        setStep(5);
      } catch (e) {
        console.error(e);
        toast.error(t("error_generic"));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      // 1) Insert report via SECURITY DEFINER RPC (works for anon + authed)
      const { data: newId, error } = await supabase.rpc("submit_report", payload);

      if (error || !newId) throw error ?? new Error("Insert failed");
      const reportId = newId as string;

      // 2) Upload media + insert rows
      for (const m of media) {
        const ext = m.file.name.split(".").pop() || "bin";
        const path = `${reportId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("report-media")
          .upload(path, m.file, { contentType: m.file.type });
        if (upErr) {
          console.error("upload error", upErr);
          continue;
        }

        let transcription: string | null = null;
        if (m.kind === "audio") {
          try {
            const b64 = await fileToBase64(m.file);
            const result = await transcribeAudio({
              data: { audioBase64: b64, mimeType: m.file.type || "audio/webm" },
            });
            if (result.text) transcription = result.text;
          } catch (e) {
            console.error("transcription failed", e);
          }
        }

        await supabase.from("report_media").insert({
          report_id: reportId,
          kind: m.kind,
          storage_path: path,
          mime_type: m.file.type,
          size_bytes: m.file.size,
          transcription,
        });
      }

      setTrackingCode(code);
      setStep(5);
    } catch (e) {
      console.error(e);
      // Network mid-submission — fall back to offline queue so we don't lose data.
      try {
        await enqueueReport({
          id: crypto.randomUUID(),
          trackingCode: code,
          payload,
          media: media.map((m) => ({
            id: m.id,
            kind: m.kind,
            blob: m.file,
            filename: m.file.name,
            mimeType: m.file.type,
          })),
          createdAt: Date.now(),
          attempts: 0,
        });
        toast.success("Saved offline. We'll submit it when you reconnect.");
        setTrackingCode(code);
        setStep(5);
      } catch {
        toast.error(t("error_generic"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = [
    t("step_category"),
    t("step_describe"),
    t("step_location"),
    t("step_contact"),
    t("step_review"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {step < 5 && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              {stepTitles.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <h1 className="mt-4 text-2xl font-semibold">{stepTitles[step]}</h1>
          </div>
        )}

        {/* Step 0: Category */}
        {step === 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => {
                  setCategory(c.key as ReportCategory);
                  setStep(1);
                }}
                className={`flex h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                  category === c.key
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <span className="text-3xl" aria-hidden>
                  {c.emoji}
                </span>
                <span className="text-sm font-medium">{t(`cat_${c.key}`)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Describe + media */}
        {step === 1 && (
          <Card className="space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="desc">{t("describe_text")}</Label>
              <Textarea
                id="desc"
                rows={5}
                maxLength={4000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("describe_text")}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-20 flex-col gap-1"
                onClick={() => photoInput.current?.click()}
              >
                <Camera className="h-5 w-5" />
                <span className="text-xs">{t("add_photo")}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-20 flex-col gap-1"
                onClick={() => videoInput.current?.click()}
              >
                <Video className="h-5 w-5" />
                <span className="text-xs">{t("add_video")}</span>
              </Button>
              <Button
                type="button"
                variant={recording ? "destructive" : "outline"}
                className="h-20 flex-col gap-1"
                onClick={recording ? stopRecording : startRecording}
              >
                {recording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                <span className="text-xs">
                  {recording ? t("stop_recording") : t("record_voice")}
                </span>
              </Button>
            </div>

            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => onPickFile("image", e)}
            />
            <input
              ref={videoInput}
              type="file"
              accept="video/*"
              capture="environment"
              hidden
              onChange={(e) => onPickFile("video", e)}
            />

            {media.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {media.map((m) => (
                  <div key={m.id} className="relative rounded-lg border bg-muted p-1">
                    {m.kind === "image" && (
                      <img
                        src={m.previewUrl}
                        alt="preview"
                        className="h-20 w-full rounded object-cover"
                      />
                    )}
                    {m.kind === "video" && (
                      <video src={m.previewUrl} className="h-20 w-full rounded object-cover" />
                    )}
                    {m.kind === "audio" && (
                      <div className="flex h-20 items-center justify-center">
                        <Mic className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      onClick={() => removeMedia(m.id)}
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground"
                      type="button"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <Card className="space-y-4 p-5">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full"
              onClick={useGeolocation}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {t("use_my_location")}
            </Button>
            {coords && (
              <p className="text-xs text-muted-foreground">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="region">{t("region")}</Label>
              <Input
                id="region"
                value={region}
                maxLength={120}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="town">{t("town")}</Label>
              <Input
                id="town"
                value={town}
                maxLength={120}
                onChange={(e) => setTown(e.target.value)}
              />
            </div>
          </Card>
        )}

        {/* Step 3: Contact */}
        {step === 3 && (
          <Card className="space-y-4 p-5">
            <p className="text-sm text-muted-foreground">{t("contact_note")}</p>
            <div className="space-y-1.5">
              <Label htmlFor="cn">{t("contact_name")}</Label>
              <Input
                id="cn"
                value={contactName}
                maxLength={120}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp">{t("contact_phone")}</Label>
              <Input
                id="cp"
                type="tel"
                value={contactPhone}
                maxLength={40}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ce">{t("contact_email")}</Label>
              <Input
                id="ce"
                type="email"
                value={contactEmail}
                maxLength={200}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
          </Card>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <Card className="space-y-3 p-5">
            <Row label={t("step_category")} value={category ? t(`cat_${category}`) : ""} />
            <Row label={t("step_describe")} value={description || "—"} />
            <Row label={t("region")} value={region || "—"} />
            <Row label={t("town")} value={town || "—"} />
            <Row
              label="GPS"
              value={coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "—"}
            />
            <Row label={t("contact_name")} value={contactName || "—"} />
            <Row label="Media" value={`${media.length}`} />
          </Card>
        )}

        {/* Step 5: Done */}
        {step === 5 && trackingCode && (
          <Card className="space-y-4 p-6 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h2 className="text-2xl font-semibold">{t("thank_you")}</h2>
            <div>
              <p className="text-sm text-muted-foreground">{t("tracking_code_label")}</p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <code className="rounded-md bg-muted px-3 py-2 text-lg font-mono font-semibold tracking-wider">
                  {trackingCode}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(trackingCode);
                    toast.success("Copied");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{t("save_code")}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild variant="outline">
                <Link to="/track">{t("track_report")}</Link>
              </Button>
              <Button asChild>
                <Link to="/">{t("back")}</Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Nav buttons */}
        {step > 0 && step < 5 && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t("back")}
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                {t("next")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => void submit()} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    {t("submitting")}
                  </>
                ) : (
                  t("submit")
                )}
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium">{value}</span>
    </div>
  );
}
