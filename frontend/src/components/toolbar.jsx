"use client";
import { useState } from "react";
import PresentationControls from "./PresentationControls";

const MAPS = [
  {
    name: "Bermuda",
    path: "/maps/bermuda.jpg",
    preview: "/maps/bermuda-preview.webp"
  },
  {
    name: "Purgatory",
    path: "/maps/purgatory.jpg",
    preview: "/maps/purgatory-preview.jpg"
  }
];

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
  const [mapOpen, setMapOpen] = useState(false);

  const currentMap =
    MAPS.find((m) => m.path === currentPhaseMap) || MAPS[0];

  const rowStyle = {
    display: "flex",
    gap: 8
  };

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
    <div
      data-ui-panel
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 12,
        gap: 12,
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#fff"
      }}
    >
      {/* STRATEGY HEADER SHELL */}
      <div
        style={{
          padding: "14px 12px",
          borderRadius: 12,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: 0.3
        }}
      >
        Strategy
      </div>

      {/* PHASE HEADER */}
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
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

      {/* MAP SELECTOR */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          {...pressHandlers}
          onClick={() => setMapOpen((o) => !o)}
          style={{
            position: "relative",
            width: "100%",
            height: 64,
            borderRadius: 12,
            overflow: "hidden",
            cursor: "pointer",
            border: "1px solid #2f3542",
            backgroundImage: `url(${currentMap.preview})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)"
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.55))"
            }}
          />
          <div
  style={{
    position: "absolute",
    bottom: 10,
    left: 12,
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase"
  }}
>
  {currentMap.name}
</div>

        </div>

        {mapOpen && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 8
            }}
          >
            {MAPS.filter((m) => m.path !== currentPhaseMap).map((m) => (
              <div
                key={m.path}
                {...pressHandlers}
                onClick={() => {
                  onMapChange(m.path);
                  setMapOpen(false);
                }}
                style={{
                  position: "relative",
                  width: "100%",
                  height: 56,
                  borderRadius: 10,
                  overflow: "hidden",
                  cursor: "pointer",
                  border:
                    m.path === currentPhaseMap
                      ? "1px solid #4cc9ff"
                      : "1px solid #2f3542",
                  backgroundImage: `url(${m.preview})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.6))"
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 6,
                    left: 8,
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  {m.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* DRAW TOOLS */}
      <div style={rowStyle}>
        <button
          {...pressHandlers}
          style={toolBtn(activeTool === "pen", "#2ed573")}
          onClick={() => {
            setTool("pen");
            setActiveTool("pen");
          }}
        >
          ✏️
        </button>

        <button
          {...pressHandlers}
          style={toolBtn(activeTool === "arrow", "#1e90ff")}
          onClick={() => {
            setTool("arrow");
            setActiveTool("arrow");
          }}
        >
          ➤
        </button>

        <button
          {...pressHandlers}
          style={toolBtn(activeTool === "eraser", "#ff4757")}
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
            height: 32,
            width: 36,
            borderRadius: 8,
            border: "none",
            background: "none"
          }}
        />

        <button {...pressHandlers} style={baseBtn} onClick={clearCanvas}>
          🗑
        </button>
      </div>

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
        <button {...pressHandlers} style={baseBtn} onClick={undo}>
          ↶
        </button>
        <button {...pressHandlers} style={baseBtn} onClick={redo}>
          ↷
        </button>
      </div>

      <Divider />

      {/* SAVE */}
      <div style={rowStyle}>
        <button {...pressHandlers} style={baseBtn} onClick={save}>
          💾 Save
        </button>
      </div>

      <div style={{ height: 6 }} />

      {/* PHASE NAV */}
      <div style={rowStyle}>
        <button {...pressHandlers} style={baseBtn} onClick={prevPhase}>
          ◀
        </button>
        <button {...pressHandlers} style={baseBtn} onClick={addPhase}>
          ＋
        </button>
        <button {...pressHandlers} style={baseBtn} onClick={nextPhase}>
          ▶
        </button>
      </div>

      <Divider />

      <PresentationControls />
    </div>
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
  height: 32,
  borderRadius: 10,
  border: "1px solid #2f3542",
  background: "#2f3542",
  color: "#fff",
  cursor: "pointer",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  transition: "transform 120ms ease, filter 120ms ease, box-shadow 160ms ease"
};

const toolBtn = (active, accent) => ({
  ...baseBtn,
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





































