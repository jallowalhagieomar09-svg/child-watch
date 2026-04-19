// Edge function: generate full pitch narration via ElevenLabs and return MP3 bytes.
// Voice: a warm African-English-accented voice (using "Will" as closest available baritone — fallback)
// We pick voice "onwK4e9ZLuTAKqWW03F9" (Daniel — deep, authoritative, can read with African cadence).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// African-English-flavored narrator: use "Daniel" (deep, confident) as closest available
const VOICE_ID = "onwK4e9ZLuTAKqWW03F9";

const SCRIPT = `Across The Gambia, thousands of children suffer abuse, neglect, and exploitation in silence. Reporting these cases is hard. Phone lines go unanswered. Police stations feel intimidating. Language becomes a barrier. And so, the cases never reach the people who can help.

We built Child Voice Gambia to change that.

Child Voice Gambia is a multilingual reporting platform that lets anyone — a child, a teacher, a neighbor — report a case of child abuse in under two minutes. From any phone. In English, Mandinka, Wolof, Fula, or Jola.

Here is how it works. A reporter opens the app and chooses their language. They select what happened — abuse, neglect, child labor, trafficking, early marriage, or a school safety concern. They describe the situation, optionally attach a photo, voice note, or video, and share their location. They can stay completely anonymous.

The moment they submit, the system routes the case to the right agency — the Police, the Department of Social Welfare, or both — and gives the reporter a tracking code. With that code, they can follow the case from received, to under review, to in progress, to resolved.

On the other side, frontline staff log in to a secure dashboard. They see every new case, sorted by urgency. They can update status, leave internal notes, view evidence, and coordinate across agencies — all in one place. Administrators see live statistics: cases per region, response times, resolution rates.

The impact is direct. Faster reporting. Faster response. Real accountability. And for the first time, a national picture of where children are most at risk.

Child Voice Gambia runs on Lovable Cloud — fully serverless, low-cost, and ready to scale. We will reach beneficiaries through schools, community radio, religious leaders, and partnerships with the Ministry of Gender, the Child Protection Alliance, and UNICEF Gambia.

The biggest risks are trust and connectivity. We address trust with anonymity, end-to-end auditability, and community ambassadors. We address connectivity with offline-tolerant submission, USSD fallback, and a lightweight progressive web app that works on any phone.

Child Voice Gambia. Giving every child a voice the system can hear.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: SCRIPT,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.8,
        style: 0.35,
        use_speaker_boost: true,
        speed: 1.0,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return new Response(JSON.stringify({ error: `ElevenLabs ${res.status}: ${errText}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const audio = await res.arrayBuffer();
  return new Response(audio, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "audio/mpeg",
      "Content-Disposition": 'attachment; filename="narration.mp3"',
    },
  });
});
