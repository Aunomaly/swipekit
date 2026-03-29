import { useNavigate } from "react-router-dom";
import { C, F, FS } from "./shared";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100vh", gap: 36,
        padding: "40px 24px", maxWidth: 520,
      }}
    >
      {/* brand */}
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: 16,
              background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 24px rgba(124,58,237,.4)",
            }}
          >
            <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14m0 0l-4-4m4 4l-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontFamily: FS, fontSize: 34, color: C.white, letterSpacing: "-.02em" }}>
            SwipeKit
          </span>
        </div>
        <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
          Fast feedback through swiping. Choose a demo below.
        </p>
      </div>

      {/* demo cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 400 }}>
        <button
          onClick={() => navigate("/design")}
          style={{
            display: "flex", alignItems: "center", gap: 20, padding: "24px 24px",
            borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)",
            background: "linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(124,58,237,0.03) 100%)",
            cursor: "pointer", textAlign: "left", width: "100%",
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 20px rgba(124,58,237,.3)" }}>
            <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 16l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FS, fontSize: 22, color: C.white, marginBottom: 4 }}>Design Review</div>
            <div style={{ color: C.dim, fontSize: 13, fontFamily: F, lineHeight: 1.4 }}>Upload designs. Swipe to approve, reject, or annotate with canvas markup.</div>
          </div>
          <svg width="20" height="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>

        <button
          onClick={() => navigate("/survey")}
          style={{
            display: "flex", alignItems: "center", gap: 20, padding: "24px 24px",
            borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)",
            background: "linear-gradient(135deg, rgba(96,165,250,0.06) 0%, rgba(59,130,246,0.03) 100%)",
            cursor: "pointer", textAlign: "left", width: "100%",
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#60A5FA,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 20px rgba(59,130,246,.3)", fontSize: 26 }}>📊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FS, fontSize: 22, color: C.white, marginBottom: 4 }}>Quick Survey</div>
            <div style={{ color: C.dim, fontSize: 13, fontFamily: F, lineHeight: 1.4 }}>Create yes/no questions. Recipients swipe to answer. Instant results.</div>
          </div>
          <svg width="20" height="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* swipe hint */}
      <div style={{ display: "flex", gap: 32, marginTop: 8 }}>
        {[
          { icon: "←", label: "No / Reject", color: C.red },
          { icon: "→", label: "Yes / Approve", color: C.green },
        ].map((h) => (
          <div key={h.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${h.color}11`, border: `1px solid ${h.color}33`, display: "flex", alignItems: "center", justifyContent: "center", color: h.color, fontSize: 20, fontWeight: 700 }}>{h.icon}</div>
            <span style={{ color: "rgba(255,255,255,.3)", fontSize: 11, fontWeight: 500 }}>{h.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
