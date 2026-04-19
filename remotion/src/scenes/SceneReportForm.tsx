import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Caption } from "../components/Caption";
import { Cursor } from "../components/Cursor";
import { BrowserChrome } from "../components/BrowserChrome";

const CATEGORIES = ["Abuse", "Neglect", "Child labor", "Trafficking", "Early marriage", "School safety", "Other"];

export const SceneReportForm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const formIn = spring({ frame: frame - 5, fps, config: { damping: 200 } });
  const formY = interpolate(formIn, [0, 1], [40, 0]);
  const formOpacity = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });

  // Cursor highlights category 0 (Abuse) at ~frame 60
  const selectedCat = frame >= 60 ? 0 : -1;
  const langPicked = frame >= 110;
  const typedChars = Math.max(0, Math.min(120, Math.floor((frame - 130) * 1.6)));
  const description = "A neighbor's child has been missing school and shows signs of distress.";
  const typed = description.slice(0, typedChars);

  // Submit button highlight
  const submitGlow = interpolate(frame, [195, 215], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #0B1020 0%, #1E1B4B 100%)" }}>
      <BrowserChrome url="childvoice.gm/report">
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "40px 80px",
            opacity: formOpacity,
            transform: `translateY(${formY}px)`,
            fontFamily: "Inter, sans-serif",
            color: "#0B1020",
            background: "#FAFBFD",
            overflow: "hidden",
          }}
        >
          <h2 style={{ fontSize: 44, margin: 0, fontWeight: 700, letterSpacing: -1 }}>
            Submit a Report
          </h2>
          <p style={{ fontSize: 20, color: "#5B6478", marginTop: 8 }}>
            Your identity stays private. Choose your language and tell us what happened.
          </p>

          {/* Language pills */}
          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {["English", "Mandinka", "Wolof", "Fula", "Jola"].map((l, i) => {
              const active = langPicked && i === 1;
              return (
                <div
                  key={l}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 999,
                    border: active ? "2px solid #F59E0B" : "1px solid #D6DAE5",
                    background: active ? "#FEF3C7" : "#FFFFFF",
                    fontSize: 20,
                    fontWeight: active ? 600 : 500,
                    color: active ? "#92400E" : "#3A4258",
                  }}
                >
                  {l}
                </div>
              );
            })}
          </div>

          {/* Categories grid */}
          <div style={{ marginTop: 28, fontSize: 18, fontWeight: 600, color: "#3A4258" }}>
            Category
          </div>
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
            }}
          >
            {CATEGORIES.map((c, i) => {
              const active = i === selectedCat;
              return (
                <div
                  key={c}
                  style={{
                    padding: "20px 18px",
                    borderRadius: 12,
                    border: active ? "2px solid #DC2626" : "1px solid #D6DAE5",
                    background: active ? "#FEE2E2" : "#FFFFFF",
                    fontSize: 20,
                    fontWeight: active ? 600 : 500,
                    color: active ? "#991B1B" : "#3A4258",
                    boxShadow: active ? "0 6px 20px rgba(220,38,38,0.18)" : "none",
                  }}
                >
                  {c}
                </div>
              );
            })}
          </div>

          {/* Description textarea */}
          <div style={{ marginTop: 28, fontSize: 18, fontWeight: 600, color: "#3A4258" }}>
            Description
          </div>
          <div
            style={{
              marginTop: 12,
              minHeight: 130,
              borderRadius: 12,
              border: "1px solid #D6DAE5",
              background: "#FFFFFF",
              padding: "18px 22px",
              fontSize: 22,
              lineHeight: 1.5,
              color: "#3A4258",
            }}
          >
            {typed}
            {typedChars < description.length && typedChars > 0 && (
              <span style={{ opacity: Math.round(frame / 8) % 2 === 0 ? 1 : 0 }}>|</span>
            )}
          </div>

          {/* Submit button */}
          <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
            <div
              style={{
                padding: "18px 44px",
                borderRadius: 12,
                background: "#0B1020",
                color: "#FFFFFF",
                fontSize: 22,
                fontWeight: 600,
                boxShadow: `0 0 ${submitGlow * 30}px rgba(245,158,11,${submitGlow * 0.7})`,
                border: `2px solid ${submitGlow > 0.3 ? "#F59E0B" : "transparent"}`,
              }}
            >
              Submit Report
            </div>
          </div>
        </div>

        <Cursor
          points={[
            { x: 1100, y: 60, frame: 0 },
            { x: 350, y: 195, frame: 50 },   // language Mandinka area
            { x: 350, y: 195, frame: 70 },
            { x: 280, y: 360, frame: 100 },  // Abuse category
            { x: 280, y: 360, frame: 120 },
            { x: 600, y: 560, frame: 145 },  // textarea
            { x: 600, y: 560, frame: 195 },
            { x: 1370, y: 720, frame: 215 }, // submit
          ]}
          clickFrames={[55, 105, 215]}
        />
      </BrowserChrome>

      <Caption text="Anyone can file a report in five Gambian languages — anonymously, in seconds." delay={20} />
    </AbsoluteFill>
  );
};
