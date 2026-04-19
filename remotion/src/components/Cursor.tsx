import { useCurrentFrame, interpolate, Easing } from "remotion";

type Point = { x: number; y: number; frame: number };

/**
 * Animated cursor that moves through a series of waypoints.
 * Each waypoint is reached at its `frame`. Holds at last position after.
 */
export const Cursor: React.FC<{
  points: Point[];
  clickFrames?: number[];
}> = ({ points, clickFrames = [] }) => {
  const frame = useCurrentFrame();
  if (points.length === 0) return null;

  // Find current segment
  let x = points[0].x;
  let y = points[0].y;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const t = interpolate(frame, [a.frame, b.frame], [0, 1], {
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
      x = a.x + (b.x - a.x) * t;
      y = a.y + (b.y - a.y) * t;
      break;
    }
    if (frame > b.frame) {
      x = b.x;
      y = b.y;
    }
  }

  // Click pulse
  const clickScale = clickFrames.reduce((acc, cf) => {
    const d = frame - cf;
    if (d < 0 || d > 18) return acc;
    const s = interpolate(d, [0, 9, 18], [1, 0.75, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return Math.min(acc, s);
  }, 1);

  const ringOpacity = clickFrames.reduce((acc, cf) => {
    const d = frame - cf;
    if (d < 0 || d > 24) return acc;
    return Math.max(acc, interpolate(d, [0, 24], [0.7, 0]));
  }, 0);
  const ringSize = clickFrames.reduce((acc, cf) => {
    const d = frame - cf;
    if (d < 0 || d > 24) return acc;
    return Math.max(acc, interpolate(d, [0, 24], [10, 80]));
  }, 0);

  return (
    <>
      {ringOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            left: x - ringSize / 2,
            top: y - ringSize / 2,
            width: ringSize,
            height: ringSize,
            borderRadius: "50%",
            border: "3px solid #F59E0B",
            opacity: ringOpacity,
            pointerEvents: "none",
          }}
        />
      )}
      <svg
        width="36"
        height="48"
        viewBox="0 0 24 32"
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `scale(${clickScale})`,
          transformOrigin: "0 0",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
          pointerEvents: "none",
        }}
      >
        <path
          d="M2 2 L2 22 L7 17 L11 26 L14 25 L10 16 L17 16 Z"
          fill="#FFFFFF"
          stroke="#0B1020"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};
