import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { C, F, FS } from "../shared";
import { ReviewerIdentityScreen } from "../shared";
import { IconBack, IconHeart, IconPen, IconX } from "../shared";
import { loadSession, saveReview } from "../../lib/supabase";
import DesignSwipeCard from "./DesignSwipeCard";
import AnnotationOverlay from "./AnnotationOverlay";

export default function DesignReviewerView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [stage, setStage] = useState("identity"); // identity | loading | review | done | error
  const [reviewerName, setReviewerName] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [annotating, setAnnotating] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleIdentityConfirmed = async (name) => {
    setReviewerName(name);
    setStage("loading");
    try {
      const data = await loadSession(sessionId);
      if (!data.length) throw new Error("Session not found or has no designs.");
      setDesigns(data);
      setStage("review");
    } catch (err) {
      setErrorMsg(err.message || "Failed to load designs.");
      setStage("error");
    }
  };

  const handleSwipe = async (dir) => {
    const design = designs[currentIndex];
    if (dir === "up") {
      setAnnotating(design);
      return;
    }

    const result = { designId: design.id, designName: design.name, verdict: dir };
    setResults((prev) => [...prev, result]);

    try {
      await saveReview({ sessionId, designId: design.id, verdict: dir, reviewerName });
    } catch (err) {
      console.error("Failed to save review:", err);
    }

    if (currentIndex + 1 >= designs.length) {
      setTimeout(() => setStage("done"), 350);
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handleAnnotationSubmit = async (annotation) => {
    const design = annotating;
    const result = { designId: design.id, designName: design.name, verdict: "up", annotation };
    setResults((prev) => [...prev, result]);
    setAnnotating(null);

    try {
      await saveReview({ sessionId, designId: design.id, verdict: "up", annotation, reviewerName });
    } catch (err) {
      console.error("Failed to save annotation:", err);
    }

    if (currentIndex + 1 >= designs.length) {
      setTimeout(() => setStage("done"), 100);
    }
    setCurrentIndex((prev) => prev + 1);
  };

  if (stage === "identity") {
    return (
      <ReviewerIdentityScreen
        title="Design Review"
        subtitle="Add your name so the creator knows who left this feedback."
        onStart={handleIdentityConfirmed}
      />
    );
  }

  if (stage === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `3px solid ${C.purple}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
        <span style={{ color: C.dim, fontFamily: F, fontSize: 15 }}>Loading designs…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 20, padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>😕</div>
        <div style={{ fontFamily: FS, fontSize: 26, color: C.white }}>Something went wrong</div>
        <p style={{ color: C.dim, fontSize: 15, maxWidth: 320 }}>{errorMsg}</p>
        <button onClick={() => navigate("/")} style={{ padding: "14px 28px", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: C.white, fontFamily: F, fontSize: 15, cursor: "pointer" }}>Go Home</button>
      </div>
    );
  }

  if (stage === "done") {
    const approved = results.filter((r) => r.verdict === "right").length;
    const rejected = results.filter((r) => r.verdict === "left").length;
    const marked = results.filter((r) => r.verdict === "up").length;

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "60px 24px", maxWidth: 460, margin: "0 auto", width: "100%", minHeight: "100vh", justifyContent: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,rgba(74,230,138,.15),rgba(74,230,138,.05))", border: "1px solid rgba(74,230,138,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>✓</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: FS, fontSize: 30, color: C.white, marginBottom: 8 }}>Review submitted!</div>
          {reviewerName && (
            <p style={{ color: C.dim, fontSize: 15, margin: 0 }}>Thanks, <strong style={{ color: C.white }}>{reviewerName}</strong>.</p>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          {[
            { label: "Approved", count: approved, color: C.green, bg: "rgba(74,230,138,0.08)" },
            { label: "Rejected", count: rejected, color: C.red, bg: "rgba(255,68,88,0.08)" },
            { label: "Marked up", count: marked, color: C.purple, bg: "rgba(167,139,250,0.08)" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 16, padding: "18px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: F }}>{s.count}</div>
              <div style={{ fontSize: 11, color: C.dim, fontFamily: F, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate("/")} style={{ padding: "14px 28px", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: C.white, fontFamily: F, fontSize: 15, cursor: "pointer" }}>Back to SwipeKit</button>
      </div>
    );
  }

  return (
    <>
      {stage === "review" && currentIndex < designs.length && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 420, padding: "28px 20px", gap: 20, minHeight: "100vh", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><IconBack /></button>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,.06)" }}>
              <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${C.purple},${C.purpleDark})`, width: `${(currentIndex / designs.length) * 100}%`, transition: "width .3s ease" }} />
            </div>
            <span style={{ color: "rgba(255,255,255,.35)", fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: "right" }}>{currentIndex + 1}/{designs.length}</span>
          </div>
          {reviewerName && (
            <div style={{ alignSelf: "flex-start", padding: "4px 12px", borderRadius: 20, background: "rgba(167,139,250,.1)", border: "1px solid rgba(167,139,250,.2)" }}>
              <span style={{ color: C.purple, fontSize: 12, fontFamily: F, fontWeight: 500 }}>Reviewing as {reviewerName}</span>
            </div>
          )}
          <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", maxHeight: "60vh" }}>
            {designs.slice(currentIndex, currentIndex + 2).reverse().map((d, i, arr) => (
              <DesignSwipeCard key={d.id} design={d} isTop={i === arr.length - 1} onSwipe={handleSwipe} />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 4 }}>
            <button onClick={() => handleSwipe("left")} style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid rgba(255,68,88,.3)", background: "rgba(255,68,88,.08)", color: C.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><IconX /></button>
            <button onClick={() => handleSwipe("up")} style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid rgba(167,139,250,.3)", background: "rgba(167,139,250,.08)", color: C.purple, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><IconPen /></button>
            <button onClick={() => handleSwipe("right")} style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid rgba(74,230,138,.3)", background: "rgba(74,230,138,.08)", color: C.green, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><IconHeart /></button>
          </div>
          <div style={{ display: "flex", gap: 24, color: "rgba(255,255,255,.2)", fontSize: 11, fontWeight: 500 }}>
            <span>← Reject</span><span style={{ color: "rgba(167,139,250,.4)" }}>↑ Markup</span><span>Approve →</span>
          </div>
        </div>
      )}
      {annotating && (
        <AnnotationOverlay design={annotating} onSubmit={handleAnnotationSubmit} onCancel={() => setAnnotating(null)} />
      )}
    </>
  );
}
