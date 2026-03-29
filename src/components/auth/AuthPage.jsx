import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { C, F, FS } from "../shared";
import { signInWithEmail, signUpWithEmail, signInWithMagicLink, signInWithGoogle } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";

const TAB = { password: "password", magic: "magic" };

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const from = location.state?.from?.pathname || "/dashboard";

  if (user) { navigate(from, { replace: true }); return null; }

  const [tab, setTab] = useState(TAB.password);
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        navigate(from, { replace: true });
      } else {
        await signUpWithEmail(email, password);
        setError("Check your email to confirm your account.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithMagicLink(email);
      setMagicSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "40px 24px", gap: 32, maxWidth: 420, margin: "0 auto", width: "100%" }}>

      {/* brand */}
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(124,58,237,.4)" }}>
            <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m0 0l-4-4m4 4l-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span style={{ fontFamily: FS, fontSize: 26, color: C.white, letterSpacing: "-.02em" }}>SwipeKit</span>
        </div>
        <p style={{ color: C.dim, fontSize: 14, margin: 0 }}>
          {tab === TAB.password ? (mode === "signin" ? "Sign in to your account" : "Create your account") : "Sign in with a magic link"}
        </p>
      </div>

      <div style={{ width: "100%", background: "rgba(255,255,255,.03)", borderRadius: 20, border: "1px solid rgba(255,255,255,.08)", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "13px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", color: C.white, fontFamily: F, fontSize: 15, fontWeight: 500, cursor: "pointer", width: "100%" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
          <span style={{ color: "rgba(255,255,255,.2)", fontFamily: F, fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
        </div>

        {/* tab switcher */}
        <div style={{ display: "flex", background: "rgba(255,255,255,.04)", borderRadius: 10, padding: 4, gap: 4 }}>
          {[{ id: TAB.password, label: "Password" }, { id: TAB.magic, label: "Magic link" }].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(""); setMagicSent(false); }}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", fontFamily: F, fontSize: 13, fontWeight: 600, cursor: "pointer", background: tab === t.id ? "rgba(167,139,250,.2)" : "transparent", color: tab === t.id ? C.purple : "rgba(255,255,255,.35)", transition: "all .15s" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* password form */}
        {tab === TAB.password && (
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address" required autoFocus
              style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: C.white, fontFamily: F, fontSize: 15, outline: "none" }}
            />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" required minLength={6}
              style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: C.white, fontFamily: F, fontSize: 15, outline: "none" }}
            />
            {error && <p style={{ margin: 0, color: error.includes("Check your email") ? C.green : C.red, fontFamily: F, fontSize: 13 }}>{error}</p>}
            <button
              type="submit" disabled={loading}
              style={{ padding: "14px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, color: C.white, fontFamily: F, fontSize: 15, fontWeight: 600, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 20px rgba(124,58,237,.3)" }}
            >
              {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              style={{ background: "none", border: "none", color: C.dim, fontFamily: F, fontSize: 13, cursor: "pointer", textAlign: "center" }}
            >
              {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </form>
        )}

        {/* magic link form */}
        {tab === TAB.magic && (
          <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {magicSent ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📬</div>
                <p style={{ color: C.white, fontFamily: F, fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>Check your inbox</p>
                <p style={{ color: C.dim, fontFamily: F, fontSize: 13, margin: 0 }}>We sent a magic link to <strong style={{ color: C.white }}>{email}</strong></p>
                <button type="button" onClick={() => setMagicSent(false)} style={{ marginTop: 16, background: "none", border: "none", color: C.purple, fontFamily: F, fontSize: 13, cursor: "pointer" }}>Use a different email</button>
              </div>
            ) : (
              <>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" required autoFocus
                  style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", color: C.white, fontFamily: F, fontSize: 15, outline: "none" }}
                />
                {error && <p style={{ margin: 0, color: C.red, fontFamily: F, fontSize: 13 }}>{error}</p>}
                <button
                  type="submit" disabled={loading}
                  style={{ padding: "14px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, color: C.white, fontFamily: F, fontSize: 15, fontWeight: 600, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 20px rgba(124,58,237,.3)" }}
                >
                  {loading ? "Sending…" : "Send magic link"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
