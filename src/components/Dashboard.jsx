import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C, F, FS } from "./shared";
import { loadUserSessions, loadUserSurveys } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function CopyButton({ url, label = "Copy link" }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: copied ? C.green : "rgba(255,255,255,.4)", fontFamily: F, fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 20px", borderRadius: 16, border: "1px dashed rgba(255,255,255,.08)", textAlign: "center" }}>
      <span style={{ fontSize: 32 }}>{icon}</span>
      <div style={{ color: "rgba(255,255,255,.4)", fontFamily: F, fontSize: 14, fontWeight: 600 }}>{title}</div>
      <div style={{ color: "rgba(255,255,255,.2)", fontFamily: F, fontSize: 13 }}>{subtitle}</div>
      <button onClick={onAction} style={{ marginTop: 4, padding: "10px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, color: C.white, fontFamily: F, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{action}</button>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadUserSessions(), loadUserSurveys()])
      .then(([s, sv]) => { setSessions(s); setSurveys(sv); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40, padding: "88px 24px 60px", maxWidth: 680, margin: "0 auto", width: "100%" }}>

      {/* greeting */}
      <div>
        <h1 style={{ fontFamily: FS, fontSize: 32, color: C.white, margin: "0 0 6px", letterSpacing: "-.02em" }}>
          Hey, {displayName} 👋
        </h1>
        <p style={{ color: C.dim, fontFamily: F, fontSize: 15, margin: 0 }}>
          Your feedback sessions and surveys live here.
        </p>
      </div>

      {/* new buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => navigate("/design")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, color: C.white, fontFamily: F, fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,.3)" }}
        >
          <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
          New Design Review
        </button>
        <button
          onClick={() => navigate("/survey")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)", color: "rgba(255,255,255,.7)", fontFamily: F, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
          New Survey
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "40px 0" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: `3px solid ${C.purple}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
          <span style={{ color: C.dim, fontFamily: F, fontSize: 14 }}>Loading…</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* ── Design Reviews ── */}
          <section>
            <h2 style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 14px" }}>
              Design Reviews · {sessions.length}
            </h2>
            {sessions.length === 0 ? (
              <EmptyState icon="🖼️" title="No design reviews yet" subtitle="Upload designs and share a link for swipe feedback." action="Create your first review" onAction={() => navigate("/design")} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sessions.map((s) => {
                  const thumb = s.designs[0];
                  const reviewerUrl = `${window.location.origin}/r/${s.id}`;
                  const resultsUrl = `${window.location.origin}/results/r/${s.id}`;
                  return (
                    <div
                      key={s.id}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,.07)" }}
                    >
                      {/* thumbnail */}
                      {thumb ? (
                        <img src={thumb.url} alt={thumb.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 52, height: 52, borderRadius: 10, background: "rgba(255,255,255,.05)", flexShrink: 0 }} />
                      )}

                      {/* info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: C.white, fontFamily: F, fontSize: 14, fontWeight: 600, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.designs.length} design{s.designs.length !== 1 ? "s" : ""}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: C.dim, fontFamily: F, fontSize: 12 }}>{formatDate(s.createdAt)}</span>
                          <span style={{ color: s.reviewCount > 0 ? C.purple : "rgba(255,255,255,.2)", fontFamily: F, fontSize: 12, fontWeight: 600 }}>
                            {s.reviewCount} review{s.reviewCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* actions */}
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <CopyButton url={reviewerUrl} label="Copy link" />
                        <button
                          onClick={() => navigate(`/results/r/${s.id}`)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "rgba(167,139,250,.15)", color: C.purple, fontFamily: F, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          Results
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Surveys ── */}
          <section>
            <h2 style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 14px" }}>
              Surveys · {surveys.length}
            </h2>
            {surveys.length === 0 ? (
              <EmptyState icon="📊" title="No surveys yet" subtitle="Create yes/no questions and collect answers by swiping." action="Create your first survey" onAction={() => navigate("/survey")} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {surveys.map((s) => {
                  const firstQ = s.questions[0];
                  const surveyUrl = `${window.location.origin}/s/${s.id}`;
                  const resultsUrl = `${window.location.origin}/results/s/${s.id}`;
                  return (
                    <div
                      key={s.id}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,.07)" }}
                    >
                      {/* emoji */}
                      <div style={{ width: 52, height: 52, borderRadius: 10, background: "rgba(96,165,250,.08)", border: "1px solid rgba(96,165,250,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                        {firstQ?.emoji || "📋"}
                      </div>

                      {/* info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: C.white, fontFamily: F, fontSize: 14, fontWeight: 600, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {firstQ ? `"${firstQ.text}"` : `${s.questions.length} question${s.questions.length !== 1 ? "s" : ""}`}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: C.dim, fontFamily: F, fontSize: 12 }}>{formatDate(s.createdAt)}</span>
                          <span style={{ color: C.dim, fontFamily: F, fontSize: 12 }}>{s.questions.length} question{s.questions.length !== 1 ? "s" : ""}</span>
                          <span style={{ color: s.responseCount > 0 ? C.blue : "rgba(255,255,255,.2)", fontFamily: F, fontSize: 12, fontWeight: 600 }}>
                            {s.responseCount} response{s.responseCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* actions */}
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <CopyButton url={surveyUrl} label="Copy link" />
                        <button
                          onClick={() => navigate(`/results/s/${s.id}`)}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "rgba(96,165,250,.15)", color: C.blue, fontFamily: F, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          Results
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
