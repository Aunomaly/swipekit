import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, F, FS, uid, SAMPLE_DESIGNS } from "../shared";
import { IconBack, IconCheck, IconCopy, IconHeart, IconPen, IconUpload, IconX } from "../shared";
import { createSession, uploadDesignImage } from "../../lib/supabase";
import DesignSwipeCard from "./DesignSwipeCard";
import AnnotationOverlay from "./AnnotationOverlay";
import DesignResults from "./DesignResults";

export default function DesignReviewApp() {
  const navigate = useNavigate();
  const [view, setView] = useState("home");
  const [designs, setDesigns] = useState([]);
  const [shareId, setShareId] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [annotating, setAnnotating] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleFiles = async (files) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        imageFiles.map(async (f) => {
          const { url, storagePath } = await uploadDesignImage(f);
          return {
            id: uid(),
            url,
            storagePath,
            name: f.name.replace(/\.[^.]+$/, ""),
          };
        })
      );
      setDesigns((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const generateLink = async () => {
    setGenerating(true);
    try {
      const sessionId = await createSession(designs);
      const url = `${window.location.origin}/r/${sessionId}`;
      setShareId(sessionId);
      setShareUrl(url);
      setView("share");
    } catch (err) {
      console.error("Failed to create session:", err);
    } finally {
      setGenerating(false);
    }
  };

  const startReview = (useSamples) => {
    if (useSamples) setDesigns(SAMPLE_DESIGNS);
    setCurrentIndex(0);
    setResults([]);
    setView("review");
  };

  const handleSwipe = (dir) => {
    if (dir === "up") { setAnnotating(designs[currentIndex]); return; }
    setResults((prev) => [...prev, { designId: designs[currentIndex].id, designName: designs[currentIndex].name, verdict: dir }]);
    if (currentIndex + 1 >= designs.length) setTimeout(() => setView("done"), 350);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleAnnotationSubmit = (annotation) => {
    setResults((prev) => [...prev, { designId: annotating.id, designName: annotating.name, verdict: "up", annotation }]);
    setAnnotating(null);
    if (currentIndex + 1 >= designs.length) setTimeout(() => setView("done"), 100);
    setCurrentIndex((prev) => prev + 1);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setView("home");
    setDesigns([]);
    setShareId("");
    setShareUrl("");
    setCurrentIndex(0);
    setResults([]);
  };

  return (
    <>
      {/* HOME */}
      {view === "home" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 32, padding: "40px 24px", textAlign: "center", maxWidth: 460, margin: "0 auto" }}>
          <button onClick={() => navigate("/")} style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", color: "#777", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: F, fontSize: 14 }}><IconBack /> All Demos</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(124,58,237,.4)" }}>
              <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 16l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span style={{ fontFamily: FS, fontSize: 30, color: C.white, letterSpacing: "-.02em" }}>DesignSwipe</span>
          </div>
          <p style={{ color: C.dim, fontSize: 16, lineHeight: 1.6, maxWidth: 340, margin: 0 }}>Upload designs. Share a link. Reviewers swipe to approve, reject, or markup with full canvas annotation.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
            <button onClick={() => setView("upload")} style={{ padding: "16px 0", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, color: C.white, fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 24px rgba(124,58,237,.3)" }}>Upload Designs</button>
            <button onClick={() => startReview(true)} style={{ padding: "16px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)", color: "rgba(255,255,255,.7)", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>Try Demo Review</button>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
            {[{ icon: "←", label: "Reject", color: C.red }, { icon: "→", label: "Approve", color: C.green }, { icon: "↑", label: "Markup", color: C.purple }].map((h) => (
              <div key={h.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${h.color}11`, border: `1px solid ${h.color}33`, display: "flex", alignItems: "center", justifyContent: "center", color: h.color, fontSize: 20, fontWeight: 700 }}>{h.icon}</div>
                <span style={{ color: "rgba(255,255,255,.35)", fontSize: 11, fontWeight: 500 }}>{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPLOAD */}
      {view === "upload" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", gap: 24, width: "100%", maxWidth: 520, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}><IconBack /> Back</button>
            <span style={{ fontFamily: FS, fontSize: 22, color: C.white }}>Upload Designs</span>
            <div style={{ width: 60 }} />
          </div>
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            style={{ width: "100%", minHeight: 200, borderRadius: 20, border: `2px dashed ${dragOver ? C.purple : "rgba(255,255,255,.1)"}`, background: dragOver ? "rgba(167,139,250,.06)" : "rgba(255,255,255,.02)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, cursor: uploading ? "wait" : "pointer", boxSizing: "border-box" }}
          >
            <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
            <div style={{ color: "rgba(255,255,255,.3)" }}><IconUpload /></div>
            <span style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>
              {uploading ? "Uploading…" : "Drop images here or tap to browse"}
            </span>
          </label>
          {designs.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, width: "100%" }}>
              {designs.map((d) => (
                <div key={d.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1", background: C.card }}>
                  <img src={d.url} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <button onClick={() => setDesigns((prev) => prev.filter((dd) => dd.id !== d.id))} style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>×</button>
                </div>
              ))}
            </div>
          )}
          {designs.length > 0 && (
            <button
              onClick={generateLink}
              disabled={generating || uploading}
              style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, color: C.white, fontSize: 16, fontWeight: 600, cursor: generating ? "wait" : "pointer", boxShadow: "0 4px 24px rgba(124,58,237,.3)", opacity: generating ? 0.7 : 1 }}
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
          <p style={{ color: C.dim, fontSize: 14, textAlign: "center", margin: 0, lineHeight: 1.6 }}>{designs.length} design{designs.length > 1 ? "s" : ""} uploaded.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", maxWidth: 380, padding: "14px 18px", borderRadius: 14, background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}` }}>
            <span style={{ flex: 1, color: "rgba(255,255,255,.7)", fontSize: 14, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareUrl}</span>
            <button onClick={copyLink} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", background: copied ? "rgba(74,230,138,.15)" : "rgba(167,139,250,.15)", color: copied ? C.green : C.purple, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {copied ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
            </button>
          </div>
          <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 380 }}>
            <button onClick={() => startReview(false)} style={{ flex: 1, padding: "14px 0", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, color: C.white, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Preview as Reviewer</button>
            <button onClick={reset} style={{ padding: "14px 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "rgba(255,255,255,.6)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Done</button>
          </div>
        </div>
      )}

      {/* REVIEW */}
      {view === "review" && currentIndex < designs.length && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 420, padding: "28px 20px", gap: 20, minHeight: "100vh", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <button onClick={reset} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer" }}><IconBack /></button>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,.06)" }}>
              <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${C.purple},${C.purpleDark})`, width: `${(currentIndex / designs.length) * 100}%`, transition: "width .3s ease" }} />
            </div>
            <span style={{ color: "rgba(255,255,255,.35)", fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: "right" }}>{currentIndex + 1}/{designs.length}</span>
          </div>
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

      {view === "done" && <DesignResults results={results} designs={designs} onReset={reset} />}
      {annotating && <AnnotationOverlay design={annotating} onSubmit={handleAnnotationSubmit} onCancel={() => setAnnotating(null)} />}
    </>
  );
}
