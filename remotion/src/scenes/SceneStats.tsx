import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Caption } from "../components/Caption";

const STATS = [
  { label: "Reports submitted", value: 1247, color: "#3B82F6" },
  { label: "Cases resolved", value: 892, color: "#10B981" },
  { label: "Languages supported", value: 5, color: "#F59E0B" },
  { label: "Avg. response (hrs)", value: 18, color: "#EF4444" },
];

const Counter: React.FC<{ to: number; delay: number; color: string; label: string }> = ({
  to,
  delay,
  color,
  label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 60 } });
  const value = Math.round(interpolate(t, [0, 1], [0, to]));
  const scale = interpolate(spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 140 } }), [0, 1], [0.8, 1]);
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        padding: "44px 36px",
        borderRadius: 22,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        opacity,
        transform: `scale(${scale})`,
        flex: 1,
      }}
    >
      <div
        style={{
          fontFamily: "DM Serif Display, serif",
          fontSize: 110,
          color,
          lineHeight: 1,
          letterSpacing: -2,
        }}
      >
        {value.toLocaleString()}
      </div>
      <div
        style={{
          marginTop: 16,
          fontFamily: "Inter, sans-serif",
          fontSize: 22,
          color: "#A8B0C5",
          fontWeight: 500,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const SceneStats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 200 } });
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  const ctaIn = spring({ frame: frame - 140, fps, config: { damping: 15, stiffness: 130 } });
  const ctaScale = interpolate(ctaIn, [0, 1], [0.85, 1]);
  const ctaOpacity = interpolate(frame, [140, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const orbX = Math.sin(frame / 40) * 40;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 75% 20%, #1E3A8A 0%, #0B1020 60%), linear-gradient(180deg, #0B1020, #0B1020)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 100 + orbX,
          top: 600,
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.35), rgba(16,185,129,0))",
          filter: "blur(20px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 120,
          top: 110,
          right: 120,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            color: "#F59E0B",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Live impact
        </div>
        <h2
          style={{
            fontFamily: "DM Serif Display, serif",
            fontSize: 96,
            color: "#F7F8FB",
            margin: "12px 0 0 0",
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          Every report counts.
        </h2>
      </div>

      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: 380,
          display: "flex",
          gap: 24,
        }}
      >
        {STATS.map((s, i) => (
          <Counter key={s.label} to={s.value} delay={20 + i * 12} color={s.color} label={s.label} />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 200,
          display: "flex",
          justifyContent: "center",
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "DM Serif Display, serif",
              fontSize: 64,
              color: "#F7F8FB",
              letterSpacing: -1,
            }}
          >
            childvoice.gm
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: "Inter, sans-serif",
              fontSize: 26,
              color: "#A8B0C5",
            }}
          >
            Built for The Gambia · For every child, a voice.
          </div>
        </div>
      </div>

      <Caption text="Together — citizens, police, and welfare officers — we protect every child." delay={20} />
    </AbsoluteFill>
  );
};
