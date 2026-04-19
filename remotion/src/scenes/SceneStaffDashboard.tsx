import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Caption } from "../components/Caption";
import { Cursor } from "../components/Cursor";
import { BrowserChrome } from "../components/BrowserChrome";

const REPORTS = [
  { code: "CVG-7K2M9X", cat: "Abuse", agency: "Police", region: "Greater Banjul", status: "Under review", color: "#DBEAFE", fg: "#1E40AF" },
  { code: "CVG-3F8L1B", cat: "Neglect", agency: "Welfare", region: "West Coast", status: "In progress", color: "#FEF3C7", fg: "#92400E" },
  { code: "CVG-9P4Q2R", cat: "Child labor", agency: "Both", region: "Upper River", status: "Received", color: "#E5E7EB", fg: "#374151" },
  { code: "CVG-5T6W8Y", cat: "School safety", agency: "Welfare", region: "North Bank", status: "Resolved", color: "#D1FAE5", fg: "#065F46" },
  { code: "CVG-2H1J7K", cat: "Trafficking", agency: "Police", region: "Greater Banjul", status: "Under review", color: "#DBEAFE", fg: "#1E40AF" },
];

export const SceneStaffDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // status filter changes around frame 90
  const filterChanged = frame >= 100;
  // status update on row 0 around frame 180
  const statusUpdated = frame >= 200;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #0B1020 0%, #1E293B 100%)" }}>
      <BrowserChrome url="childvoice.gm/staff">
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "40px 60px",
            background: "#FAFBFD",
            fontFamily: "Inter, sans-serif",
            color: "#0B1020",
            opacity: inOpacity,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: 40, margin: 0, fontWeight: 700, letterSpacing: -1 }}>
                Staff Dashboard
              </h2>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <div style={{ padding: "6px 14px", background: "#EDE9FE", color: "#5B21B6", borderRadius: 999, fontSize: 16, fontWeight: 600 }}>
                  🛡 admin
                </div>
                <div style={{ padding: "6px 14px", background: "#DBEAFE", color: "#1E40AF", borderRadius: 999, fontSize: 16, fontWeight: 600 }}>
                  🛡 police
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ marginTop: 26, display: "flex", gap: 14 }}>
            <div
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                background: "#FFFFFF",
                border: filterChanged ? "2px solid #3B82F6" : "1px solid #D6DAE5",
                fontSize: 18,
                fontWeight: 500,
                color: "#3A4258",
                minWidth: 220,
              }}
            >
              Status: {filterChanged ? "Under review" : "All"}  ▾
            </div>
            <div
              style={{
                padding: "12px 20px",
                borderRadius: 10,
                background: "#FFFFFF",
                border: "1px solid #D6DAE5",
                fontSize: 18,
                fontWeight: 500,
                color: "#3A4258",
                minWidth: 220,
              }}
            >
              Category: All  ▾
            </div>
          </div>

          {/* List */}
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
            {REPORTS.filter((r) => !filterChanged || r.status === "Under review").map((r, i) => {
              const isFirst = i === 0;
              const status = isFirst && statusUpdated ? "In progress" : r.status;
              const sColor = isFirst && statusUpdated ? "#FEF3C7" : r.color;
              const sFg = isFirst && statusUpdated ? "#92400E" : r.fg;
              const rowIn = spring({
                frame: frame - 25 - i * 6,
                fps,
                config: { damping: 200 },
              });
              const rowY = interpolate(rowIn, [0, 1], [20, 0]);
              const rowOpacity = interpolate(frame, [25 + i * 6, 45 + i * 6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const highlight = isFirst && frame >= 140 && frame < 220;
              return (
                <div
                  key={r.code}
                  style={{
                    padding: "18px 24px",
                    borderRadius: 12,
                    background: "#FFFFFF",
                    border: highlight ? "2px solid #F59E0B" : "1px solid #E3E6EE",
                    boxShadow: highlight ? "0 8px 24px rgba(245,158,11,0.25)" : "0 2px 6px rgba(11,16,32,0.04)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    opacity: rowOpacity,
                    transform: `translateY(${rowY}px)`,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <code style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, fontWeight: 600 }}>
                        {r.code}
                      </code>
                      <div
                        style={{
                          padding: "4px 12px",
                          borderRadius: 6,
                          border: "1px solid #D6DAE5",
                          fontSize: 14,
                          color: "#5B6478",
                        }}
                      >
                        {r.agency}
                      </div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 16, color: "#5B6478" }}>
                      {r.cat} · {r.region}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "8px 18px",
                      borderRadius: 999,
                      background: sColor,
                      color: sFg,
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    {status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Cursor
          points={[
            { x: 200, y: 60, frame: 0 },
            { x: 280, y: 280, frame: 90 },   // status filter
            { x: 280, y: 280, frame: 110 },
            { x: 1100, y: 410, frame: 165 }, // first row status badge
            { x: 1100, y: 410, frame: 220 },
          ]}
          clickFrames={[100, 200]}
        />
      </BrowserChrome>

      <Caption text="Police and welfare staff triage cases — filter, assign, and update status in real time." delay={20} />
    </AbsoluteFill>
  );
};
