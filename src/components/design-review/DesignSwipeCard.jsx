import { useState, useRef } from "react";
import { C, F } from "../shared";

export default function DesignSwipeCard({ design, onSwipe, isTop }) {
  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [swipeLabel, setSwipeLabel] = useState(null);
  const [exiting, setExiting] = useState(null);

  const getDir = (dx, dy) => {
    if (dy < -80) return "up";
    if (Math.abs(dx) > 80) return dx > 0 ? "right" : "left";
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
    const dy = e.clientY - startPos.current.y;
    currentPos.current = { x: dx, y: dy };
    setOffset({ x: dx, y: dy });
    setSwipeLabel(getDir(dx, dy));
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dir = getDir(currentPos.current.x, currentPos.current.y);
    if (dir) {
      setExiting(dir);
      setTimeout(() => onSwipe(dir), 320);
    } else {
      setOffset({ x: 0, y: 0 });
      setSwipeLabel(null);
    }
  };

  const exitT = {
    left: "translate(-150%,40px) rotate(-25deg)",
    right: "translate(150%,40px) rotate(25deg)",
    up: "translate(0,-150%) scale(0.9)",
  };

  const transform = exiting
    ? exitT[exiting]
    : `translate(${offset.x}px,${offset.y}px) rotate(${offset.x * 0.06}deg)`;

  const lc = { left: C.red, right: C.green, up: C.purple };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "absolute",
        inset: 0,
        transform,
        transition: exiting
          ? "transform .35s cubic-bezier(.4,0,.2,1),opacity .35s"
          : isDragging.current
          ? "none"
          : "transform .4s cubic-bezier(.18,.89,.32,1.28)",
        opacity: exiting ? 0 : 1,
        cursor: isTop ? "grab" : "default",
        touchAction: "none",
        zIndex: isTop ? 10 : 1,
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 20,
          overflow: "hidden",
          background: C.card,
          boxShadow: isTop
            ? "0 20px 60px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.06)"
            : "0 8px 30px rgba(0,0,0,.3)",
          position: "relative",
        }}
      >
        <img
          src={design.url}
          alt={design.name}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            pointerEvents: "none",
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(transparent,rgba(0,0,0,.85))",
            display: "flex",
            alignItems: "flex-end",
            padding: "24px 28px",
          }}
        >
          <span
            style={{
              color: C.white,
              fontFamily: F,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-.02em",
            }}
          >
            {design.name}
          </span>
        </div>

        {swipeLabel && !exiting && (
          <div
            style={{
              position: "absolute",
              top: 28,
              ...(swipeLabel === "left"
                ? { right: 28 }
                : swipeLabel === "right"
                ? { left: 28 }
                : { left: "50%", transform: "translateX(-50%)" }),
              padding: "8px 20px",
              borderRadius: 10,
              border: `3px solid ${lc[swipeLabel]}`,
              color: lc[swipeLabel],
              fontFamily: F,
              fontWeight: 800,
              fontSize: 22,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              transform:
                swipeLabel === "up"
                  ? "translateX(-50%)"
                  : `rotate(${swipeLabel === "left" ? 15 : -15}deg)`,
              background: "rgba(0,0,0,.5)",
              backdropFilter: "blur(4px)",
            }}
          >
            {swipeLabel === "left"
              ? "Nope"
              : swipeLabel === "right"
              ? "Love it"
              : "Feedback"}
          </div>
        )}
      </div>
    </div>
  );
}
