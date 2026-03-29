import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { C, F, FS } from "../shared";
import { ReviewerIdentityScreen } from "../shared";
import { IconBack, IconHeart, IconX } from "../shared";
import { loadSurvey, saveResponse } from "../../lib/supabase";
import SurveySwipeCard from "./SurveySwipeCard";

export default function SurveyReviewerView() {
  const { surveyId } = useParams();
  const navigate = useNavigate();

  const [stage, setStage] = useState("identity"); // identity | loading | survey | done | error
  const [reviewerName, setReviewerName] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleIdentityConfirmed = async (name) => {
    setReviewerName(name);
    setStage("loading");
    try {
      const data = await loadSurvey(surveyId);
      if (!data.length) throw new Error("Survey not found or has no questions.");
      setQuestions(data);
      setStage("survey");
    } catch (err) {
      setErrorMsg(err.message || "Failed to load survey.");
      setStage("error");
    }
  };

  const handleSwipe = async (dir) => {
    const question = questions[currentIndex];
    const answer = { qId: question.id, answer: dir };
    setAnswers((prev) => [...prev, answer]);

    try {
      await saveResponse({ surveyId, questionId: question.id, answer: dir, reviewerName });
    } catch (err) {
      console.error("Failed to save response:", err);
    }

    if (currentIndex + 1 >= questions.length) {
      setTimeout(() => setStage("done"), 320);
    }
    setCurrentIndex((prev) => prev + 1);
  };

  if (stage === "identity") {
    return (
      <ReviewerIdentityScreen
        title="Quick Survey"
        subtitle="Add your name so the creator knows who answered."
        onStart={handleIdentityConfirmed}
      />
    );
  }

  if (stage === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `3px solid ${C.purple}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
        <span style={{ color: C.dim, fontFamily: F, fontSize: 15 }}>Loading survey…</span>
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
    const yesCount = answers.filter((a) => a.answer === "right").length;
    const noCount = answers.filter((a) => a.answer === "left").length;

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "60px 24px", maxWidth: 460, margin: "0 auto", width: "100%", minHeight: "100vh", justifyContent: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,rgba(74,230,138,.15),rgba(74,230,138,.05))", border: "1px solid rgba(74,230,138,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>✓</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: FS, fontSize: 30, color: C.white, marginBottom: 8 }}>Responses submitted!</div>
          {reviewerName && (
            <p style={{ color: C.dim, fontSize: 15, margin: 0 }}>Thanks, <strong style={{ color: C.white }}>{reviewerName}</strong>.</p>
          )}
        </div>
        <div style={{ display: "flex", gap: 16, width: "100%" }}>
          {[
            { label: "Yes", count: yesCount, color: C.green, bg: "rgba(74,230,138,0.08)" },
            { label: "No", count: noCount, color: C.red, bg: "rgba(255,68,88,0.08)" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 16, padding: "20px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: s.color, fontFamily: F }}>{s.count}</div>
              <div style={{ fontSize: 12, color: C.dim, fontFamily: F, marginTop: 4 }}>{s.label} ({answers.length ? Math.round((s.count / answers.length) * 100) : 0}%)</div>
            </div>
          ))}
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          {answers.map((a) => {
            const q = questions.find((qq) => qq.id === a.qId);
            const isYes = a.answer === "right";
            return (
              <div key={a.qId} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{q?.emoji}</span>
                <div style={{ flex: 1, color: C.white, fontFamily: F, fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{q?.text}</div>
                <div style={{ padding: "5px 14px", borderRadius: 8, background: isYes ? "rgba(74,230,138,0.1)" : "rgba(255,68,88,0.1)", color: isYes ? C.green : C.red, fontFamily: F, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{isYes ? "Yes" : "No"}</div>
              </div>
            );
          })}
        </div>
        <button onClick={() => navigate("/")} style={{ padding: "14px 28px", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: C.white, fontFamily: F, fontSize: 15, cursor: "pointer", marginTop: 8 }}>Back to SwipeKit</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 420, padding: "28px 20px", gap: 24, minHeight: "100vh", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><IconBack /></button>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,.06)" }}>
          <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${C.purple},${C.purpleDark})`, width: `${(currentIndex / questions.length) * 100}%`, transition: "width .3s ease" }} />
        </div>
        <span style={{ color: "rgba(255,255,255,.35)", fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: "right" }}>{currentIndex + 1}/{questions.length}</span>
      </div>
      {reviewerName && (
        <div style={{ alignSelf: "flex-start", padding: "4px 12px", borderRadius: 20, background: "rgba(167,139,250,.1)", border: "1px solid rgba(167,139,250,.2)" }}>
          <span style={{ color: C.purple, fontSize: 12, fontFamily: F, fontWeight: 500 }}>Answering as {reviewerName}</span>
        </div>
      )}
      <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", maxHeight: "62vh" }}>
        {questions.slice(currentIndex, currentIndex + 2).reverse().map((q, i, arr) => (
          <SurveySwipeCard key={q.id} question={q} isTop={i === arr.length - 1} onSwipe={handleSwipe} index={currentIndex + (i === arr.length - 1 ? 0 : 1)} total={questions.length} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <button onClick={() => handleSwipe("left")} style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid rgba(255,68,88,.3)", background: "rgba(255,68,88,.08)", color: C.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><IconX /></button>
        <button onClick={() => handleSwipe("right")} style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid rgba(74,230,138,.3)", background: "rgba(74,230,138,.08)", color: C.green, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><IconHeart /></button>
      </div>
      <div style={{ display: "flex", gap: 40, color: "rgba(255,255,255,.2)", fontSize: 12, fontWeight: 500 }}><span>← No</span><span>Yes →</span></div>
    </div>
  );
}
