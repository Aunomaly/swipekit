import { useState } from "react";
import { C, F, FS } from "../shared";

export default function DesignResults({ results, designs, onReset, reviewerName }) {
  const approved = results.filter((r) => r.verdict === "right");
  const rejected = results.filter((r) => r.verdict === "left");
  const annotated = results.filter((r) => r.verdict === "up");
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "40px 20px", maxWidth: 480, margin: "0 auto", width: "100%" }}>
      <div style={{ fontFamily: FS, fontSize: 34, color: C.white, textAlign: "center" }}>Review Complete</div>
      {reviewerName && (
        <p style={{ color: C.dim, fontSize: 15, margin: 0, textAlign: "center" }}>
          Submitted by <strong style={{ color: C.white }}>{reviewerName}</strong>
        </p>
      )}

      <div style={{ display: "flex", gap: 16, width: "100%" }}>
        {[
          { label: "Approved", count: approved.length, color: C.green, bg: "rgba(74,230,138,0.08)" },
          { label: "Rejected", count: rejected.length, color: C.red, bg: "rgba(255,68,88,0.08)" },
          { label: "Feedback", count: annotated.length, color: C.purple, bg: "rgba(167,139,250,0.08)" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 16, padding: "20px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color, fontFamily: F }}>{s.count}</div>
            <div style={{ fontSize: 12, color: C.dim, fontFamily: F, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        {results.map((r) => {
          const d = designs.find((dd) => dd.id === r.designId);
          const colors = { left: C.red, right: C.green, up: C.purple };
          const labels = { left: "Rejected", right: "Approved", up: "Feedback" };
          const expanded = expandedId === r.designId;

          return (
            <div key={r.designId}>
              <div
                onClick={() => r.verdict === "up" && setExpandedId(expanded ? null : r.designId)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: expanded ? "14px 14px 0 0" : 14,
                  border: "1px solid rgba(255,255,255,0.06)",
                  cursor: r.verdict === "up" ? "pointer" : "default",
                  borderBottom: expanded ? "none" : undefined,
                }}
              >
                <img src={d?.url} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.white, fontFamily: F, fontSize: 14, fontWeight: 500 }}>{d?.name}</div>
                  {r.annotation?.text && <div style={{ color: C.dim, fontSize: 12, fontFamily: F, marginTop: 2 }}>{r.annotation.text}</div>}
                  {r.annotation && (
                    <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                      {r.annotation.pins?.length > 0 && <span style={{ color: "rgba(167,139,250,0.6)", fontSize: 11, fontFamily: F }}>{r.annotation.pins.length} pin(s)</span>}
                      {r.annotation.strokeCount > 0 && <span style={{ color: "rgba(167,139,250,0.6)", fontSize: 11, fontFamily: F }}>{r.annotation.strokeCount} markup(s)</span>}
                      {r.annotation.refImages?.length > 0 && <span style={{ color: "rgba(167,139,250,0.6)", fontSize: 11, fontFamily: F }}>{r.annotation.refImages.length} ref(s)</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: colors[r.verdict], fontFamily: F, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>{labels[r.verdict]}</span>
                  {r.verdict === "up" && <span style={{ color: C.dim, fontSize: 14, transition: "transform .2s", transform: expanded ? "rotate(180deg)" : "none" }}>▾</span>}
                </div>
              </div>

              {expanded && r.annotation && (
                <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", borderRadius: "0 0 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {r.annotation.canvasData && <img src={r.annotation.canvasData} alt="markup" style={{ width: "100%", borderRadius: 10, display: "block" }} />}
                  {r.annotation.refImages?.length > 0 && (
                    <div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", fontFamily: F, marginBottom: 6 }}>References attached</div>
                      <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                        {r.annotation.refImages.map((ri) => <img key={ri.id} src={ri.url} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={onReset} style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: C.white, fontFamily: F, fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 8 }}>Start Over</button>
    </div>
  );
}
