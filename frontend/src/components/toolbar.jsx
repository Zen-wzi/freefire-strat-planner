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

  // ✅ SAFE mobile detection (AFTER mount)
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setExpanded(!mobile); // collapsed by default on mobile
  }, []);

  return (
    <>
      {/* 📱 MOBILE EXPAND BUTTON (ALWAYS VISIBLE) */}
      {isMobile && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "auto",
            zIndex: 30,
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "#1f222a",
            color: "#fff",
            fontSize: 22,
            border: "1px solid #2f3542",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            cursor: "pointer"
          }}
        >
          ⬆️
        </button>
      )}

      {/* 🧰 TOOLBAR */}
      {(!isMobile || expanded) && (
        <div
          style={{
            position: "absolute",
            zIndex: 20,

            // Desktop vs mobile placement
            top: isMobile ? "auto" : 16,
            bottom: isMobile ? 16 : "auto",
            left: isMobile ? "50%" : 16,
            transform: isMobile ? "translateX(-50%)" : "none",

            width: isMobile ? "92vw" : 260,
            maxWidth: 360,
            padding: 12,

            background: "rgba(18,18,18,0.95)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,

            boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
            fontFamily: "Inter, system-ui, sans-serif"
          }}
        >
          {/* PHASE HEADER */}
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
            Phase {phaseIndex + 1} / {totalPhases}
            <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
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
                    padding: "4px 6px"
                  }}
                />
              ) : (
                <>
                  <span style={{ flex: 1 }}>{phaseName}</span>
                  <button
                    onClick={() => {
                      setName(phaseName);
                      setEditing(true);
                    }}
                    style={iconBtn}
                  >
                    ✏️
                  </button>
                </>
              )}
            </div>
          </div>

          <Divider />

          {/* TOOLS */}
          <ToolRow>
            <button
              style={toolBtn(activeTool === "pen", "#2ed573")}
              onClick={() => {
                setTool("pen");
                setActiveTool("pen");
              }}
            >
              ✏️
            </button>
            <button
              style={toolBtn(activeTool === "eraser", "#ff4757")}
              onClick={() => {
                setTool("eraser");
                setActiveTool("eraser");
              }}
            >
              ⛔
            </button>
            <input type="color" onChange={(e) => setColor(e.target.value)} />
            <button style={baseBtn} onClick={clearCanvas}>🗑</button>
          </ToolRow>

          <ToolRow>
            <button style={baseBtn} onClick={undo}>↶</button>
            <button style={baseBtn} onClick={redo}>↷</button>
          </ToolRow>

          <Divider />

          <ToolRow>
            <select value={currentPhaseMap} onChange={(e) => onMapChange(e.target.value)} style={selectStyle}>
              <option value="/maps/bermuda.jpg">Bermuda</option>
              <option value="/maps/purgatory.jpg">Purgatory</option>
            </select>
            <button style={baseBtn} onClick={save}>💾</button>
          </ToolRow>

          <ToolRow>
            <button style={baseBtn} onClick={prevPhase}>◀</button>
            <button style={baseBtn} onClick={addPhase}>＋</button>
            <button style={baseBtn} onClick={nextPhase}>▶</button>
          </ToolRow>

          <Divider />

          <PresentationControls />

          {/* 📱 CLOSE */}
          {isMobile && (
            <button
              onClick={() => setExpanded(false)}
              style={{
                marginTop: 6,
                height: 32,
                borderRadius: 8,
                background: "#2f3542",
                color: "#fff",
                border: "none"
              }}
            >
              Close
            </button>
          )}
        </div>
      )}
    </>
  );
}

/* ---------- styles ---------- */

const ToolRow = ({ children }) => (
  <div style={{ display: "flex", gap: 6 }}>{children}</div>
);

const Divider = () => (
  <div style={{ height: 1, background: "#2f3542", opacity: 0.6 }} />
);

const baseBtn = {
  flex: 1,
  height: 32,
  borderRadius: 8,
  border: "1px solid #2f3542",
  background: "#2f3542",
  color: "#fff",
  cursor: "pointer"
};

const toolBtn = (active, accent) => ({
  ...baseBtn,
  background: active ? `${accent}22` : "#2f3542",
  border: active ? `1px solid ${accent}` : "1px solid #2f3542"
});

const iconBtn = {
  border: "none",
  background: "none",
  color: "#fff",
  cursor: "pointer"
};

const selectStyle = {
  flex: 1,
  height: 32,
  background: "#2f3542",
  color: "#fff",
  border: "1px solid #2f3542",
  borderRadius: 8
};
























