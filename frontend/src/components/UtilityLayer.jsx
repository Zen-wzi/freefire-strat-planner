"use client";
import { useEffect, useRef } from "react";

export default function UtilityLayer({
  utilities,
  containerSize,
  updateUtility
}) {
  const canvasRef = useRef(null);
  const layerRef = useRef(null);

  const draggingRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  /* ================= DRAW ================= */
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    ctx.clearRect(0, 0, 1000, 600);

    if (!utilities?.length) return;

    utilities.forEach((u) => {

  if (u.type === "bolt") {
    const cx = u.x;
    const cy = u.y;
    const r = u.radius || 40;

    ctx.save();

    // reset transform so circle never becomes oval
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // gradient (light center → dark edge)
    const grad = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r);
    grad.addColorStop(0, "rgba(255,120,120,0.35)");
    grad.addColorStop(0.4, "rgba(255,60,60,0.28)");
    grad.addColorStop(0.75, "rgba(200,20,20,0.35)");
    grad.addColorStop(1, "rgba(90,0,0,0.55)");

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.closePath();

    // neon ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ff3b3b";
    ctx.shadowColor = "#ff3b3b";
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.closePath();

    ctx.shadowBlur = 0;
   ctx.restore();
  }

});

}, [utilities]);

  /* ================= DRAG ENGINE ================= */
  useEffect(() => {
    const move = (e) => {
      if (!draggingRef.current) return;
      if (!layerRef.current) return;

      const rect = layerRef.current.getBoundingClientRect();

      const x =
        ((e.clientX - rect.left) / rect.width) * 1000 - offsetRef.current.x;
      const y =
        ((e.clientY - rect.top) / rect.height) * 600 - offsetRef.current.y;

      updateUtility?.(draggingRef.current, (u) => ({
        ...u,
        x: Math.max(0, Math.min(1000, x)),
        y: Math.max(0, Math.min(600, y))
      }));
    };

    const stop = () => {
      draggingRef.current = null;
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
  }, [updateUtility]);

  /* ================= RENDER ================= */
  return (
    <div
      ref={layerRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        pointerEvents: "none" // IMPORTANT: do not block drawing tools
      }}
    >
      {/* invisible drag handles */}
      {utilities?.map((u) => {
        if (u.type !== "bolt") return null;

        const left = (u.x / 1000) * containerSize.width;
        const top = (u.y / 600) * containerSize.height;

        return (
          <div
            key={u.id}
            onMouseDown={(e) => {
              const rect = layerRef.current.getBoundingClientRect();

              draggingRef.current = u.id;

              offsetRef.current = {
                x:
                  ((e.clientX - rect.left) / rect.width) * 1000 - u.x,
                y:
                  ((e.clientY - rect.top) / rect.height) * 600 - u.y
              };

              e.stopPropagation();
            }}
            style={{
              position: "absolute",
              left: left - 45,
              top: top - 45,
              width: 90,
              height: 90,
              cursor: "grab",
              pointerEvents: "auto" // only bolt draggable, rest pass-through
            }}
          />
        );
      })}

      {/* drawing layer */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={600}
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

