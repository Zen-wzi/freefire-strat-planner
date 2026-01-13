"use client";
import { useRef, useState, useEffect } from "react";
import PlayerLayer from "./PlayerLayer";
import RotationLayer from "./RotationLayer";
import Toolbar from "./Toolbar";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));

export default function StrategyCanvas() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const isPathActiveRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const dprRef = useRef(1);
  const activePointerIdRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // ---------------- STATE ----------------
  const [containerSize, setContainerSize] = useState({ width: 1000, height: 600 });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [tool, setTool] = useState("pen");
  const [penColor, setPenColor] = useState("yellow");

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
      lines: [],
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

  // ---------------- DPI FIX ----------------
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;

    canvas.width = 1000 * dpr;
    canvas.height = 600 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [containerSize]);

  // ---------------- HARD STOP DRAWING (FIX) ----------------
  useEffect(() => {
    const stopDrawing = () => {
      isDrawingRef.current = false;
      isPathActiveRef.current = false;
    };

    window.addEventListener("mouseup", stopDrawing);
    return () => window.removeEventListener("mouseup", stopDrawing);
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
          lines: p.lines,
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
          lines: p.lines,
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
          lines: p.lines,
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

  // ---------------- DRAWING ----------------
  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse") return;
    if (activePointerIdRef.current !== null) return;

    activePointerIdRef.current = e.pointerId;
    e.preventDefault();
    handleMouseDown(e);
  };

  const handlePointerMove = (e) => {
    if (e.pointerType === "mouse") return;
    if (e.pointerId !== activePointerIdRef.current) return;

    e.preventDefault();
    handleMouseMove(e);
  };

  const handlePointerUp = (e) => {
    if (e.pointerType === "mouse") return;
    if (e.pointerId !== activePointerIdRef.current) return;

    activePointerIdRef.current = null;
    e.preventDefault();
    handleMouseUp();
  };

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 1000,
      y: ((e.clientY - rect.top) / rect.height) * 600
    };
  };

  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    pushHistory();

    isDrawingRef.current = true;
    isPathActiveRef.current = true;

    const pos = getMousePos(e);
    lastPosRef.current = pos;

    const ctx = canvasRef.current.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.setLineDash([]);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    if (e.buttons !== 1) return;

    const pos = getMousePos(e);
    const ctx = canvasRef.current.getContext("2d");

    if (tool === "pen" && isPathActiveRef.current && isDrawingRef.current) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      const prev = lastPosRef.current;
      lastPosRef.current = pos;

      setPhases((prevState) => {
        const updated = deepCopy(prevState);
        updated[currentPhaseIndex].lines.push({
          x1: prev.x,
          y1: prev.y,
          x2: pos.x,
          y2: pos.y,
          color: penColor
        });
        return updated;
      });
    }

    if (tool === "eraser" && isDrawingRef.current) {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    isPathActiveRef.current = false;
  };

  // ---------------- REDRAW FROM STATE ----------------
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.setLineDash([]);

    currentPhase.lines.forEach((l) => {
      ctx.strokeStyle = l.color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
    });
  }, [currentPhase]);

  // ---------------- CLEAR ----------------
  const clearCanvas = () => {
    pushHistory();
    setPhases((prev) => {
      const updated = deepCopy(prev);
      updated[currentPhaseIndex].lines = [];
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
        setPhases(data.phases);
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
        background: "radial-gradient(1200px 600px at center, #1a1d24 0%, #0f1115 60%)",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        overflow: "hidden",
        touchAction: "none",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.6)",
        borderRadius: 12,
        /* 📱 Reserve space for mobile dock */
...(isMobile ? { paddingBottom: 96 } : {}),

/* 🛡 Mobile interaction shield zone */
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
              lines: [],
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

        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
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
            touchAction: "none"
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
























































