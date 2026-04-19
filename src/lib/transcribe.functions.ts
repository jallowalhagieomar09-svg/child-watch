import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TranscribeSchema = z.object({
  audioBase64: z.string().min(1).max(20_000_000),
  mimeType: z.string().min(1).max(120),
});

const RetranscribeSchema = z.object({
  mediaId: z.string().uuid(),
});

async function callGateway(audioBase64: string, mimeType: string) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    console.error("Transcription: LOVABLE_API_KEY missing");
    return { text: "", error: "Transcription service not configured" as string | null };
  }
  const dataUrl = `data:${mimeType};base64,${audioBase64}`;
  const format = (mimeType.split("/")[1] || "webm").split(";")[0];
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Transcribe this audio recording verbatim. The audio may be in English, Mandinka, Wolof, Fula (Pulaar), or Jola. Output ONLY the transcribed text — no commentary, no labels, no quotes. If the audio is silent or unintelligible, respond with: [unintelligible]",
            },
            { type: "input_audio", input_audio: { data: dataUrl, format } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("Transcription API error:", res.status, body);
    return { text: "", error: `Transcription failed (${res.status})` as string | null };
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json.choices?.[0]?.message?.content?.trim() ?? "";
  console.log("Transcription succeeded, length:", text.length);
  return { text, error: null as string | null };
}

/**
 * Transcribe an uploaded audio chunk (base64) — used during report submission.
 */
export const transcribeAudio = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranscribeSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      return await callGateway(data.audioBase64, data.mimeType);
    } catch (err) {
      console.error("Transcription error:", err);
      return { text: "", error: "Transcription service unavailable" };
    }
  });

/**
 * Staff-only: re-transcribe an existing report_media row by id.
 * Downloads the file from storage server-side and updates the transcription column.
 */
export const retranscribeMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RetranscribeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verify the caller is staff (any role).
    const { data: isStaff } = await supabase.rpc("is_staff", { _user_id: userId });
    if (!isStaff) return { text: "", error: "Forbidden" };

    // Use admin client to read media + storage regardless of RLS quirks.
    const { data: media, error: mErr } = await supabaseAdmin
      .from("report_media")
      .select("id, kind, storage_path, mime_type")
      .eq("id", data.mediaId)
      .maybeSingle();
    if (mErr || !media) return { text: "", error: "Media not found" };
    if (media.kind !== "audio") return { text: "", error: "Not an audio file" };

    const { data: file, error: dlErr } = await supabaseAdmin.storage
      .from("report-media")
      .download(media.storage_path);
    if (dlErr || !file) {
      console.error("download error", dlErr);
      return { text: "", error: "Could not download audio" };
    }

    const buf = await file.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    const mime = media.mime_type || "audio/webm";

    try {
      const result = await callGateway(base64, mime);
      if (result.text) {
        await supabaseAdmin
          .from("report_media")
          .update({ transcription: result.text })
          .eq("id", media.id);
      }
      return result;
    } catch (err) {
      console.error("Retranscribe error:", err);
      return { text: "", error: "Transcription service unavailable" };
    }
  });
