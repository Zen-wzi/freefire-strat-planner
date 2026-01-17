"use client";
import { useState, useEffect } from "react";
import PresentationControls from "./PresentationControls";

export default function Toolbar({
  setTool,
  setColor,
  clearCanvas,
  save,
  load,
  onMapChange,
  addPhase,
  prevPhase,
  nextPhase,
  undo,
  redo,
  currentPhaseMap,
  phaseIndex,
  totalPhases,
  phaseName,
  renamePhase
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(phaseName);
  const [activeTool, setActiveTool] = useState("pen");

  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setExpanded(!mobile);

    const handleResize = () => {
      const nowMobile = window.innerWidth < 768;
      setIsMobile(nowMobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rowStyle = {
    display: "flex",
    gap: isMobile ? 10 : 6
  };

  const btn = (style) => ({
    ...style,
    height: isMobile ? 40 : 32
  });

  const pressHandlers = {
    onPointerDown: (e) => {
      e.currentTarget.style.transform = "scale(0.96)";
      e.currentTarget.style.filter = "brightness(0.9)";
    },
    onPointerUp: (e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.filter = "brightness(1)";
    },
    onPointerLeave: (e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.filter = "brightness(1)";
    }
  };

  return (
    <>
      {isMobile && !expanded && (
        <button
          {...pressHandlers}
          onClick={() => setExpanded(true)}
          style={{
            position: "fixed",
            bottom: "calc(16px + env(safe-area-inset-bottom))",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "#1f222a",
            color: "#fff",
            fontSize: 22,
            border: "1px solid #2f3542",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            transition: "transform 120ms ease, filter 120ms ease"
          }}
        >
          ⬆️
        </button>
      )}

      {(!isMobile || expanded) && (
        <div data-ui-panel
          style={{
            position: isMobile ? "fixed" : "absolute",
            zIndex: 20,
            top: isMobile ? "auto" : 16,
            bottom: isMobile ? 0 : "auto",
            left: isMobile ? "50%" : 16,
            transform: isMobile
              ? `translateX(-50%) translateY(${expanded ? "0%" : "100%"})`
              : "none",
            opacity: isMobile ? (expanded ? 1 : 0) : 1,
            width: isMobile ? "100vw" : 260,
            maxWidth: isMobile ? "100vw" : 360,
            padding: isMobile ? 16 : 12,
            background: "rgba(18,18,18,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: isMobile ? "20px 20px 0 0" : 16,
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 16 : 12,
            boxShadow: isMobile
              ? "0 -12px 30px rgba(0,0,0,0.6)"
              : "0 12px 30px rgba(0,0,0,0.5)",
            fontFamily: "Inter, system-ui, sans-serif",
            transition:
              "transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 180ms ease"
          }}
        >
          {isMobile && (
            <div
              onClick={() => setExpanded(false)}
              style={{
                alignSelf: "center",
                width: 48,
                height: 5,
                borderRadius: 3,
                background: "#3a3f4a",
                marginBottom: 10,
                cursor: "pointer"
              }}
            />
          )}

          {/* PHASE HEADER */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13
            }}
          >
            <div style={{ opacity: 0.75, fontSize: 12 }}>
              Phase {phaseIndex + 1} / {totalPhases}
            </div>

            <div style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
              {editing ? (
                <input
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => {
                    renamePhase(name);
                    setEditing(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      renamePhase(name);
                      setEditing(false);
                    }
                  }}
                  style={{
                    flex: 1,
                    background: "#2f3542",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 10px",
                    fontSize: 16,
                    WebkitTextSizeAdjust: "100%"
                  }}
                />
              ) : (
                <>
                  <span style={{ flex: 1 }}>{phaseName}</span>
                  <button
                    {...pressHandlers}
                    onClick={() => {
                      setName(phaseName);
                      setEditing(true);
                    }}
                    style={{
                      ...iconBtn,
                      transition: "transform 120ms ease, filter 120ms ease"
                    }}
                  >
                    ✏️
                  </button>
                </>
              )}
            </div>
          </div>

          <Divider />

          {/* DRAW TOOLS */}
          <div style={rowStyle}>
            <button
              {...pressHandlers}
              style={toolBtn(activeTool === "pen", "#2ed573", isMobile)}
              onClick={() => {
                setTool("pen");
                setActiveTool("pen");
              }}
            >
              ✏️
            </button>

            {/* NEW: ARROW TOOL */}
            <button
              {...pressHandlers}
              style={toolBtn(activeTool === "arrow", "#1e90ff", isMobile)}
              onClick={() => {
                setTool("arrow");
                setActiveTool("arrow");
              }}
            >
              ➤
            </button>

            <button
              {...pressHandlers}
              style={toolBtn(activeTool === "eraser", "#ff4757", isMobile)}
              onClick={() => {
                setTool("eraser");
                setActiveTool("eraser");
              }}
            >
              ⛔
            </button>

            <input
              type="color"
              onChange={(e) => setColor(e.target.value)}
              style={{
                height: isMobile ? 40 : 32,
                width: isMobile ? 48 : 36,
                borderRadius: 8,
                border: "none",
                background: "none"
              }}
            />

            <button {...pressHandlers} style={btn(baseBtn)} onClick={clearCanvas}>
              🗑
            </button>
          </div>

          {/* MODE HINT */}
          <div
            style={{
              fontSize: 11,
              color: "#9aa0aa",
              textAlign: "center",
              marginTop: -2
            }}
          >
            {activeTool === "pen" && "Drawing mode"}
            {activeTool === "arrow" && "Arrow mode"}
            {activeTool === "eraser" && "Erase mode"}
          </div>

          <div style={{ height: 6 }} />
            
                    {/* HISTORY */}
          <div style={rowStyle}>
            <button {...pressHandlers} style={btn(baseBtn)} onClick={undo}>
              ↶
            </button>
            <button {...pressHandlers} style={btn(baseBtn)} onClick={redo}>
              ↷
            </button>
          </div>

          <Divider />

          {/* MAP + SAVE */}
          <div style={rowStyle}>
            <select
              value={currentPhaseMap}
              onChange={(e) => onMapChange(e.target.value)}
              style={{
                ...selectStyle,
                height: isMobile ? 40 : 32
              }}
            >
              <option value="/maps/bermuda.jpg">Bermuda</option>
              <option value="/maps/purgatory.jpg">Purgatory</option>
            </select>
            <button {...pressHandlers} style={btn(baseBtn)} onClick={save}>
              💾
            </button>
          </div>

          <div style={{ height: 6 }} />

          {/* PHASE NAV */}
          <div style={rowStyle}>
            <button {...pressHandlers} style={btn(baseBtn)} onClick={prevPhase}>
              ◀
            </button>
            <button {...pressHandlers} style={btn(baseBtn)} onClick={addPhase}>
              ＋
            </button>
            <button {...pressHandlers} style={btn(baseBtn)} onClick={nextPhase}>
              ▶
            </button>
          </div>

          <Divider />

          <PresentationControls />
        </div>
      )}
    </>
  );
}

/* ---------- styles ---------- */

const Divider = () => (
  <div
    style={{
      height: 1,
      background: "linear-gradient(to right, transparent, #2f3542, transparent)",
      opacity: 0.7
    }}
  />
);

const baseBtn = {
  flex: 1,
  borderRadius: 10,
  border: "1px solid #2f3542",
  background: "#2f3542",
  color: "#fff",
  cursor: "pointer",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  transition: "transform 120ms ease, filter 120ms ease, box-shadow 160ms ease"
};

const toolBtn = (active, accent, isMobile) => ({
  ...baseBtn,
  height: isMobile ? 40 : 32,
  background: active ? `${accent}22` : "#2f3542",
  border: active ? `1px solid ${accent}` : "1px solid #2f3542",
  boxShadow: active
    ? `0 0 0 1px ${accent}66, 0 0 12px ${accent}55`
    : baseBtn.boxShadow,
  color: active ? accent : "#fff"
});

const iconBtn = {
  border: "none",
  background: "none",
  color: "#fff",
  cursor: "pointer"
};

const selectStyle = {
  flex: 1,
  background: "#2f3542",
  color: "#fff",
  border: "1px solid #2f3542",
  borderRadius: 10,
  padding: "0 8px"
};




































