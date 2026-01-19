"use client";
import { useRef, useEffect, useState } from "react";

const SIZE = 36;
const HIT_SIZE = 56;
const FADE_MS = 160;

export default function PlayerLayer({
  players,
  setPlayers,
  selectedPlayer,
  onPlayerClick = () => {},
  onDeletePlayer = () => {},
  containerSize
}) {
  const safePlayers = Array.isArray(players) ? players : [];
  const draggingRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const [deletingId, setDeletingId] = useState(null);

  // ---------------- DRAG MOVE (PC + MOBILE) ----------------
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!containerRef.current) return;

      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;

      if (clientX == null || clientY == null) return;

      lastPointerRef.current = { x: clientX, y: clientY };

      if (!draggingRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

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
      if (draggingRef.current) {
        const id = draggingRef.current;
        draggingRef.current = null;

        const bin = document.getElementById("map-bin");
        if (bin) {
          const r = bin.getBoundingClientRect();
          const { x, y } = lastPointerRef.current;

          const overBin =
            x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;

          if (overBin) {
            setDeletingId(id);
            setTimeout(() => {
              onDeletePlayer(id);
              setDeletingId(null);
            }, FADE_MS);
          }
        }
      }
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
  }, [setPlayers, containerSize, onDeletePlayer]);

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

        const isEnemy = p.color === "#ff4757";
        const bgColor = isEnemy ? "#ff6b6b" : "#4cc9ff";
        const fading = deletingId === p.id;

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
            {p.character ? (
              <div
                style={{
                  position: "relative",
                  width: SIZE,
                  height: SIZE,
                  borderRadius: 6,
                  background: bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: p.locked ? "not-allowed" : "grab",
                  userSelect: "none",
                  opacity: fading ? 0 : p.locked ? 0.7 : 1,
                  transition: `opacity ${FADE_MS}ms ease`,
                  touchAction: "none",
                  outline:
                    selectedPlayer?.id === p.id
                      ? "2px solid yellow"
                      : "none"
                }}
              >
                <img
                  src={`/characters/${p.character}.png`}
                  alt={p.character}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    pointerEvents: "none"
                  }}
                />

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
            ) : (
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
                  opacity: fading ? 0 : p.locked ? 0.7 : 1,
                  transition: `opacity ${FADE_MS}ms ease`,
                  touchAction: "none"
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
            )}
          </div>
        );
      })}
    </div>
  );
}




























