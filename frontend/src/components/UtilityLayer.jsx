"use client";
import { useEffect, useRef, useState } from "react";

export default function UtilityLayer({
  utilities,
  updateUtility,
  deleteUtility
}) {
  const canvasRef = useRef(null);
  const layerRef = useRef(null);

  const draggingId = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const lastPointerRef = useRef({ x: 0, y: 0 });

  const [deletingId, setDeletingId] = useState(null);
  const FADE_MS = 160;

  /* ================= DRAW ================= */
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 1000, 1000);

    utilities?.forEach((u) => {
      if (u.type !== "bolt") return;

      const cx = u.x;
      const cy = u.y;
      const r = u.radius || 40;

      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = rect.width / rect.height;

      ctx.save();

      if (deletingId === u.id) {
        ctx.globalAlpha = 0.25;
      }

      if (u.type === "zone") {
  const cx = u.x;
  const cy = u.y;
  const r = u.radius || 300;

  const rect = canvasRef.current.getBoundingClientRect();
  const scaleX = rect.width / rect.height;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1 / scaleX, 1);
  ctx.translate(-cx, -cy);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#00ffe1";
  ctx.shadowColor = "#00ffe1";
  ctx.shadowBlur = 18;
  ctx.stroke();

  ctx.restore();
}

      // counter stretch so circle stays perfect
      ctx.translate(cx, cy);
      ctx.scale(1 / scaleX, 1);
      ctx.translate(-cx, -cy);

      const grad = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r);
      grad.addColorStop(0, "rgba(255,120,120,0.35)");
      grad.addColorStop(0.4, "rgba(255,60,60,0.28)");
      grad.addColorStop(0.75, "rgba(200,20,20,0.35)");
      grad.addColorStop(1, "rgba(90,0,0,0.55)");

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ff3b3b";
      ctx.shadowColor = "#ff3b3b";
      ctx.shadowBlur = 14;
      ctx.stroke();

      ctx.restore();
    });
  }, [utilities, deletingId]);

  /* ================= DIRECT POINTER DRAG ================= */
  const startDrag = (e, u) => {
    if (!layerRef.current) return;

    const rect = layerRef.current.getBoundingClientRect();
    draggingId.current = u.id;

    offset.current = {
      x: ((e.clientX - rect.left) / rect.width) * 1000 - u.x,
      y: ((e.clientY - rect.top) / rect.height) * 1000 - u.y
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const moveDrag = (e) => {
    if (!draggingId.current) return;
    if (!layerRef.current) return;

    lastPointerRef.current = {
      x: e.clientX,
      y: e.clientY
    };

    const rect = layerRef.current.getBoundingClientRect();

    const x =
      ((e.clientX - rect.left) / rect.width) * 1000 - offset.current.x;

    const y =
      ((e.clientY - rect.top) / rect.height) * 1000 - offset.current.y;

    updateUtility?.(draggingId.current, (u) => ({
      ...u,
      x: Math.max(0, Math.min(1000, x)),
      y: Math.max(0, Math.min(1000, y))
    }));
  };

  const endDrag = () => {
    if (!draggingId.current) return;

    const id = draggingId.current;
    draggingId.current = null;

    const bin = document.getElementById("map-bin");
    if (!bin) return;

    const r = bin.getBoundingClientRect();
    const { x, y } = lastPointerRef.current;

    const overBin =
      x >= r.left && x <= r.right &&
      y >= r.top && y <= r.bottom;

    if (overBin) {
      setDeletingId(id);
      setTimeout(() => {
        deleteUtility?.(id);
        setDeletingId(null);
      }, FADE_MS);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div
      ref={layerRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none"
      }}
    >
      {/* DRAG HITBOX */}
      {utilities?.map((u) => {
        if (u.type !== "bolt") return null;

        return (
          <div
            key={u.id}
            onPointerDown={(e) => {
              startDrag(e, u);
              e.stopPropagation();
            }}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{
              position: "absolute",
              left: `${u.x / 10}%`,
              top: `${u.y / 10}%`,
              transform: "translate(-50%, -50%)",
              width: 120,
              height: 120,
              borderRadius: "50%",
              cursor: "grab",
              pointerEvents: "auto",
              touchAction: "none"
            }}
          />
        );
      })}

      {/* CANVAS */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={1000}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none"
        }}
      />
    </div>
  );
}




