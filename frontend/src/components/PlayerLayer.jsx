"use client";
import { useRef, useEffect } from "react";

const SIZE = 36;
const HIT_SIZE = 56;

export default function PlayerLayer({
  players,
  setPlayers,
  selectedPlayer,
  onPlayerClick = () => {},
  containerSize
}) {
  const safePlayers = Array.isArray(players) ? players : [];
  const draggingRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // ---------------- DRAG MOVE (PC + MOBILE) ----------------
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!draggingRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;

      if (clientX == null || clientY == null) return;

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === draggingRef.current) {
            const newX =
              (clientX - rect.left) * (1000 / containerSize.width) -
              offsetRef.current.x;

            const newY =
              (clientY - rect.top) * (600 / containerSize.height) -
              offsetRef.current.y;

            return {
              ...p,
              x: Math.max(0, Math.min(1000 - SIZE, newX)),
              y: Math.max(0, Math.min(600 - SIZE, newY))
            };
          }
          return p;
        })
      );
    };

    const stopDrag = () => {
      draggingRef.current = null;
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchend", stopDrag);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchend", stopDrag);
    };
  }, [setPlayers, containerSize]);

  // ---------------- LOCK (PC ONLY – right click) ----------------
  const toggleLock = (id) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, locked: !p.locked } : p
      )
    );
  };

  // ---------------- DRAG START ----------------
  const startDrag = (e, player) => {
    if (player.locked || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;

    if (clientX == null || clientY == null) return;

    draggingRef.current = player.id;

    offsetRef.current = {
      x:
        (clientX - rect.left) * (1000 / containerSize.width) -
        player.x,
      y:
        (clientY - rect.top) * (600 / containerSize.height) -
        player.y
    };

    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none"
      }}
    >
      {safePlayers.map((p) => {
        const left = (p.x / 1000) * containerSize.width;
        const top = (p.y / 600) * containerSize.height;

        return (
          <div
            key={p.id}
            onMouseDown={(e) => startDrag(e, p)}
            onTouchStart={(e) => startDrag(e, p)}
            onClick={() => onPlayerClick(p)}
            onContextMenu={(e) => {
              e.preventDefault();
              toggleLock(p.id);
            }}
            style={{
              position: "absolute",
              left: left - (HIT_SIZE - SIZE) / 2,
              top: top - (HIT_SIZE - SIZE) / 2,
              width: HIT_SIZE,
              height: HIT_SIZE,
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10
            }}
          >
            <div
              style={{
                position: "relative",
                width: SIZE,
                height: SIZE,
                borderRadius: "50%",
                backgroundColor: p.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: "bold",
                cursor: p.locked ? "not-allowed" : "grab",
                border:
                  selectedPlayer?.id === p.id
                    ? "3px solid yellow"
                    : "2px solid #111",
                userSelect: "none",
                opacity: p.locked ? 0.7 : 1,
                touchAction: "none" // 🚫 disables long-press / zoom interference
              }}
            >
              {p.name}

              {p.locked && (
                <div
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: "#111",
                    borderRadius: "50%",
                    padding: "2px 4px",
                    fontSize: 10,
                    lineHeight: 1
                  }}
                >
                  🔒
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

























