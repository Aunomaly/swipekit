import { useState, useRef, useCallback, useEffect } from "react";
import { C, F, FS, DRAW_COLORS, uid } from "../shared";
import { IconBack, IconCheck, ToolIcons } from "../shared";

export default function AnnotationOverlay({ design, onSubmit, onCancel }) {
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState(C.red);
  const [brushSize, setBrushSize] = useState(3);
  const [text, setText] = useState("");
  const [pins, setPins] = useState([]);
  const [activePin, setActivePin] = useState(null);
  const [pinText, setPinText] = useState("");
  const [refImages, setRefImages] = useState([]);
  const [refPreview, setRefPreview] = useState(null);
  const [showColors, setShowColors] = useState(false);
  const [tab, setTab] = useState("markup");
  const [textInput, setTextInput] = useState(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const drawingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const pathsRef = useRef([]);
  const currentPathRef = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { imgRef.current = img; setImgLoaded(true); };
    img.onerror = () => { imgRef.current = null; setImgLoaded(true); };
    img.src = design.url;
  }, [design.url]);

  useEffect(() => {
    if (!imgLoaded || !canvasRef.current || !containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    const img = imgRef.current;
    const aspect = img ? img.naturalWidth / img.naturalHeight : 4 / 3;
    const h = Math.round(w / aspect);
    [canvasRef, overlayCanvasRef].forEach((ref) => {
      const c = ref.current;
      if (!c) return;
      c.width = w * 2;
      c.height = h * 2;
      c.style.width = w + "px";
      c.style.height = h + "px";
      c.getContext("2d").scale(2, 2);
    });
    if (img) canvasRef.current.getContext("2d").drawImage(img, 0, 0, w, h);
  }, [imgLoaded]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
  };

  const drawStroke = useCallback((ctx, s) => {
    ctx.save();
    ctx.strokeStyle = s.color;
    ctx.fillStyle = s.color;
    ctx.lineWidth = s.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (s.tool === "highlighter") ctx.globalAlpha = 0.35;

    if (s.tool === "pen" || s.tool === "highlighter") {
      if (s.points.length < 2) { ctx.restore(); return; }
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
      ctx.stroke();
    } else if (s.tool === "arrow") {
      const { x: x1, y: y1 } = s.start, { x: x2, y: y2 } = s.end;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      const a = Math.atan2(y2 - y1, x2 - x1), hl = 14;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - hl * Math.cos(a - Math.PI / 6), y2 - hl * Math.sin(a - Math.PI / 6));
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - hl * Math.cos(a + Math.PI / 6), y2 - hl * Math.sin(a + Math.PI / 6));
      ctx.stroke();
    } else if (s.tool === "rect") {
      ctx.beginPath();
      ctx.rect(s.start.x, s.start.y, s.end.x - s.start.x, s.end.y - s.start.y);
      ctx.stroke();
    } else if (s.tool === "circle") {
      const rx = Math.abs(s.end.x - s.start.x) / 2;
      const ry = Math.abs(s.end.y - s.start.y) / 2;
      ctx.beginPath();
      ctx.ellipse((s.start.x + s.end.x) / 2, (s.start.y + s.end.y) / 2, rx || 1, ry || 1, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (s.tool === "text") {
      ctx.font = `600 ${Math.max(s.size * 4, 14)}px 'DM Sans', sans-serif`;
      ctx.fillText(s.label, s.start.x, s.start.y);
    }
    ctx.restore();
  }, []);

  const redrawAll = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const w = c.width / 2, h = c.height / 2;
    ctx.clearRect(0, 0, w, h);
    if (imgRef.current) ctx.drawImage(imgRef.current, 0, 0, w, h);
    pathsRef.current.forEach((s) => drawStroke(ctx, s));
  }, [drawStroke]);

  const handleDown = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    if (tool === "pin") {
      const rect = canvasRef.current.getBoundingClientRect();
      const np = { id: uid(), x: (pos.x / rect.width) * 100, y: (pos.y / rect.height) * 100, text: "" };
      setPins((p) => [...p, np]);
      setActivePin(np.id);
      setPinText("");
      setTab("comment");
      return;
    }
    if (tool === "text") { setTextInput(pos); return; }
    drawingRef.current = true;
    startRef.current = pos;
    currentPathRef.current = [pos];
  };

  const handleMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const pos = getPos(e);
    if (tool === "pen" || tool === "highlighter") {
      currentPathRef.current.push(pos);
      const ctx = canvasRef.current.getContext("2d");
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = tool === "highlighter" ? brushSize * 3 : brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (tool === "highlighter") ctx.globalAlpha = 0.35;
      const pts = currentPathRef.current;
      if (pts.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }
      ctx.restore();
    } else {
      const oc = overlayCanvasRef.current;
      if (!oc) return;
      const octx = oc.getContext("2d");
      octx.clearRect(0, 0, oc.width / 2, oc.height / 2);
      drawStroke(octx, { tool, color, size: brushSize, start: startRef.current, end: pos, points: [] });
    }
  };

  const handleUp = (e) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const pos = e.changedTouches
      ? (() => { const r = canvasRef.current.getBoundingClientRect(); return { x: e.changedTouches[0].clientX - r.left, y: e.changedTouches[0].clientY - r.top }; })()
      : getPos(e);
    const oc = overlayCanvasRef.current;
    if (oc) oc.getContext("2d").clearRect(0, 0, oc.width / 2, oc.height / 2);
    if (tool === "pen" || tool === "highlighter") {
      pathsRef.current.push({ tool, color, size: tool === "highlighter" ? brushSize * 3 : brushSize, points: [...currentPathRef.current] });
    } else {
      const s = { tool, color, size: brushSize, start: startRef.current, end: pos };
      pathsRef.current.push(s);
      drawStroke(canvasRef.current.getContext("2d"), s);
    }
    setCanUndo(true);
    currentPathRef.current = [];
  };

  const commitText = (label) => {
    if (!label || !textInput) return;
    const s = { tool: "text", color, size: brushSize, start: textInput, label };
    pathsRef.current.push(s);
    drawStroke(canvasRef.current.getContext("2d"), s);
    setCanUndo(true);
    setTextInput(null);
  };

  const undo = () => {
    if (!pathsRef.current.length) return;
    pathsRef.current.pop();
    redrawAll();
    setCanUndo(pathsRef.current.length > 0);
  };

  const savePin = () => {
    if (activePin && pinText.trim()) setPins((p) => p.map((pin) => (pin.id === activePin ? { ...pin, text: pinText } : pin)));
    setActivePin(null);
    setPinText("");
  };

  const handleRefImages = (files) => {
    Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .forEach((f) => {
        setRefImages((prev) => [...prev, { id: uid(), url: URL.createObjectURL(f), name: f.name }]);
      });
  };

  const handleSubmit = () => {
    let canvasData = null;
    if (canvasRef.current) try { canvasData = canvasRef.current.toDataURL("image/png"); } catch (err) { /* noop */ }
    onSubmit({ text, pins, refImages, canvasData, strokeCount: pathsRef.current.length });
  };

  const ToolBtn = ({ id, icon, label }) => (
    <button
      onClick={() => setTool(id)}
      title={label}
      style={{
        width: 36, height: 36, borderRadius: 9, border: "none",
        background: tool === id ? `${color}22` : "rgba(255,255,255,0.04)",
        color: tool === id ? color : "rgba(255,255,255,0.45)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .15s",
        outline: tool === id ? `2px solid ${color}44` : "none",
        outlineOffset: 1,
      }}
    >
      {icon}
    </button>
  );

  const tabStyle = (t) => ({
    flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
    background: tab === t ? "rgba(255,255,255,0.08)" : "transparent",
    color: tab === t ? C.white : C.dim, fontFamily: F, fontSize: 12, fontWeight: 600,
    cursor: "pointer", transition: "all .15s",
  });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(8,8,10,0.97)", backdropFilter: "blur(30px)", display: "flex", flexDirection: "column", alignItems: "center", overflow: "auto" }}>
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 600, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", flexShrink: 0 }}>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: F, fontSize: 14 }}><IconBack /> Cancel</button>
        <span style={{ fontFamily: FS, fontSize: 22, color: C.white }}>Markup &amp; Feedback</span>
        <button onClick={handleSubmit} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${C.purple},${C.purpleDark})`, color: C.white, fontFamily: F, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Submit</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, width: "100%", maxWidth: 600, padding: "0 20px", marginBottom: 10 }}>
        <button style={tabStyle("markup")} onClick={() => setTab("markup")}><span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>{ToolIcons.pen} Canvas</span></button>
        <button style={tabStyle("comment")} onClick={() => setTab("comment")}><span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>{ToolIcons.pin} Pins &amp; Notes</span></button>
        <button style={tabStyle("refs")} onClick={() => setTab("refs")}><span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>{ToolIcons.img} References</span></button>
      </div>

      <div style={{ width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", gap: 12, padding: "0 20px 24px", flexGrow: 1 }}>
        {/* MARKUP TAB */}
        {tab === "markup" && (<>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 13, border: `1px solid ${C.border}`, flexWrap: "wrap" }}>
            <ToolBtn id="pen" icon={ToolIcons.pen} label="Pen" />
            <ToolBtn id="highlighter" icon={ToolIcons.highlighter} label="Highlighter" />
            <ToolBtn id="arrow" icon={ToolIcons.arrow} label="Arrow" />
            <ToolBtn id="rect" icon={ToolIcons.rect} label="Rectangle" />
            <ToolBtn id="circle" icon={ToolIcons.circle} label="Circle" />
            <ToolBtn id="text" icon={ToolIcons.text} label="Text" />
            <ToolBtn id="pin" icon={ToolIcons.pin} label="Drop Pin" />
            <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.08)", margin: "0 3px" }} />
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowColors(!showColors)} style={{ width: 26, height: 26, borderRadius: 7, border: "2px solid rgba(255,255,255,0.15)", background: color, cursor: "pointer" }} />
              {showColors && (
                <div style={{ position: "absolute", top: 38, left: -20, zIndex: 50, display: "flex", gap: 5, padding: "7px 9px", borderRadius: 11, background: "rgba(20,20,24,0.95)", border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(0,0,0,.5)" }}>
                  {DRAW_COLORS.map((c) => (<button key={c} onClick={() => { setColor(c); setShowColors(false); }} style={{ width: 24, height: 24, borderRadius: 6, border: c === color ? "2px solid #fff" : "2px solid transparent", background: c, cursor: "pointer" }} />))}
                </div>
              )}
            </div>
            <input type="range" min={1} max={10} value={brushSize} onChange={(e) => setBrushSize(+e.target.value)} style={{ width: 56, accentColor: color, cursor: "pointer" }} />
            <div style={{ flex: 1 }} />
            <button onClick={undo} disabled={!canUndo} title="Undo" style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: canUndo ? "rgba(255,255,255,0.06)" : "transparent", color: canUndo ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)", cursor: canUndo ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6.69 3L3 13" /></svg>
            </button>
          </div>
          <div ref={containerRef} style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, background: "#111", touchAction: "none" }}>
            <canvas ref={canvasRef} onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onTouchStart={handleDown} onTouchMove={handleMove} onTouchEnd={handleUp} style={{ display: "block", cursor: tool === "pin" ? "crosshair" : tool === "text" ? "text" : "crosshair", touchAction: "none" }} />
            <canvas ref={overlayCanvasRef} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", display: "block" }} />
            {pins.map((pin, i) => (
              <div key={pin.id} onClick={() => { setActivePin(pin.id); setPinText(pin.text); setTab("comment"); }} style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%,-100%)", cursor: "pointer", zIndex: 20 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", background: C.purple, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(167,139,250,0.5)", border: activePin === pin.id ? "2px solid #fff" : "2px solid transparent" }}>
                  <span style={{ transform: "rotate(45deg)", color: C.white, fontSize: 11, fontWeight: 800, fontFamily: F }}>{i + 1}</span>
                </div>
              </div>
            ))}
            {textInput && (
              <div style={{ position: "absolute", left: textInput.x, top: textInput.y, zIndex: 30, display: "flex", gap: 4 }}>
                <input autoFocus placeholder="Type here…" onKeyDown={(e) => { if (e.key === "Enter") commitText(e.target.value); if (e.key === "Escape") setTextInput(null); }} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${color}66`, background: "rgba(0,0,0,0.8)", color: C.white, fontFamily: F, fontSize: 13, outline: "none", width: 160 }} />
                <button onClick={() => setTextInput(null)} style={{ background: "rgba(0,0,0,0.8)", border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: "pointer", padding: "4px 8px", fontSize: 12 }}>×</button>
              </div>
            )}
            <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", padding: "4px 12px", borderRadius: 7, color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: F, whiteSpace: "nowrap", pointerEvents: "none" }}>
              {tool === "pin" ? "Tap to drop a pin" : tool === "text" ? "Tap to place text" : "Draw on the design"}
            </div>
          </div>
        </>)}

        {/* PINS & NOTES TAB */}
        {tab === "comment" && (<>
          {pins.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", fontFamily: F }}>Pin Notes</div>
              {pins.map((pin, i) => (
                <div key={pin.id} onClick={() => { setActivePin(pin.id); setPinText(pin.text); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: activePin === pin.id ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${activePin === pin.id ? "rgba(167,139,250,0.3)" : C.border}`, cursor: "pointer" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.purple, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: F, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ color: pin.text ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)", fontSize: 13, fontFamily: F, flex: 1 }}>{pin.text || "No note yet…"}</span>
                  <button onClick={(e) => { e.stopPropagation(); setPins((p) => p.filter((pp) => pp.id !== pin.id)); if (activePin === pin.id) setActivePin(null); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>
          )}
          {activePin && (
            <div style={{ display: "flex", gap: 8 }}>
              <input autoFocus value={pinText} onChange={(e) => setPinText(e.target.value)} placeholder={`Note for pin #${pins.findIndex((p) => p.id === activePin) + 1}…`} onKeyDown={(e) => e.key === "Enter" && savePin()} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.06)", color: C.white, fontFamily: F, fontSize: 14, outline: "none" }} />
              <button onClick={savePin} style={{ padding: "12px 16px", borderRadius: 12, border: "none", background: C.purple, color: C.white, cursor: "pointer" }}><IconCheck /></button>
            </div>
          )}
          {pins.length === 0 && (<div style={{ textAlign: "center", padding: "32px 16px", color: "rgba(255,255,255,0.2)", fontSize: 13, fontFamily: F }}>Switch to Canvas tab and use the pin tool to drop pins.</div>)}
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", fontFamily: F, marginTop: 8 }}>General Feedback</div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Overall thoughts…" rows={4} style={{ width: "100%", padding: "14px 18px", borderRadius: 14, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)", color: C.white, fontFamily: F, fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        </>)}

        {/* REFERENCES TAB */}
        {tab === "refs" && (<>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", fontFamily: F }}>Reference Images</div>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, fontFamily: F, margin: 0, lineHeight: 1.5 }}>Attach screenshots or examples to support your feedback.</p>
          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "28px 16px", borderRadius: 16, border: "2px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", cursor: "pointer" }}>
            <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => handleRefImages(e.target.files)} />
            <svg width="28" height="28" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontFamily: F }}>Add reference images</span>
          </label>
          {refImages.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {refImages.map((ri) => (
                <div key={ri.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "1", background: C.card, cursor: "pointer" }} onClick={() => setRefPreview(ri)}>
                  <img src={ri.url} alt={ri.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <button onClick={(e) => { e.stopPropagation(); setRefImages((prev) => prev.filter((r) => r.id !== ri.id)); }} style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>×</button>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 8px 6px", background: "linear-gradient(transparent,rgba(0,0,0,0.8))" }}><span style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: F, wordBreak: "break-all" }}>{ri.name}</span></div>
                </div>
              ))}
            </div>
          )}
        </>)}
      </div>

      {/* Ref preview modal */}
      {refPreview && (
        <div onClick={() => setRefPreview(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 32 }}>
          <img src={refPreview.url} alt="" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 16 }} />
          <button onClick={() => setRefPreview(null)} style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: C.white, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
      )}
    </div>
  );
}
