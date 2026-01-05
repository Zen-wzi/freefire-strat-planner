"use client";
import { useRef, useEffect } from "react";

const SIZE = 36;
const HIT_SIZE = 56;
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 600;

export default function PlayerLayer({
  players,
  setPlayers,
  selectedPlayer,
  onPlayerClick = () => {},
  containerSize
}) {
  const safePlayers = Array.isArray(players) ? players : [];
  const containerRef = useRef(null);

  const draggingIdRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const activePointerIdRef = useRef(null);

  // ---------- mapRect (matches background-size: contain) ----------
  const getMapRect = () => {
    const { width, height } = containerSize;
    const mapAspect = MAP_WIDTH / MAP_HEIGHT;
    const containerAspect = width / height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (containerAspect > mapAspect) {
      drawHeight = height;
      drawWidth = height * mapAspect;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = width;
      drawHeight = width / mapAspect;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    }

    return { drawWidth, drawHeight, offsetX, offsetY };
  };

  // ---------- unified move (mouse + pointer) ----------
  useEffect(() => {
    const handleMove = (clientX, clientY) => {
      if (!draggingIdRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const { drawWidth, drawHeight, offsetX, offsetY } = getMapRect();

      const mouseX = clientX - rect.left - offsetX;
      const mouseY = clientY - rect.top - offsetY;

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id !== draggingIdRef.current) return p;

          const newX =
            (mouseX / drawWidth) * MAP_WIDTH - offsetRef.current.x;
          const newY =
            (mouseY / drawHeight) * MAP_HEIGHT - offsetRef.current.y;

          return {
            ...p,
            x: Math.max(0, Math.min(MAP_WIDTH - SIZE, newX)),
            y: Math.max(0, Math.min(MAP_HEIGHT - SIZE, newY))
          };
        })
      );
    };

    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => {
      draggingIdRef.current = null;
    };

    const onPointerMove = (e) => {
      if (e.pointerId !== activePointerIdRef.current) return;
      handleMove(e.clientX, e.clientY);
    };

    const onPointerUp = (e) => {
      if (e.pointerId !== activePointerIdRef.current) return;
      activePointerIdRef.current = null;
      draggingIdRef.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [containerSize, setPlayers]);

  const startDrag = (clientX, clientY, player) => {
    if (player.locked || !containerRef.current) return;

    draggingIdRef.current = player.id;

    const rect = containerRef.current.getBoundingClientRect();
    const { drawWidth, drawHeight, offsetX, offsetY } = getMapRect();

    const mouseX = clientX - rect.left - offsetX;
    const mouseY = clientY - rect.top - offsetY;

    offsetRef.current = {
      x: (mouseX / drawWidth) * MAP_WIDTH - player.x,
      y: (mouseY / drawHeight) * MAP_HEIGHT - player.y
    };
  };

  const handleMouseDown = (e, player) => {
    startDrag(e.clientX, e.clientY, player);
    e.stopPropagation();
  };

  const handlePointerDown = (e, player) => {
    if (e.pointerType === "mouse") return;
    if (activePointerIdRef.current !== null) return;

    activePointerIdRef.current = e.pointerId;
    startDrag(e.clientX, e.clientY, player);
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {safePlayers.map((p) => {
        const { drawWidth, drawHeight, offsetX, offsetY } = getMapRect();

        const left = offsetX + (p.x / MAP_WIDTH) * drawWidth;
        const top = offsetY + (p.y / MAP_HEIGHT) * drawHeight;

        return (
          <div
            key={p.id}
            onMouseDown={(e) => handleMouseDown(e, p)}
            onPointerDown={(e) => handlePointerDown(e, p)}
            onClick={() => onPlayerClick(p)}
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
              zIndex: 10,
              touchAction: "none" // 🔥 critical for mobile drag
            }}
          >
            <div
              style={{
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
                userSelect: "none"
              }}
            >
              {p.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}






















