import { useNavigate } from "react-router-dom";
import { C, F, FS } from "./shared";
import { signOut } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function NavBar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Account";
  const avatarLetter = displayName[0].toUpperCase();

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 56,
        background: "rgba(13,13,15,.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}
    >
      {/* logo */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m0 0l-4-4m4 4l-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <span style={{ fontFamily: FS, fontSize: 18, color: C.white, letterSpacing: "-.01em" }}>SwipeKit</span>
      </button>

      {/* user + sign out */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700, fontFamily: F, flexShrink: 0 }}>
            {avatarLetter}
          </div>
          <span style={{ color: "rgba(255,255,255,.5)", fontFamily: F, fontSize: 13, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
        </div>
        <button
          onClick={handleSignOut}
          style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.4)", fontFamily: F, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
