import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Caption } from "../components/Caption";

export const SceneLanding: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 110 } });
  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const titleOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });

  const subSpring = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const subOpacity = interpolate(subSpring, [0, 1], [0, 1]);

  const badgeSpring = spring({ frame: frame - 50, fps, config: { damping: 15, stiffness: 140 } });
  const badgeScale = interpolate(badgeSpring, [0, 1], [0.6, 1]);

  // Floating shapes
  const orb1Y = Math.sin(frame / 20) * 20;
  const orb2Y = Math.cos(frame / 25) * 25;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 25% 30%, #1E3A8A 0%, #0B1020 60%), linear-gradient(180deg, #0B1020, #0B1020)",
      }}
    >
      {/* Floating orbs */}
      <div
        style={{
          position: "absolute",
          left: 1450,
          top: 180 + orb1Y,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.45), rgba(245,158,11,0))",
          filter: "blur(20px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 720 + orb2Y,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.4), rgba(59,130,246,0))",
          filter: "blur(20px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 140,
          top: 280,
          right: 140,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            transform: `scale(${badgeScale})`,
            opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" }),
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.4)",
            color: "#F59E0B",
            padding: "10px 20px",
            borderRadius: 999,
            fontFamily: "Inter, sans-serif",
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 32,
            letterSpacing: 0.5,
          }}
        >
          🇬🇲  THE GAMBIA · CHILD PROTECTION
        </div>
        <h1
          style={{
            fontFamily: "DM Serif Display, serif",
            fontSize: 160,
            color: "#F7F8FB",
            margin: 0,
            lineHeight: 0.95,
            letterSpacing: -3,
          }}
        >
          Child Voice
          <br />
          <span style={{ color: "#F59E0B", fontStyle: "italic" }}>Gambia</span>
        </h1>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 36,
            color: "#A8B0C5",
            marginTop: 28,
            maxWidth: 1100,
            opacity: subOpacity,
            lineHeight: 1.4,
          }}
        >
          A safe, multilingual reporting line for child rights —
          <br />
          built for police, social welfare, and every concerned citizen.
        </p>
      </div>

      <Caption text="Child Voice Gambia — a safe, multilingual platform to report and resolve child-rights cases." delay={70} />
    </AbsoluteFill>
  );
};
