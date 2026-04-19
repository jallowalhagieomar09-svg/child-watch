import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Caption: React.FC<{
  text: string;
  delay?: number;
}> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;
  const enter = spring({
    frame: local,
    fps,
    config: { damping: 200, stiffness: 120 },
  });
  const opacity = interpolate(local, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(enter, [0, 1], [40, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 70,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${y}px)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(8, 12, 28, 0.85)",
          color: "#F7F8FB",
          padding: "16px 32px",
          borderRadius: 14,
          fontFamily: "Inter, sans-serif",
          fontSize: 32,
          fontWeight: 500,
          maxWidth: 1400,
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.08)",
          letterSpacing: -0.2,
          lineHeight: 1.3,
        }}
      >
        {text}
      </div>
    </div>
  );
};
