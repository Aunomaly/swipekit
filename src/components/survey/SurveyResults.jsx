import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { C, F, FS } from "../shared";
import { loadSurveyResults } from "../../lib/supabase";

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", border: `3px solid ${C.purple}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
      <span style={{ color: C.dim, fontFamily: F, fontSize: 15 }}>Loading results…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function SurveyResults() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    loadSurveyResults(surveyId)
      .then(({ questions, responses }) => {
        setQuestions(questions);
        setResponses(responses);
      })
      .catch((err) => setError(err.message || "Failed to load results."))
      .finally(() => setLoading(false));
  }, [surveyId]);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 20, padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>😕</div>
        <div style={{ fontFamily: FS, fontSize: 26, color: C.white }}>Couldn't load results</div>
        <p style={{ color: C.dim, fontSize: 15, maxWidth: 320 }}>{error}</p>
        <button onClick={() => navigate("/")} style={{ padding: "14px 28px", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: C.white, fontFamily: F, fontSize: 15, cursor: "pointer" }}>Go Home</button>
      </div>
    );
  }

  const totalResponses = responses.length;
  const responderNames = [...new Set(responses.map((r) => r.reviewer_name))];
  const uniqueResponders = responderNames.filter(Boolean).length + (responses.some((r) => !r.reviewer_name) ? 1 : 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "40px 20px 60px", maxWidth: 560, margin: "0 auto", width: "100%" }}>

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#777", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: F, fontSize: 14 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5m0 0l4-4m-4 4l4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Home
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#60A5FA,#3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
          <span style={{ fontFamily: FS, fontSize: 22, color: C.white }}>Survey Results</span>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* summary */}
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        {[
          { label: "Respondents", count: uniqueResponders, color: C.blue, bg: "rgba(96,165,250,0.08)" },
          { label: "Total answers", count: totalResponses, color: C.purple, bg: "rgba(167,139,250,0.08)" },
          { label: "Yes answers", count: responses.filter((r) => r.answer === "right").length, color: C.green, bg: "rgba(74,230,138,0.08)" },
          { label: "No answers", count: responses.filter((r) => r.answer === "left").length, color: C.red, bg: "rgba(255,68,88,0.08)" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 14, padding: "16px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: F }}>{s.count}</div>
            <div style={{ fontSize: 11, color: C.dim, fontFamily: F, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {totalResponses === 0 && (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 15, fontFamily: F }}>
          No responses yet. Share the survey link to collect answers.
        </div>
      )}

      {/* per-question breakdown */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        {questions.map((q) => {
          const qResponses = responses.filter((r) => r.question_id === q.id);
          const yesCount = qResponses.filter((r) => r.answer === "right").length;
          const noCount = qResponses.filter((r) => r.answer === "left").length;
          const total = qResponses.length;
          const yesPct = total > 0 ? Math.round((yesCount / total) * 100) : 0;
          const noPct = total > 0 ? Math.round((noCount / total) * 100) : 0;
          const isExpanded = expandedQ === q.id;

          return (
            <div key={q.id} style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,.07)", overflow: "hidden" }}>
              {/* question row */}
              <div
                onClick={() => total > 0 && setExpandedQ(isExpanded ? null : q.id)}
                style={{ padding: "16px", background: "rgba(255,255,255,.03)", cursor: total > 0 ? "pointer" : "default" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: total > 0 ? 12 : 0 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{q.emoji}</span>
                  <div style={{ flex: 1, color: C.white, fontFamily: F, fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{q.text}</div>
                  {total > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span style={{ color: C.dim, fontFamily: F, fontSize: 12 }}>{total} answer{total !== 1 ? "s" : ""}</span>
                      <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : (
                    <span style={{ color: "rgba(255,255,255,.15)", fontFamily: F, fontSize: 12 }}>No answers</span>
                  )}
                </div>

                {/* yes/no bar */}
                {total > 0 && (
                  <div>
                    <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 8, gap: 2 }}>
                      {yesPct > 0 && <div style={{ width: `${yesPct}%`, background: C.green, borderRadius: 4, transition: "width .4s ease" }} />}
                      {noPct > 0 && <div style={{ width: `${noPct}%`, background: C.red, borderRadius: 4, transition: "width .4s ease" }} />}
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                      <span style={{ color: C.green, fontFamily: F, fontSize: 12, fontWeight: 600 }}>Yes {yesPct}% ({yesCount})</span>
                      <span style={{ color: C.red, fontFamily: F, fontSize: 12, fontWeight: 600 }}>No {noPct}% ({noCount})</span>
                    </div>
                  </div>
                )}
              </div>

              {/* expanded individual responses */}
              {isExpanded && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {qResponses.map((resp) => {
                    const isYes = resp.answer === "right";
                    return (
                      <div key={resp.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,.05)", background: "rgba(255,255,255,.015)" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: isYes ? "rgba(74,230,138,.1)" : "rgba(255,68,88,.1)", border: `1px solid ${isYes ? C.green : C.red}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: isYes ? C.green : C.red, fontWeight: 700, flexShrink: 0 }}>
                          {resp.reviewer_name ? resp.reviewer_name[0].toUpperCase() : "?"}
                        </div>
                        <span style={{ flex: 1, color: "rgba(255,255,255,.7)", fontFamily: F, fontSize: 13 }}>
                          {resp.reviewer_name || "Anonymous"}
                        </span>
                        <span style={{ padding: "3px 10px", borderRadius: 6, background: isYes ? "rgba(74,230,138,.1)" : "rgba(255,68,88,.1)", color: isYes ? C.green : C.red, fontFamily: F, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>
                          {isYes ? "Yes" : "No"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
