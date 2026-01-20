"use client";
import { useState, useEffect } from "react";
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
  isMobile,
  setTool,
  setColor,
  clearCanvas,
  save,
  load,
  onMapChange,
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

  const panelPadding = isMobile ? 6 : 12;
  const panelGap = isMobile ? 6 : 12;
  const rowGap = isMobile ? 6 : 8;
  const mapHeight = isMobile ? 48 : 64;
  const mapItemHeight = isMobile ? 40 : 56;
  const headerPadding = isMobile ? "8px 8px" : "14px 12px";
  const headerRadius = isMobile ? 9 : 12;
  const headerFont = isMobile ? 13 : 16;

  const currentMap =
    MAPS.find((m) => m.path === currentPhaseMap) || MAPS[0];

  const rowStyle = {
    display: "flex",
    gap: rowGap
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
        padding: panelPadding,
        gap: panelGap,
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#fff"
      }}
    >
      {/* STRATEGY HEADER SHELL */}
      <div
        style={{
          padding: headerPadding,
          borderRadius: headerRadius,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          fontWeight: 700,
          fontSize: headerFont,
          letterSpacing: 0.3
        }}
      >
        Strategy
      </div>

      {/* MAP SELECTOR */}
      <div style={{ display: "flex", flexDirection: "column", gap: rowGap }}>
        <div
          {...pressHandlers}
          onClick={() => setMapOpen((o) => !o)}
          style={{
            position: "relative",
            width: "100%",
            height: mapHeight,
            borderRadius: headerRadius,
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
              bottom: isMobile ? 8 : 10,
              left: isMobile ? 10 : 12,
              fontSize: isMobile ? 12 : 15,
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
              gap: rowGap
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
                  height: mapItemHeight,
                  borderRadius: 9,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "1px solid #2f3542",
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
                    bottom: isMobile ? 6 : 8,
                    left: isMobile ? 8 : 10,
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 600,
                    letterSpacing: 0.4,
                    textTransform: "uppercase"
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

      <Divider />

      {/* PHASE NAV (VALOPLANT STYLE) */}
      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 5 : 8 }}>
        <div
          style={{
            fontSize: isMobile ? 11 : 12,
            opacity: 0.7,
            textAlign: "left",
            paddingLeft: 4
          }}
        >
          Phase
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "4px 2px" : "6px 4px"
          }}
        >
          <button
            {...pressHandlers}
            onClick={prevPhase}
            style={baseBtnSmall}
          >
            ◀
          </button>

          <div
            style={{
              fontSize: isMobile ? 14 : 16,
              fontWeight: 700,
              letterSpacing: 1
            }}
          >
            {phaseIndex + 1}
          </div>

          <button
            {...pressHandlers}
            onClick={nextPhase}
            style={baseBtnSmall}
          >
            ▶
          </button>
        </div>

        <div
          style={{
            padding: isMobile ? "8px 8px" : "10px 12px",
            borderRadius: 10,
            background: "#2a2f3a",
            border: "1px solid #2f3542",
            fontSize: isMobile ? 12 : 13,
            fontWeight: 600,
            textAlign: "center"
          }}
        >
        </div>
      </div>

      <Divider />

      {/* DELETE */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? 6 : 10
        }}
      >
        <div
          style={{
            fontSize: isMobile ? 11 : 12,
            color: "#9aa0aa",
            fontWeight: 600,
            letterSpacing: 0.3
          }}
        >
          Delete
        </div>

        <button
          {...pressHandlers}
          style={{
            ...baseBtn,
            height: isMobile ? 28 : 36,
            background: "#1f6f8b",
            border: "1px solid #2a8fb0",
            color: "#fff",
            fontWeight: 600
          }}
        >
          Everything
        </button>

        <button
          {...pressHandlers}
          style={{
            ...baseBtn,
            height: isMobile ? 26 : 32,
            background: "#232833",
            color: "#cfd6e4"
          }}
        >
          Phase Step {phaseIndex + 1}
        </button>

        <div
          style={{
            display: "flex",
            gap: 5,
            marginTop: 2
          }}
        >
          <button {...pressHandlers} style={{ ...baseBtn, flex: 1 }}>👤</button>
          <button {...pressHandlers} style={{ ...baseBtn, flex: 1 }}>💥</button>
          <button {...pressHandlers} style={{ ...baseBtn, flex: 1 }}>✏️</button>
          <button {...pressHandlers} style={{ ...baseBtn, flex: 1 }}>📝</button>
          <button {...pressHandlers} style={{ ...baseBtn, flex: 1 }}>🖼</button>
        </div>
      </div>

      <Divider />

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
            height: isMobile ? 24 : 32,
            width: isMobile ? 28 : 36,
            borderRadius: isMobile ? 6 : 8,
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

      <div style={{ height: 4 }} />

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

const baseBtnSmall = {
  width: 32,
  height: 24,
  borderRadius: 6,
  border: "1px solid #2f3542",
  background: "#2f3542",
  color: "#fff",
  cursor: "pointer",
  fontSize: 12,
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








































