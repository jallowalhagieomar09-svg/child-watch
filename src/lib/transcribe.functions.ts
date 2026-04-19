import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TranscribeSchema = z.object({
  audioBase64: z.string().min(1).max(20_000_000),
  mimeType: z.string().min(1).max(120),
});

/**
 * Server function: transcribe an audio recording using Lovable AI Gateway.
 * Accepts base64-encoded audio. Best-effort — falls back gracefully on errors.
 */
export const transcribeAudio = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranscribeSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { text: "", error: "Transcription service not configured" };
    }

    try {
      const dataUrl = `data:${data.mimeType};base64,${data.audioBase64}`;
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You are a transcription assistant. Transcribe the user's audio accurately. The audio may be in English, Mandinka, Wolof, Fula (Pulaar), or Jola. Output only the transcribed text — no commentary.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Transcribe this audio." },
                {
                  type: "input_audio",
                  input_audio: { data: dataUrl, format: data.mimeType.split("/")[1] || "webm" },
                },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("Transcription API error:", res.status, body);
        return { text: "", error: `Transcription failed (${res.status})` };
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = json.choices?.[0]?.message?.content?.trim() ?? "";
      return { text, error: null as string | null };
    } catch (err) {
      console.error("Transcription error:", err);
      return { text: "", error: "Transcription service unavailable" };
    }
  });
