import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, F, FS, uid, DEMO_QUESTIONS, Q_EMOJIS } from "../shared";
import { IconBack, IconCheck, IconCopy, IconHeart, IconPlus, IconTrash, IconX } from "../shared";
import { createSurvey } from "../../lib/supabase";
import SurveySwipeCard from "./SurveySwipeCard";

export default function SurveyApp() {
  const navigate = useNavigate();
  const [view, setView] = useState("home");
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const addQuestion = () => {
    if (!newQ.trim()) return;
    setQuestions((prev) => [...prev, { id: uid(), text: newQ.trim(), emoji: Q_EMOJIS[prev.length % Q_EMOJIS.length] }]);
    setNewQ("");
  };

  const removeQuestion = (id) => setQuestions((prev) => prev.filter((q) => q.id !== id));

  const generateLink = async () => {
    setGenerating(true);
    try {
      const surveyId = await createSurvey(questions);
      setShareUrl(`${window.location.origin}/s/${surveyId}`);
      setView("share");
    } catch (err) {
      console.error("Failed to create survey:", err);
    } finally {
      setGenerating(false);
    }
  };

  const startSurvey = (useDemo) => {
    if (useDemo) setQuestions(DEMO_QUESTIONS);
    setCurrentIndex(0);
    setAnswers([]);
    setView("survey");
  };

  const handleSwipe = (dir) => {
    setAnswers((prev) => [...prev, { qId: questions[currentIndex].id, answer: dir }]);
    if (currentIndex + 1 >= questions.length) setTimeout(() => setView("done"), 320);
    setCurrentIndex((prev) => prev + 1);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setView("home");
    setQuestions([]);
    setShareUrl("");
    setCurrentIndex(0);
    setAnswers([]);
  };

  return (
    <>
      {/* HOME */}
      {view === "home" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 32, padding: "40px 24px", textAlign: "center", maxWidth: 460, margin: "0 auto" }}>
          <button onClick={() => navigate("/")} style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", color: "#777", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: F, fontSize: 14 }}><IconBack /> All Demos</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(124,58,237,.4)", fontSize: 24 }}>📊</div>
            <span style={{ fontFamily: FS, fontSize: 30, color: C.white, letterSpacing: "-.02em" }}>SwipeSurvey</span>
          </div>
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.6, maxWidth: 340, margin: 0 }}>Create yes-or-no questions. Share a link. Recipients swipe through to answer. Instant results.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
            <button onClick={() => setView("create")} style={{ padding: "16px 0", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, color: C.white, fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 24px rgba(124,58,237,.3)" }}>Create Survey</button>
            <button onClick={() => startSurvey(true)} style={{ padding: "16px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)", color: "rgba(255,255,255,.7)", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>Try Demo Survey</button>
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 16 }}>
            {[{ icon: "←", label: "No", color: C.red }, { icon: "→", label: "Yes", color: C.green }].map((h) => (
              <div key={h.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${h.color}11`, border: `1px solid ${h.color}33`, display: "flex", alignItems: "center", justifyContent: "center", color: h.color, fontSize: 22, fontWeight: 700 }}>{h.icon}</div>
                <span style={{ color: "rgba(255,255,255,.35)", fontSize: 12, fontWeight: 500 }}>{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE */}
      {view === "create" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", gap: 20, width: "100%", maxWidth: 520, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontFamily: F }}><IconBack /> Back</button>
            <span style={{ fontFamily: FS, fontSize: 22, color: C.white }}>Create Survey</span>
            <div style={{ width: 60 }} />
          </div>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <input value={newQ} onChange={(e) => setNewQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addQuestion()} placeholder="Type a yes/no question…" style={{ flex: 1, padding: "14px 18px", borderRadius: 14, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)", color: C.white, fontFamily: F, fontSize: 15, outline: "none" }} />
            <button onClick={addQuestion} style={{ width: 50, borderRadius: 14, border: "none", background: newQ.trim() ? `linear-gradient(135deg,${C.purple},${C.purpleDark})` : "rgba(255,255,255,0.04)", color: newQ.trim() ? C.white : "rgba(255,255,255,0.2)", cursor: newQ.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}><IconPlus /></button>
          </div>
          {questions.length > 0 ? (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", fontFamily: F }}>{questions.length} question{questions.length !== 1 ? "s" : ""}</div>
              {questions.map((q, i) => (
                <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 14, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{q.emoji}</span>
                  <div style={{ flex: 1 }}><span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, fontWeight: 700, fontFamily: F }}>{i + 1}.</span><span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: F, marginLeft: 6 }}>{q.text}</span></div>
                  <button onClick={() => removeQuestion(q.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }} onMouseEnter={(e) => (e.currentTarget.style.color = C.red)} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}><IconTrash /></button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "48px 16px", textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: 14, fontFamily: F }}>Add some yes-or-no questions to get started.</div>
          )}
          {questions.length > 0 && (
            <button
              onClick={generateLink}
              disabled={generating}
              style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, color: C.white, fontSize: 16, fontWeight: 600, cursor: generating ? "wait" : "pointer", boxShadow: "0 4px 24px rgba(124,58,237,.3)", marginTop: 4, opacity: generating ? 0.7 : 1 }}
            >
              {generating ? "Generating link…" : "Generate Share Link →"}
            </button>
          )}
        </div>
      )}

      {/* SHARE */}
      {view === "share" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 28, padding: "40px 24px", maxWidth: 460, margin: "0 auto" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,rgba(74,230,138,.15),rgba(74,230,138,.05))", border: "1px solid rgba(74,230,138,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: C.green, fontSize: 34 }}>✓</div>
          <div style={{ fontFamily: FS, fontSize: 28, color: C.white, textAlign: "center" }}>Ready to Share</div>
          <p style={{ color: C.dim, fontSize: 14, textAlign: "center", margin: 0, lineHeight: 1.6 }}>{questions.length} question{questions.length !== 1 ? "s" : ""} ready.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", maxWidth: 380, padding: "14px 18px", borderRadius: 14, background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}` }}>
            <span style={{ flex: 1, color: "rgba(255,255,255,.7)", fontSize: 14, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareUrl}</span>
            <button onClick={copyLink} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", background: copied ? "rgba(74,230,138,.15)" : "rgba(167,139,250,.15)", color: copied ? C.green : C.purple, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {copied ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
            </button>
          </div>
          <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 380 }}>
            <button onClick={() => startSurvey(false)} style={{ flex: 1, padding: "14px 0", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, color: C.white, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Preview Survey</button>
            <button onClick={reset} style={{ padding: "14px 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.6)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Done</button>
          </div>
        </div>
      )}

      {/* SURVEY */}
      {view === "survey" && currentIndex < questions.length && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 420, padding: "28px 20px", gap: 24, minHeight: "100vh", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <button onClick={reset} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><IconBack /></button>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,.06)" }}>
              <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${C.purple},${C.purpleDark})`, width: `${(currentIndex / questions.length) * 100}%`, transition: "width .3s ease" }} />
            </div>
            <span style={{ color: "rgba(255,255,255,.35)", fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: "right" }}>{currentIndex + 1}/{questions.length}</span>
          </div>
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
      )}

      {/* RESULTS */}
      {view === "done" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "40px 20px", maxWidth: 480, margin: "0 auto", width: "100%" }}>
          <div style={{ fontFamily: FS, fontSize: 34, color: C.white, textAlign: "center" }}>Survey Complete</div>
          <div style={{ display: "flex", gap: 16, width: "100%" }}>
            {[
              { label: "Yes", count: answers.filter((a) => a.answer === "right").length, color: C.green, bg: "rgba(74,230,138,0.08)" },
              { label: "No", count: answers.filter((a) => a.answer === "left").length, color: C.red, bg: "rgba(255,68,88,0.08)" },
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
          <button onClick={reset} style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: C.white, fontFamily: F, fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 8 }}>Start Over</button>
        </div>
      )}
    </>
  );
}
