"use client";
import { useRef, useState, useEffect } from "react";
import PlayerLayer from "./PlayerLayer";
import Toolbar from "./Toolbar";

const deepCopy = (v) => JSON.parse(JSON.stringify(v));
const uid = () => Math.random().toString(36).slice(2);

// --- smoothing helpers ---
const MIN_DIST = 2;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// --- characters (static for C.2) ---
const CHARACTERS = [
  "oscar","tatsuya","xayne","chrono","a124","skyler","homer","nero","ignis",
  "morse","alok","koda","santino","dimitri","kassie","k","clu","steffie",
  "kenta","orion","wukong","ryden","iris"
];

export default function StrategyCanvas() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const activePointerIdRef = useRef(null);
  const lineDraftRef = useRef(null);
  const activeDrawToolRef = useRef(null);

  const [cursorCSS, setCursorCSS] = useState(null);
  const [insideStage, setInsideStage] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 1000, height: 600 });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [tool, setTool] = useState("pen");
  const [penColor, setPenColor] = useState("yellow");
    const [penWidth, setPenWidth] = useState(3);
  const [penOpacity, setPenOpacity] = useState(1);
  const [teamMode, setTeamMode] = useState("ally"); // "ally" | "enemy"

  useEffect(() => {
  const detect = () => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.innerWidth < 900;
    setIsMobile(coarse || small);
  };

  detect();
  window.addEventListener("resize", detect);
  return () => window.removeEventListener("resize", detect);
}, []);

const centerHoverHandlers = {
  onMouseEnter: (e) => {
    e.currentTarget.style.transform = "scale(1.08)";
    e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.45)";
  },
  onMouseLeave: (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "";
  }
};

const centerHoverStyle = {
  transition: "transform 140ms ease, box-shadow 140ms ease"
};


  const makeInitialPhases = () =>
  Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Phase ${i + 1}`,
    map: "/maps/bermuda.jpg",
    players: [],
    strokes: [],
    undoStack: [],
    redoStack: []
  }));

const [phases, setPhases] = useState(makeInitialPhases);

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

        // ---------------- DELETE HELPERS ----------------
  const clearCurrentPhase = () => {
    pushHistory();
    setPhases((prev) => {
      const updated = deepCopy(prev);
      updated[currentPhaseIndex].players = [];
      updated[currentPhaseIndex].strokes = [];
      return updated;
    });
  };

  const clearAllPhases = () => {
    pushHistory();
    setPhases((prev) =>
      prev.map((p) => ({
        ...p,
        players: [],
        strokes: []
      }))
    );
  };

  const clearPlayersInPhase = () => {
    pushHistory();
    setPhases((prev) => {
      const updated = deepCopy(prev);
      updated[currentPhaseIndex].players = [];
      return updated;
    });
  };

  const clearStrokesInPhase = () => {
    pushHistory();
    setPhases((prev) => {
      const updated = deepCopy(prev);
      updated[currentPhaseIndex].strokes = [];
      return updated;
    });
  };

      p.undoStack.push(
        deepCopy({
          map: p.map,
          players: p.players,
          strokes: p.strokes,
        })
      );

      Object.assign(p, p.redoStack.shift());
      return updated;
    });
  };

  // ---------------- PLAYER CLICK ----------------
  const handlePlayerClick = (player) => {
  setSelectedPlayer((p) => (p?.id === player.id ? null : player));
};

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 1000,
      y: ((e.clientY - rect.top) / rect.height) * 600
    };
  };

  const spawnCharacter = (charName) => {
  pushHistory();

  setPhases((prev) => {
    const updated = deepCopy(prev);
    const p = updated[currentPhaseIndex];

    const prefix = teamMode === "ally" ? "P" : "E";
    const used = p.players
      .map((pl) => pl.name)
      .filter((n) => n && n.startsWith(prefix))
      .map((n) => parseInt(n.slice(1), 10))
      .filter((n) => !isNaN(n));

    const nextNum = used.length ? Math.max(...used) + 1 : 1;
    const name = `${prefix}${nextNum}`;

    const baseX = 500;
    const baseY = 300;

    const jitter = () => (Math.random() - 0.5) * 40;

    p.players.push({
      id: uid(),
      name,
      x: baseX + jitter(),
      y: baseY + jitter(),
      color: teamMode === "ally" ? "#3da7ff" : "#ff4d4d",
      locked: false,
      character: charName

    });

    return updated;
  });
};


  // Track cursor at CONTAINER level, but only render tactically inside STAGE
  const updateCursorCSS = (e) => {
    if (!containerRef.current || !canvasRef.current) return;

    const overUIPanel = e.target.closest("[data-ui-panel]");
    if (overUIPanel) {
      setInsideStage(false);
      setCursorCSS(null);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const inside =
      e.clientX >= canvasRect.left &&
      e.clientX <= canvasRect.right &&
      e.clientY >= canvasRect.top &&
      e.clientY <= canvasRect.bottom;

    setInsideStage(inside);

    if (!inside) {
      setCursorCSS(null);
      return;
    }

    setCursorCSS({
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top
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
    isDrawingRef.current = true;
    activePointerIdRef.current = e.pointerId;
    e.preventDefault();
    updateCursorCSS(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = getCanvasPos(e);

      if (tool === "line") {
    pushHistory();
    isDrawingRef.current = true;
    activeDrawToolRef.current = "line";


    const stroke = {
  id: uid(),
  type: "line",
  color: penColor,
  width: 3,
  opacity: penOpacity ?? 1,
width: penWidth ?? 3,
  start: pos,
  end: pos,
  points: [pos, pos]
};


    lineDraftRef.current = stroke;

    setPhases((prev) => {
      const updated = deepCopy(prev);
      updated[currentPhaseIndex].strokes.push(stroke);
      return updated;
    });

    return;
  }


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

    pushHistory();
    isDrawingRef.current = true;

        const normalizeStrokeType = (tool) => {
      switch (tool) {
        case "arrow":
          return "arrow";
           case "path":
          return "path";
          case "rect":
          return "rect";
                  case "line":
          return "line";
                  case "dashed":
          return "dashed";
        case "pen":
        default:
          return "freehand";
      }
    };

           const stroke = {
      id: uid(),
      type: normalizeStrokeType(tool),
      color: penColor,
      width: penWidth,
      opacity: penOpacity,
      points:
        tool === "line" || tool === "rect"
          ? [pos, pos]
          : [pos]
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
    

    const pos = getCanvasPos(e);

      if (activeDrawToolRef.current === "line" && lineDraftRef.current) {
    setPhases((prev) => {
      const updated = deepCopy(prev);
      const strokes = updated[currentPhaseIndex].strokes;
          const draftId = lineDraftRef.current?.id;
    if (!draftId) return updated;

    const s = strokes.find((st) => st.id === draftId);
    if (!s) return updated;

    s.end = pos;
    s.points[1] = pos;

      return updated;
    });
    return;
  }


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
            if (s.type === "rect") {
        s.points[1] = pos;
        return updated;
      }

      if (!s) return updated;

if (s.type === "rect") {
  s.points[1] = pos;
  return updated;
}

if (s.type === "line") {
  s.points[1] = pos;
  return updated;
}


      const last = s.points[s.points.length - 1];
      if (s.type === "path") {
  if (dist(s.points[s.points.length - 1], pos) >= MIN_DIST) {
    s.points.push(pos);
  }
  return updated;
}

      if (dist(last, pos) >= MIN_DIST) {
        s.points.push(pos);
      }
      return updated;
    });
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    activePointerIdRef.current = null;
        try {
    if (activePointerIdRef.current !== null) {
      canvasRef.current?.releasePointerCapture(activePointerIdRef.current);
    }
  } catch {}

  activePointerIdRef.current = null;
  lineDraftRef.current = null;
  activeDrawToolRef.current = null;
};



  // --- END PART 1 ---
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

    const drawTaperedTail = (a, b, color, w) => {
      const steps = 6;
      for (let i = 0; i < steps; i++) {
        const t1 = i / steps;
        const t2 = (i + 1) / steps;
        const x1 = a.x + (b.x - a.x) * t1;
        const y1 = a.y + (b.y - a.y) * t1;
        const x2 = a.x + (b.x - a.x) * t2;
        const y2 = a.y + (b.y - a.y) * t2;

        ctx.strokeStyle = color;
        ctx.lineWidth = w * (1 - t2 * 0.6);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };

    const drawChevronHead = (a, b, color, w, velocity) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const angle = Math.atan2(dy, dx);

      const speedScale = Math.min(2, Math.max(0.7, velocity / 6));
      const len = (12 + w * 1.2) * speedScale;
      const spread = Math.PI / 7;

      const left = {
        x: b.x - len * Math.cos(angle - spread),
        y: b.y - len * Math.sin(angle - spread)
      };

      const right = {
        x: b.x - len * Math.cos(angle + spread),
        y: b.y - len * Math.sin(angle + spread)
      };

      ctx.strokeStyle = color;
      ctx.lineWidth = w * 0.9;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(left.x, left.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(right.x, right.y);
      ctx.stroke();
    };

    currentPhase.strokes.forEach((s) => {
      ctx.globalAlpha = s.opacity ?? 1;
      if (s.type === "rect") {
  if (s.points.length < 2) return;

  const a = s.points[0];
  const b = s.points[1];

  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const w = Math.abs(b.x - a.x);
  const h = Math.abs(b.y - a.y);

  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.width;
  ctx.lineJoin = "round";

  ctx.strokeRect(x, y, w, h);
}

      if (s.type === "freehand") {
        drawSmoothPath(s.points, s.color, s.width);
      }
     if (s.type === "path") {
  if (s.points.length < 2) return;

  const pts = s.points;

  ctx.save();
  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = s.opacity ?? 1;

  // smooth curve
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

  // start dot
  ctx.beginPath();
  const dotSize = Math.max(3, Math.min(8, s.width * 1.2));
ctx.arc(pts[0].x, pts[0].y, dotSize, 0, Math.PI * 2);
  ctx.fillStyle = s.color;
  ctx.fill();

  // end dot
  ctx.beginPath();
  const dotSizeEnd = Math.max(3, Math.min(8, s.width * 1.2));
ctx.arc(last.x, last.y, dotSizeEnd, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

        if (s.type === "line") {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width;
    ctx.lineCap = "round";
    ctx.save();
    ctx.globalAlpha = s.opacity ?? 1;
    ctx.beginPath();
    ctx.moveTo(s.start.x, s.start.y);
    ctx.lineTo(s.end.x, s.end.y);
    ctx.stroke();
  }
            if (s.type === "dashed") {
        if (s.points.length < 2) return;
        if (s.type === "line") {
        if (s.points.length < 2) return;
              if (s.type === "rect") {
        if (s.points.length < 2) return;

        const a = s.points[0];
        const b = s.points[1];

        const x = Math.min(a.x, b.x);
        const y = Math.min(a.y, b.y);
        const w = Math.abs(b.x - a.x);
        const h = Math.abs(b.y - a.y);

        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        ctx.lineJoin = "round";

        ctx.strokeRect(x, y, w, h);
      }


        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);
        ctx.lineTo(s.points[1].x, s.points[1].y);
        ctx.stroke();
      }

        ctx.save();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        ctx.setLineDash([8, 6]);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(s.points[0].x, s.points[0].y);

        for (let i = 1; i < s.points.length; i++) {
          ctx.lineTo(s.points[i].x, s.points[i].y);
        }

        ctx.stroke();
        ctx.restore();
      }

      if (s.type === "arrow") {
        if (s.points.length >= 2) {
           if (s.type === "path") {
        if (s.points.length < 2) return;

        // draw smooth curved path
        ctx.shadowColor = s.color;
ctx.shadowBlur = 8;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;
        drawSmoothPath(s.points, s.color, s.width);
        if (s.type === "path") {
  if (s.points.length < 2) return;

  drawSmoothPath(s.points, s.color, s.width);

  const a = s.points[s.points.length - 2];
  const b = s.points[s.points.length - 1];
  const velocity = dist(a, b);

  drawChevronHead(a, b, s.color, s.width, velocity);
}

        // arrowhead at end
        const a = s.points[s.points.length - 2];
        const b = s.points[s.points.length - 1];
        const velocity = dist(a, b);

        drawChevronHead(a, b, s.color, s.width, velocity);
      }
          const a = s.points[s.points.length - 2];
          const b = s.points[s.points.length - 1];
          const velocity = dist(a, b);

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;

          const speedScale = Math.min(2, Math.max(0.7, velocity / 6));
          const trim = (12 + s.width * 1.2) * speedScale;

          const bx = b.x - (dx / len) * trim;
          const by = b.y - (dy / len) * trim;

          const trimmed = [...s.points.slice(0, -1), { x: bx, y: by }];

          drawSmoothPath(trimmed.slice(0, -1), s.color, s.width);

          if (trimmed.length >= 2) {
            const tA = trimmed[trimmed.length - 2];
            const tB = trimmed[trimmed.length - 1];
            drawTaperedTail(tA, tB, s.color, s.width);
          }

          drawChevronHead(a, b, s.color, s.width, velocity);
        } else {
          drawSmoothPath(s.points, s.color, s.width);
        }
      }
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
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

    // ---------------- DELETE HELPERS ----------------
  const clearCurrentPhase = () => {
    pushHistory();
    setPhases((prev) => {
      const updated = deepCopy(prev);
      updated[currentPhaseIndex].players = [];
      updated[currentPhaseIndex].strokes = [];
      return updated;
    });
  };

  const clearAllPhases = () => {
    pushHistory();
    setPhases((prev) =>
      prev.map((p) => ({
        ...p,
        players: [],
        strokes: []
      }))
    );
  };

  const clearPlayersInPhase = () => {
    pushHistory();
    setPhases((prev) => {
      const updated = deepCopy(prev);
      updated[currentPhaseIndex].players = [];
      return updated;
    });
  };

  const clearStrokesInPhase = () => {
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
        setPhases(data.phases);
        setCurrentPhaseIndex(0);
      }
    };
    reader.readAsText(file);
  };

  // ---------------- RENDER (VALOPLANT FRAME) ----------------
  // ---------------- RENDER (VALOPLANT FRAME) ----------------
return (
  <div
    ref={containerRef}
    onPointerMove={updateCursorCSS}
    style={{
      position: "relative",
      width: "100vw",
      height: "var(--app-height, 100dvh)",
      display: "flex",
      flexDirection: "row",
      background: "#0f1115",
      overflow: "hidden"
    }}
  >
          {/* LEFT PANEL */}
      <div
  data-ui-panel
  style={{
    width: isMobile ? 200 : 330,
    height: "100%",
    background: "rgba(18,18,18,0.95)",
    borderRight: isMobile ? "1px solid #2a2f3a" : "1px solid #1f2430",
boxShadow: isMobile
  ? "2px 0 12px rgba(0,0,0,0.55)"
  : "none",
    display: "flex",
    flexDirection: "column",
    zIndex: 10,
    overflow: "visible"
  }}
>
        <div
  style={{
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    overscrollBehavior: "contain",
    WebkitOverflowScrolling: "touch",
    paddingRight: isMobile ? 10 : 24,
    paddingLeft:0,
    scrollbarWidth: "none",
    msOverflowStyle: "none"
  }}
>
  <style>{`
    [data-ui-panel] > div::-webkit-scrollbar {
      width: 0px;
      height: 0px;
      display: none;
    }
  `}</style>

      <Toolbar
  isMobile={isMobile}
  setTool={setTool}
  clearAllPhases={clearAllPhases}
  clearCurrentPhase={clearCurrentPhase}
  clearPlayersInPhase={clearPlayersInPhase}
  clearStrokesInPhase={clearStrokesInPhase}
  setColor={setPenColor}
  setPenWidth={setPenWidth}
  setPenOpacity={setPenOpacity}
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
  prevPhase={() => setCurrentPhaseIndex((i) => Math.max(0, i - 1))}
  nextPhase={() =>
    setCurrentPhaseIndex((i) =>
      Math.min(phases.length - 1, i + 1)
    )
  }
/>
        </div>
      </div>

    {/* CENTER MAP ZONE */}
<div
  ref={stageRef}
  style={{
  position: "relative",
  flex: 1,
  height: "100%",
  marginLeft: isMobile ? 0 : 10,   // ← the visual gap
  background:
    "radial-gradient(1200px 600px at center, #1a1d24 0%, #0f1115 60%)"
}}
>
  {isMobile && (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: -88,
        width: 88,
        height: "100%",
        background:
          "radial-gradient(1200px 600px at center, #1a1d24 0%, #0f1115 60%)",
        pointerEvents: "none",
        zIndex: -1,
      }}
    />
  )}

        {/* TOP-LEFT UTILITY CLUSTER */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          display: "flex",
          gap: 8,
          zIndex: 20
        }}
      >
        {/* SETTINGS (placeholder) */}
        <div
        {...(!isMobile ? centerHoverHandlers : {})}
          style={{
            width: 40,
            height: 40,
            ...(!isMobile ? centerHoverStyle : {}),
            borderRadius: 10,
            background: "rgba(24,24,28,0.9)",
            border: "1px solid #2a2f3a",
            color: "#cfd6e4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          ⚙️
        </div>

        {/* SAVE */}
        <div
        {...(!isMobile ? centerHoverHandlers : {})}
          onClick={handleSave}
          style={{
            width: 40,
            height: 40,
            ...(!isMobile ? centerHoverStyle : {}),
            borderRadius: 10,
            background: "rgba(24,24,28,0.9)",
            border: "1px solid #2a2f3a",
            color: "#cfd6e4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          💾
        </div>
      </div>

     {/* MAP CONTROL STRIP (VALOPLANT-STYLE) */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "flex",
          gap: 8,
          zIndex: 20
        }}
      >
                {/* UNDO */}
        <div
        {...(!isMobile ? centerHoverHandlers : {})}
          onClick={undo}
          style={{
            width: 40,
            height: 40,
            ...(!isMobile ? centerHoverStyle : {}),
            borderRadius: 10,
            background: "rgba(24,24,28,0.9)",
            border: "1px solid #2a2f3a",
            color: "#cfd6e4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          ↶
        </div>

        {/* REDO */}
        <div
        {...(!isMobile ? centerHoverHandlers : {})}
          onClick={redo}
          style={{
            width: 40,
            height: 40,
            ...(!isMobile ? centerHoverStyle : {}),
            borderRadius: 10,
            background: "rgba(24,24,28,0.9)",
            border: "1px solid #2a2f3a",
            color: "#cfd6e4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          ↷
        </div>

        {/* BIN */}
        <div
        {...(!isMobile ? centerHoverHandlers : {})}
          id="map-bin"
          style={{
            width: 40,
            height: 40,
            ...(!isMobile ? centerHoverStyle : {}),
            borderRadius: 10,
            background: "rgba(24,24,28,0.9)",
            border: "1px solid #2a2f3a",
            color: "#ff6b6b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            userSelect: "none",
            pointerEvents: "none" // becomes active via PlayerLayer logic
          }}
        >
          🗑️
        </div>
      </div>

      {currentPhase.map && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${currentPhase.map}')`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
            pointerEvents: "none"
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
          touchAction: "none",
          cursor:
            !isMobile && (tool === "pen" || tool === "eraser" || tool === "arrow")
              ? "none"
              : "default"
        }}
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
  onDeletePlayer={(id) => {
    pushHistory();
    setPhases((prev) => {
      const updated = deepCopy(prev);
      updated[currentPhaseIndex].players =
        updated[currentPhaseIndex].players.filter((p) => p.id !== id);
      return updated;
    });
  }}
  onPlayerClick={handlePlayerClick}
  selectedPlayer={selectedPlayer}
  containerSize={containerSize}
/>
    </div>

    {/* RIGHT PANEL (CHARACTERS) */}
    <div
      data-ui-panel
      style={{
        width: isMobile ? 80 : 200,
        height: "100%",
        background: "rgba(18,18,18,0.95)",
        borderLeft: "1px solid #1f2430",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        overflowX: "hidden"
      }}
    >
      <style>{`
        .char-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .char-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* TOGGLE */}
      <div
        style={{
          padding: "10px 8px",
          borderBottom: "1px solid #1f2430",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: teamMode === "ally" ? "#4cc9ff" : "#ff6b6b"
          }}
        >
          {teamMode === "ally" ? "Ally" : "Enemy"}
        </div>

        <div
          onClick={() =>
            setTeamMode((m) => (m === "ally" ? "enemy" : "ally"))
          }
          style={{
            width: 56,
            height: 28,
            borderRadius: 20,
            background: teamMode === "ally" ? "#1e90ff" : "#ff4757",
            position: "relative",
            cursor: "pointer",
            transition: "background 180ms ease"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 3,
              left: teamMode === "ally" ? 28 : 3,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: teamMode === "ally" ? "#7dd3ff" : "#ffb3b3",
              transition: "left 180ms ease, background 180ms ease"
            }}
          />
        </div>
      </div>

      <div
  className="char-scroll"
  style={{
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: isMobile ? 8 : 8,
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
    gap: isMobile ? 4 : 8,
    alignContent: "start"
  }}
>
        {CHARACTERS.map((c) => (
  <div
    key={c}
    onClick={() => spawnCharacter(c)}
    style={{
      width: "100%",
      aspectRatio: "1 / 1",
      borderRadius: isMobile ? 6 : 8,
      background: "#1f2430",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      padding: isMobile ? 0 : 0
    }}
  >
    <img
      src={`/characters/${c}.png`}
      alt={c}
      draggable={false}
      style={{
        width: isMobile ? "100%" : "88%",
        height: isMobile ? "100%" : "88%",
        objectFit: "contain",
        pointerEvents: "none"
      }}
    />
  </div>
))}
      </div>
    </div>
  </div>
);
}




































































