import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Caption } from "../components/Caption";
import { Cursor } from "../components/Cursor";
import { BrowserChrome } from "../components/BrowserChrome";

export const SceneTracking: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const formIn = spring({ frame: frame - 5, fps, config: { damping: 200 } });
  const formOpacity = interpolate(formIn, [0, 1], [0, 1]);

  const code = "CVG-7K2M9X";
  const typed = code.slice(0, Math.max(0, Math.min(code.length, Math.floor((frame - 30) / 4))));

  const showResult = frame >= 110;
  const resultIn = spring({ frame: frame - 110, fps, config: { damping: 18, stiffness: 130 } });
  const resultY = interpolate(resultIn, [0, 1], [30, 0]);
  const resultOpacity = interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #0B1020 0%, #0F2A4F 100%)" }}>
      <BrowserChrome url="childvoice.gm/track">
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "60px 80px",
            opacity: formOpacity,
            fontFamily: "Inter, sans-serif",
            background: "#FAFBFD",
            color: "#0B1020",
          }}
        >
          <h2 style={{ fontSize: 44, margin: 0, fontWeight: 700, letterSpacing: -1 }}>
            Track Your Report
          </h2>
          <p style={{ fontSize: 20, color: "#5B6478", marginTop: 8, maxWidth: 900 }}>
            Enter the tracking code you received after submission. No login required.
          </p>

          <div
            style={{
              marginTop: 40,
              maxWidth: 720,
              padding: 28,
              background: "#FFFFFF",
              borderRadius: 16,
              border: "1px solid #E3E6EE",
              boxShadow: "0 10px 30px rgba(11,16,32,0.06)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600, color: "#3A4258" }}>Tracking code</div>
            <div
              style={{
                marginTop: 12,
                padding: "20px 24px",
                borderRadius: 12,
                border: "2px solid #3B82F6",
                background: "#F8FAFC",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 36,
                letterSpacing: 4,
                color: "#0B1020",
              }}
            >
              {typed}
              {typed.length < code.length && (
                <span style={{ opacity: Math.round(frame / 6) % 2 === 0 ? 1 : 0 }}>|</span>
              )}
            </div>
            <div
              style={{
                marginTop: 18,
                padding: "16px 28px",
                borderRadius: 12,
                background: "#0B1020",
                color: "#FFFFFF",
                display: "inline-block",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              🔍  Lookup
            </div>
          </div>

          {showResult && (
            <div
              style={{
                marginTop: 32,
                maxWidth: 720,
                padding: 28,
                background: "#FFFFFF",
                borderRadius: 16,
                border: "1px solid #E3E6EE",
                boxShadow: "0 20px 50px rgba(11,16,32,0.12)",
                opacity: resultOpacity,
                transform: `translateY(${resultY}px)`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <code style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 22, fontWeight: 600 }}>
                  {code}
                </code>
                <div
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    background: "#DBEAFE",
                    color: "#1E40AF",
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  Under review
                </div>
              </div>
              <div style={{ marginTop: 18, fontSize: 20, color: "#5B6478", lineHeight: 1.6 }}>
                <div>📁 Category: Abuse</div>
                <div>📍 Region: Greater Banjul</div>
                <div>🕒 Submitted: today, 14:32</div>
              </div>
            </div>
          )}
        </div>

        <Cursor
          points={[
            { x: 200, y: 60, frame: 0 },
            { x: 600, y: 380, frame: 25 },   // input
            { x: 600, y: 380, frame: 95 },
            { x: 380, y: 530, frame: 108 },  // lookup
          ]}
          clickFrames={[110]}
        />
      </BrowserChrome>

      <Caption text="A unique tracking code lets reporters check progress — privately, anytime." delay={20} />
    </AbsoluteFill>
  );
};
