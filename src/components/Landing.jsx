import { useNavigate, Navigate } from "react-router-dom";
import { C, F, FS } from "./shared";
import { useAuth } from "../lib/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (!loading && user) return <Navigate to="/dashboard" replace />;

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
          <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(124,58,237,.4)" }}>
            <svg width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14m0 0l-4-4m4 4l-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontFamily: FS, fontSize: 34, color: C.white, letterSpacing: "-.02em" }}>SwipeKit</span>
        </div>
        <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
          Fast feedback through swiping.
        </p>
      </div>

      {/* feature cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 420 }}>
        {/* Design Review */}
        <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(124,58,237,0.03) 100%)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 20px 16px" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 20px rgba(124,58,237,.3)" }}>
              <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 16l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <div style={{ fontFamily: FS, fontSize: 20, color: C.white, marginBottom: 2 }}>Design Review</div>
              <div style={{ color: C.dim, fontSize: 13, fontFamily: F, lineHeight: 1.4 }}>Swipe to approve, reject, or annotate with canvas markup.</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, padding: "0 20px 16px" }}>
            <button
              onClick={() => navigate("/design")}
              style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: "none", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, color: C.white, fontFamily: F, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Try Demo
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.6)", fontFamily: F, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            >
              Sign in to create
            </button>
          </div>
        </div>

        {/* Quick Survey */}
        <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(135deg, rgba(96,165,250,0.06) 0%, rgba(59,130,246,0.03) 100%)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 20px 16px" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#60A5FA,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 20px rgba(59,130,246,.3)", fontSize: 22 }}>📊</div>
            <div>
              <div style={{ fontFamily: FS, fontSize: 20, color: C.white, marginBottom: 2 }}>Quick Survey</div>
              <div style={{ color: C.dim, fontSize: 13, fontFamily: F, lineHeight: 1.4 }}>Create yes/no questions. Recipients swipe to answer.</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, padding: "0 20px 16px" }}>
            <button
              onClick={() => navigate("/survey")}
              style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#60A5FA,#3B82F6)", color: C.white, fontFamily: F, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Try Demo
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.6)", fontFamily: F, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            >
              Sign in to create
            </button>
          </div>
        </div>
      </div>

      {/* sign in prompt */}
      <p style={{ color: "rgba(255,255,255,.2)", fontFamily: F, fontSize: 13, margin: 0, textAlign: "center" }}>
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: C.purple, fontFamily: F, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}>
          Sign in →
        </button>
      </p>
    </div>
  );
}
