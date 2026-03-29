import { useState } from "react";
import { C, F, FS } from "./constants";

export default function ReviewerIdentityScreen({ onStart, title = "Before you start", subtitle }) {
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const handleStart = () => {
    onStart(anonymous ? null : name.trim() || null);
  };

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100vh", gap: 32,
        padding: "40px 24px", maxWidth: 440, margin: "0 auto",
      }}
    >
      {/* icon */}
      <div
        style={{
          width: 64, height: 64, borderRadius: 20,
          background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 24px rgba(124,58,237,.4)",
        }}
      >
        <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* heading */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: FS, fontSize: 28, color: C.white, marginBottom: 10 }}>
          {title}
        </div>
        <p style={{ color: C.dim, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          {subtitle || "Add your name so the creator knows who left this feedback."}
        </p>
      </div>

      {/* form */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
        {!anonymous && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="Your name (optional)"
            autoFocus
            style={{
              width: "100%", padding: "16px 18px", borderRadius: 14,
              border: `1px solid ${name ? C.purple + "66" : "rgba(255,255,255,.1)"}`,
              background: "rgba(255,255,255,.03)", color: C.white,
              fontFamily: F, fontSize: 16, outline: "none",
              boxSizing: "border-box",
              transition: "border-color .2s",
            }}
          />
        )}

        {/* anonymous toggle */}
        <button
          onClick={() => setAnonymous((a) => !a)}
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
            borderRadius: 14, border: `1px solid ${anonymous ? C.purple + "44" : "rgba(255,255,255,.08)"}`,
            background: anonymous ? `rgba(167,139,250,.06)` : "rgba(255,255,255,.02)",
            cursor: "pointer", textAlign: "left",
          }}
        >
          <div
            style={{
              width: 22, height: 22, borderRadius: 6,
              border: `2px solid ${anonymous ? C.purple : "rgba(255,255,255,.2)"}`,
              background: anonymous ? C.purple : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all .2s",
            }}
          >
            {anonymous && (
              <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{ color: anonymous ? C.white : "rgba(255,255,255,.5)", fontFamily: F, fontSize: 15, fontWeight: 500 }}>
            Stay anonymous
          </span>
        </button>

        <button
          onClick={handleStart}
          style={{
            padding: "16px 0", borderRadius: 14, border: "none",
            background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`,
            color: C.white, fontSize: 16, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 24px rgba(124,58,237,.3)", marginTop: 4,
            fontFamily: F,
          }}
        >
          Start →
        </button>
      </div>
    </div>
  );
}
