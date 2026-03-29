import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { C, F, FS } from "../shared";
import { loadSessionResults } from "../../lib/supabase";

const VERDICT_LABEL = { right: "Approved", left: "Rejected", up: "Marked up" };
const VERDICT_COLOR = { right: C.green, left: C.red, up: C.purple };
const VERDICT_ICON = { right: "✓", left: "✕", up: "✎" };

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", border: `3px solid ${C.purple}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
      <span style={{ color: C.dim, fontFamily: F, fontSize: 15 }}>Loading results…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function DesignSessionResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [designs, setDesigns] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [expandedDesign, setExpandedDesign] = useState(null);

  useEffect(() => {
    loadSessionResults(sessionId)
      .then(({ designs, reviews }) => {
        setDesigns(designs);
        setReviews(reviews);
      })
      .catch((err) => setError(err.message || "Failed to load results."))
      .finally(() => setLoading(false));
  }, [sessionId]);

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

  const totalReviews = reviews.length;
  const approved = reviews.filter((r) => r.verdict === "right").length;
  const rejected = reviews.filter((r) => r.verdict === "left").length;
  const markedUp = reviews.filter((r) => r.verdict === "up").length;

  const reviewerNames = [...new Set(reviews.map((r) => r.reviewer_name))];
  const namedCount = reviewerNames.filter(Boolean).length;
  const anonCount = reviews.filter((r) => !r.reviewer_name).length > 0 ? 1 : 0;
  const reviewerCount = namedCount + anonCount;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "40px 20px 60px", maxWidth: 560, margin: "0 auto", width: "100%" }}>

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#777", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: F, fontSize: 14 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5m0 0l4-4m-4 4l4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Home
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 16l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span style={{ fontFamily: FS, fontSize: 22, color: C.white }}>Design Results</span>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* summary stats */}
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        {[
          { label: "Reviewers", count: reviewerCount, color: C.blue, bg: "rgba(96,165,250,0.08)" },
          { label: "Approved", count: approved, color: C.green, bg: "rgba(74,230,138,0.08)" },
          { label: "Rejected", count: rejected, color: C.red, bg: "rgba(255,68,88,0.08)" },
          { label: "Marked up", count: markedUp, color: C.purple, bg: "rgba(167,139,250,0.08)" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 14, padding: "16px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, fontFamily: F }}>{s.count}</div>
            <div style={{ fontSize: 11, color: C.dim, fontFamily: F, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {totalReviews === 0 && (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 15, fontFamily: F }}>
          No reviews submitted yet. Share the reviewer link to get feedback.
        </div>
      )}

      {/* per-design breakdown */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        {designs.map((design) => {
          const designReviews = reviews.filter((r) => r.design_id === design.id);
          const dApproved = designReviews.filter((r) => r.verdict === "right").length;
          const dRejected = designReviews.filter((r) => r.verdict === "left").length;
          const dMarked = designReviews.filter((r) => r.verdict === "up").length;
          const total = designReviews.length;
          const isExpanded = expandedDesign === design.id;

          return (
            <div key={design.id} style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,.07)", overflow: "hidden" }}>
              {/* design header row */}
              <div
                onClick={() => total > 0 && setExpandedDesign(isExpanded ? null : design.id)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,.03)", cursor: total > 0 ? "pointer" : "default" }}
              >
                <img src={design.url} alt={design.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: C.white, fontFamily: F, fontSize: 14, fontWeight: 600, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{design.name}</div>
                  {total > 0 ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      {[
                        { count: dApproved, color: C.green, label: "✓" },
                        { count: dRejected, color: C.red, label: "✕" },
                        { count: dMarked, color: C.purple, label: "✎" },
                      ].filter((s) => s.count > 0).map((s) => (
                        <span key={s.label} style={{ padding: "2px 8px", borderRadius: 6, background: `${s.color}15`, color: s.color, fontSize: 12, fontFamily: F, fontWeight: 600 }}>
                          {s.label} {s.count}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: "rgba(255,255,255,.2)", fontSize: 12, fontFamily: F }}>No reviews yet</span>
                  )}
                </div>
                {total > 0 && (
                  <svg
                    width="16" height="16" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2" viewBox="0 0 24 24"
                    style={{ flexShrink: 0, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* expanded reviewer list */}
              {isExpanded && (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {designReviews.map((review, i) => (
                    <div key={review.id}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.05)", background: "rgba(255,255,255,.015)" }}>
                        {/* avatar */}
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${VERDICT_COLOR[review.verdict]}18`, border: `1px solid ${VERDICT_COLOR[review.verdict]}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, color: VERDICT_COLOR[review.verdict], fontWeight: 700 }}>
                          {review.reviewer_name ? review.reviewer_name[0].toUpperCase() : "?"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: review.annotation ? 6 : 0 }}>
                            <span style={{ color: C.white, fontFamily: F, fontSize: 13, fontWeight: 600 }}>
                              {review.reviewer_name || "Anonymous"}
                            </span>
                            <span style={{ padding: "2px 8px", borderRadius: 6, background: `${VERDICT_COLOR[review.verdict]}15`, color: VERDICT_COLOR[review.verdict], fontSize: 11, fontFamily: F, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>
                              {VERDICT_LABEL[review.verdict]}
                            </span>
                          </div>
                          {review.annotation?.text && (
                            <p style={{ margin: "0 0 6px", color: C.dim, fontFamily: F, fontSize: 13, lineHeight: 1.5 }}>"{review.annotation.text}"</p>
                          )}
                          {review.annotation && (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {review.annotation.strokeCount > 0 && <span style={{ color: "rgba(167,139,250,.5)", fontSize: 11, fontFamily: F }}>{review.annotation.strokeCount} drawing(s)</span>}
                              {review.annotation.pins?.length > 0 && <span style={{ color: "rgba(167,139,250,.5)", fontSize: 11, fontFamily: F }}>{review.annotation.pins.length} pin(s)</span>}
                              {review.annotation.refImages?.length > 0 && <span style={{ color: "rgba(167,139,250,.5)", fontSize: 11, fontFamily: F }}>{review.annotation.refImages.length} reference(s)</span>}
                            </div>
                          )}
                          {review.annotation?.canvasData && (
                            <img src={review.annotation.canvasData} alt="markup" style={{ marginTop: 8, width: "100%", borderRadius: 8, display: "block", maxHeight: 200, objectFit: "contain" }} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
