import React from "react";

export const BrowserChrome: React.FC<{
  url: string;
  children: React.ReactNode;
}> = ({ url, children }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 80,
        right: 80,
        bottom: 80,
        background: "#FFFFFF",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 48,
          background: "#F1F3F8",
          borderBottom: "1px solid #E3E6EE",
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#FF5F57" }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#FEBC2E" }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#28C840" }} />
        <div
          style={{
            marginLeft: 24,
            background: "#FFFFFF",
            border: "1px solid #E3E6EE",
            borderRadius: 8,
            padding: "6px 14px",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: "#5B6478",
            minWidth: 360,
          }}
        >
          🔒 {url}
        </div>
      </div>
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>{children}</div>
    </div>
  );
};
