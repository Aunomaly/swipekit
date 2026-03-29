import { useState, useRef } from "react";
import { C, F, FS, GRADIENTS } from "../shared";

export default function SurveySwipeCard({ question, isTop, onSwipe, index, total }) {
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [label, setLabel] = useState(null);
  const [exiting, setExiting] = useState(null);

  const getDir = (dx) => {
    if (dx > 90) return "right";
    if (dx < -90) return "left";
    return null;
  };

  const onPointerDown = (e) => {
    if (!isTop) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startPos.current.x;
    currentPos.current = { x: dx, y: 0 };
    setOffset({ x: dx, y: (e.clientY - startPos.current.y) * 0.3 });
    setLabel(getDir(dx));
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dir = getDir(currentPos.current.x);
    if (dir) {
      setExiting(dir);
      setTimeout(() => onSwipe(dir), 300);
    } else {
      setOffset({ x: 0, y: 0 });
      setLabel(null);
    }
  };

  const exitT = {
    left: "translate(-150%,40px) rotate(-25deg)",
    right: "translate(150%,40px) rotate(25deg)",
  };
  const transform = exiting
    ? exitT[exiting]
    : `translate(${offset.x}px,${offset.y}px) rotate(${offset.x * 0.05}deg)`;
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "absolute", inset: 0, transform,
        transition: exiting
          ? "transform .32s cubic-bezier(.4,0,.2,1),opacity .32s"
          : isDragging.current ? "none" : "transform .4s cubic-bezier(.18,.89,.32,1.28)",
        opacity: exiting ? 0 : 1,
        cursor: isTop ? "grab" : "default",
        touchAction: "none", zIndex: isTop ? 10 : 1, userSelect: "none",
      }}
    >
      <div style={{
        width: "100%", height: "100%", borderRadius: 24, overflow: "hidden",
        background: gradient,
        boxShadow: isTop
          ? "0 20px 60px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.06),inset 0 1px 0 rgba(255,255,255,.05)"
          : "0 8px 30px rgba(0,0,0,.3)",
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "48px 36px", textAlign: "center",
      }}>
        {/* decorative */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(167,139,250,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(167,139,250,0.03)", pointerEvents: "none" }} />

        <div style={{ position: "absolute", top: 24, left: 28, color: "rgba(255,255,255,0.15)", fontFamily: F, fontSize: 13, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
          {index + 1} of {total}
        </div>

        <div style={{ fontSize: 56, marginBottom: 28, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}>
          {question.emoji}
        </div>

        <div style={{ fontFamily: FS, fontSize: 28, color: C.white, lineHeight: 1.35, letterSpacing: "-.01em", maxWidth: 320 }}>
          {question.text}
        </div>

        {label && !exiting && (
          <div style={{
            position: "absolute", top: 28,
            ...(label === "left" ? { right: 28 } : { left: 28 }),
            padding: "10px 24px", borderRadius: 12,
            border: `3px solid ${label === "left" ? C.red : C.green}`,
            color: label === "left" ? C.red : C.green,
            fontFamily: F, fontWeight: 800, fontSize: 24,
            textTransform: "uppercase", letterSpacing: ".08em",
            transform: `rotate(${label === "left" ? 12 : -12}deg)`,
            background: "rgba(0,0,0,.4)", backdropFilter: "blur(4px)",
          }}>
            {label === "left" ? "Nope" : "Yes!"}
          </div>
        )}
      </div>
    </div>
  );
}
