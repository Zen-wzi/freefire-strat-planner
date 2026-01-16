"use client";
import { useRef, useState, useEffect } from "react";
import PlayerLayer from "./PlayerLayer";
import RotationLayer from "./RotationLayer";
import Toolbar from "./Toolbar";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));
const uid = () => Math.random().toString(36).slice(2);

// --- smoothing helpers ---
const MIN_DIST = 2; // px in canvas-space (1000x600)
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export default function StrategyCanvas() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const activePointerIdRef = useRef(null);

  const [cursorCSS, setCursorCSS] = useState(null);

  const [isMobile, setIsMobile] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 1000, height: 600 });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [tool, setTool] = useState("pen");
  const [penColor, setPenColor] = useState("yellow");

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const [phases, setPhases] = useState([
    {
      id: 1,
      name: "Phase 1 - Drop",
      map: "/maps/bermuda.jpg",
      players: [
        { id: 1, name: "IGL", x: 120, y: 120, color: "#ff4757", locked: false },
        { id: 2, name: "P2", x: 260, y: 140, color: "#1e90ff", locked: false },
        { id: 3, name: "P3", x: 180, y: 260, color: "#2ed573", locked: false },
        { id: 4, name: "P4", x: 320, y: 260, color: "#ffa502", locked: false }
      ],
      strokes: [],
      rotations: [],
      undoStack: [],
      redoStack: []
    }
  ]);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const currentPhase = phases[currentPhaseIndex];

  // ---------------- RESIZE ----------------
  useEffect(() => {
    const updateSize = () => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // ---------------- HISTORY ----------------
  const pushHistory = () => {
    setPhases((prev) => {
      const updated = deepCopy(prev);
      const p = updated[currentPhaseIndex];
      p.undoStack.push(
        deepCopy({
          map: p.map,
          players: p.players,
          strokes: p.strokes,
          rotations: p.rotations
        })
      );
      p.redoStack = [];
      return updated;
    });
  };

  const undo = () => {
    setPhases((prev) => {
      const updated = deepCopy(prev);
      const p = updated[currentPhaseIndex];
      if (!p.undoStack.length) return prev;

      p.redoStack.unshift(
        deepCopy({
          map: p.map,
          players: p.players,
          strokes: p.strokes,
          rotations: p.rotations
        })
      );

      Object.assign(p, p.undoStack.pop());
      return updated;
    });
  };

  const redo = () => {
    setPhases((prev) => {
      const updated = deepCopy(prev);
      const p = updated[currentPhaseIndex];
      if (!p.redoStack.length) return prev;

      p.undoStack.push(
        deepCopy({
          map: p.map,
          players: p.players,
          strokes: p.strokes,
          rotations: p.rotations
        })
      );

      Object.assign(p, p.redoStack.shift());
      return updated;
    });
  };

  // ---------------- PLAYER CLICK ----------------
  const handlePlayerClick = (player) => {
    if (!selectedPlayer) {
      setSelectedPlayer(player);
    } else if (selectedPlayer.id !== player.id) {
      pushHistory();
      setPhases((prev) => {
        const updated = deepCopy(prev);
        updated[currentPhaseIndex].rotations.push({
          fromId: selectedPlayer.id,
          toId: player.id
        });
        return updated;
      });
      setSelectedPlayer(null);
    }
  };

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 1000,
      y: ((e.clientY - rect.top) / rect.height) * 600
    };
  };

  const updateCursorCSS = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    setCursorCSS({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // --------- VECTOR ERASER HELPERS ---------
  const distToSegment = (p, a, b) => {
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const wx = p.x - a.x;
    const wy = p.y - a.y;

    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return Math.hypot(p.x - a.x, p.y - a.y);

    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return Math.hypot(p.x - b.x, p.y - b.y);

    const t = c1 / c2;
    const px = a.x + t * vx;
    const py = a.y + t * vy;
    return Math.hypot(p.x - px, p.y - py);
  };

  const strokeIntersects = (stroke, p, r) => {
    const pts = stroke.points;
    for (let i = 1; i < pts.length; i++) {
      if (distToSegment(p, pts[i - 1], pts[i]) <= r) return true;
    }
    return false;
  };

  const ERASE_RADIUS = 10;

  // ---------------- POINTER ----------------
  const handlePointerDown = (e) => {
    if (activePointerIdRef.current !== null) return;
    activePointerIdRef.current = e.pointerId;
    e.preventDefault();
    updateCursorCSS(e);

    const pos = getCanvasPos(e);

    if (tool === "eraser") {
      pushHistory();
      setPhases((prev) => {
        const updated = deepCopy(prev);
        updated[currentPhaseIndex].strokes =
          updated[currentPhaseIndex].strokes.filter(
            (s) => !strokeIntersects(s, pos, ERASE_RADIUS)
          );
        return updated;
      });
      isDrawingRef.current = true;
      return;
    }

    // Pen & Arrow both start a freehand path
    pushHistory();
    isDrawingRef.current = true;

    const stroke = {
      id: uid(),
      type: tool === "arrow" ? "arrow" : "freehand",
      color: penColor,
      width: 3,
      points: [pos]
    };

    setPhases((prev) => {
      const updated = deepCopy(prev);
      updated[currentPhaseIndex].strokes.push(stroke);
      return updated;
    });
  };

  const handlePointerMove = (e) => {
    updateCursorCSS(e);
    if (!isDrawingRef.current) return;
    if (e.pointerId !== activePointerIdRef.current) return;

    const pos = getCanvasPos(e);

    if (tool === "eraser") {
      setPhases((prev) => {
        const updated = deepCopy(prev);
        updated[currentPhaseIndex].strokes =
          updated[currentPhaseIndex].strokes.filter(
            (s) => !strokeIntersects(s, pos, ERASE_RADIUS)
          );
        return updated;
      });
      return;
    }

    setPhases((prev) => {
      const updated = deepCopy(prev);
      const strokes = updated[currentPhaseIndex].strokes;
      const s = strokes[strokes.length - 1];
      if (!s) return updated;

      const last = s.points[s.points.length - 1];
      if (dist(last, pos) >= MIN_DIST) {
        s.points.push(pos);
      }
      return updated;
    });
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    activePointerIdRef.current = null;
  };

  // ---------------- REDRAW ----------------
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const drawSmoothPath = (pts, color, w) => {
      if (pts.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);

      for (let i = 1; i < pts.length - 1; i++) {
        const midX = (pts[i].x + pts[i + 1].x) / 2;
        const midY = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
      }

      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    };

    const drawArrowHead = (a, b, color, w) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const angle = Math.atan2(dy, dx);
      const headLen = 10 + w;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(
        b.x - headLen * Math.cos(angle - Math.PI / 6),
        b.y - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        b.x - headLen * Math.cos(angle + Math.PI / 6),
        b.y - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    };

    currentPhase.strokes.forEach((s) => {
      if (s.type === "freehand") {
        drawSmoothPath(s.points, s.color, s.width);
      }

      if (s.type === "arrow") {
  if (s.points.length >= 2) {
    const a = s.points[s.points.length - 2];
    const b = s.points[s.points.length - 1];

    // Shorten the path slightly so it doesn't run through the arrowhead
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const trim = 10 + s.width; // match head length
    const bx = b.x - (dx / len) * trim;
    const by = b.y - (dy / len) * trim;

    const trimmed = [...s.points.slice(0, -1), { x: bx, y: by }];

    drawSmoothPath(trimmed, s.color, s.width);
    drawArrowHead(a, b, s.color, s.width);
  } else {
    drawSmoothPath(s.points, s.color, s.width);
  }
}

    });
  }, [currentPhase]);
  // ---------------- CLEAR ----------------
  const clearCanvas = () => {
    pushHistory();
    setPhases((prev) => {
      const updated = deepCopy(prev);
      updated[currentPhaseIndex].strokes = [];
      return updated;
    });
  };

  // ---------------- SAVE / LOAD ----------------
  const handleSave = () => {
    const blob = new Blob([JSON.stringify({ phases }, null, 2)], {
      type: "application/json"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "strategy.json";
    a.click();
  };

  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = JSON.parse(ev.target.result);
      if (Array.isArray(data.phases)) {
        const migrated = data.phases.map((p) => {
          if (!p.strokes && Array.isArray(p.lines)) {
            return {
              ...p,
              strokes: p.lines.map((l) => ({
                id: uid(),
                type: "freehand",
                color: l.color,
                width: 3,
                points: [
                  { x: l.x1, y: l.y1 },
                  { x: l.x2, y: l.y2 }
                ]
              })),
              lines: []
            };
          }
          return p;
        });

        setPhases(migrated);
        setCurrentPhaseIndex(0);
      }
    };
    reader.readAsText(file);
  };

  // ---------------- RENDER ----------------
  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{
        position: "relative",
        width: "100vw",
        height: "100dvh",
        background:
          "radial-gradient(1200px 600px at center, #1a1d24 0%, #0f1115 60%)",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        overflow: "hidden",
        touchAction: "none",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.6)",
        borderRadius: 12,
        ...(isMobile ? { paddingBottom: 96 } : {}),
        ...(isMobile
          ? {
              WebkitTapHighlightColor: "transparent"
            }
          : {})
      }}
    >
      <Toolbar
        setTool={setTool}
        setColor={setPenColor}
        clearCanvas={clearCanvas}
        save={handleSave}
        load={handleLoad}
        undo={undo}
        redo={redo}
        currentPhaseMap={currentPhase.map}
        phaseIndex={currentPhaseIndex}
        totalPhases={phases.length}
        phaseName={currentPhase.name}
        renamePhase={(name) => {
          setPhases((prev) => {
            const updated = deepCopy(prev);
            updated[currentPhaseIndex].name = name;
            return updated;
          });
        }}
        onMapChange={(map) => {
          pushHistory();
          setPhases((prev) => {
            const updated = deepCopy(prev);
            updated[currentPhaseIndex].map = map;
            return updated;
          });
        }}
        addPhase={() => {
          setPhases((p) => [
            ...p,
            {
              id: p.length + 1,
              name: `Phase ${p.length + 1}`,
              map: currentPhase.map,
              players: deepCopy(currentPhase.players),
              strokes: [],
              rotations: [],
              undoStack: [],
              redoStack: []
            }
          ]);
          setCurrentPhaseIndex(phases.length);
        }}
        prevPhase={() => setCurrentPhaseIndex((i) => Math.max(0, i - 1))}
        nextPhase={() =>
          setCurrentPhaseIndex((i) =>
            Math.min(phases.length - 1, i + 1)
          )
        }
      />

      {/* 🎯 STAGE (locked playable area) */}
      <div
        ref={stageRef}
        style={{
          position: "absolute",
          inset: 0,
          ...(isMobile ? { bottom: 96 } : {})
        }}
      >
        {currentPhase.map && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${currentPhase.map}')`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "contain",
              pointerEvents: "none",
              zIndex: 0
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            background: `
              radial-gradient(
                1200px 600px at center,
                rgba(0,0,0,0) 0%,
                rgba(0,0,0,0.15) 60%,
                rgba(0,0,0,0.35) 100%
              )
            `
          }}
        />

        {/* VALOPLANT-STYLE DOM CURSORS (DESKTOP ONLY) */}
        {!isMobile && cursorCSS && (tool === "pen" || tool === "arrow") && (
          <div
            style={{
              position: "absolute",
              left: cursorCSS.x,
              top: cursorCSS.y,
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.95)",
              boxShadow: "0 0 6px rgba(255,255,255,0.35)",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 5
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: penColor,
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 4px rgba(0,0,0,0.6)"
              }}
            />
          </div>
        )}

        {!isMobile && cursorCSS && tool === "eraser" && (
          <div
            style={{
              position: "absolute",
              left: cursorCSS.x,
              top: cursorCSS.y,
              width: 16,
              height: 16,
              background: penColor,
              border: "2px solid rgba(0,0,0,0.65)",
              boxShadow: `0 0 6px ${penColor}88`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 5
            }}
          />
        )}

        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            touchAction: "none",
            cursor:
              !isMobile && (tool === "pen" || tool === "eraser" || tool === "arrow")
                ? "none"
                : "default"
          }}
        />

        <RotationLayer
          rotations={currentPhase.rotations}
          players={currentPhase.players}
          containerSize={containerSize}
        />

        <PlayerLayer
          players={currentPhase.players}
          setPlayers={(updater) => {
            pushHistory();
            setPhases((prev) => {
              const updated = deepCopy(prev);
              updated[currentPhaseIndex].players =
                typeof updater === "function"
                  ? updater(updated[currentPhaseIndex].players)
                  : updater;
              return updated;
            });
          }}
          onPlayerClick={handlePlayerClick}
          selectedPlayer={selectedPlayer}
          containerSize={containerSize}
        />
      </div>
    </div>
  );
}





























































