"use client";
import { useState, useEffect } from "react";
import PresentationControls from "./PresentationControls";

const MAPS = [
  {
    name: "Bermuda",
    path: "/maps/bermuda.jpg",
    preview: "/maps/bermuda-preview.jpg"
  },
  {
    name: "Purgatory",
    path: "/maps/purgatory.jpg",
    preview: "/maps/purgatory-preview.jpg"
  },
  { name: "kalahari",
    path: "/maps/kalahari.jpg",
    preview: "/maps/kalahari-preview.jpg"
  },
  { name: "nexterra",
    path: "/maps/nexterra.jpg",
    preview: "/maps/nexterra-preview.jpg"
    },
    { name:"alpine",
      path: "/maps/alpine.jpg",
      preview: "/maps/alpine-preview.jpg"
    },
    { name: "solara",
      path: "/maps/solara.jpg",
      preview: "/maps/solara-preview.jpg"
    }
];

export default function Toolbar({
  isMobile,
  setTool,
  clearAllPhases,
  clearCurrentPhase,
  clearPlayersInPhase,
  clearStrokesInPhase,
  setColor,
  setPenWidth,
  setPenOpacity,
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
  const desktop = !isMobile;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(phaseName);
  const [activeTool, setActiveTool] = useState(null);
  const [penOpen, setPenOpen] = useState(false);
  const [penTool, setPenTool] = useState("pen"); // pen | arrow | dashed | line | rect | path

  const [mapOpen, setMapOpen] = useState(false);

  const panelPadding = isMobile ? 6 : 14;
  const panelGap = isMobile ? 6 : 14;
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
        paddingLeft: isMobile ? panelPadding : panelPadding + 6,
        paddingRight: isMobile ? panelPadding : panelPadding + 6,
        gap: panelGap,
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#fff"
      }}
    >
      <style>{sliderCSS}</style>
      {/* STRATEGY HEADER SHELL */}
      <div
        style={{
         padding: desktop ? "16px 14px" : headerPadding,
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
          {...(!isMobile ? desktopHoverHandlers : {})}
          onClick={() => setMapOpen((o) => !o)}
          style={{
            ...(!isMobile ? desktopHoverPop : {}),
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
      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 5 : 10 }}>
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
            {...(!isMobile ? desktopHoverHandlers : {})}
            onClick={prevPhase}
            style={baseBtnSmall}
            {...(!isMobile ? desktopHoverPop : {})}
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
            {...(!isMobile ? desktopHoverHandlers : {})}
            onClick={nextPhase}
            style={baseBtnSmall}
            {...(!isMobile ? desktopHoverPop : {})}
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
          gap: isMobile ? 6 : 12
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
          onClick={clearAllPhases}
          {...(!isMobile ? desktopHoverHandlers : {})}
          style={{
            ...baseBtn,
            ...(!isMobile ? desktopHoverPop : {}),
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
          onClick={clearCurrentPhase}
          {...(!isMobile ? desktopHoverHandlers : {})}
          style={{
            ...baseBtn,
            ...(!isMobile ? desktopHoverPop : {}),
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
          <button {...pressHandlers} {...(!isMobile ? desktopHoverHandlers : {})} style={{ ...baseBtn, ...(!isMobile ? desktopHoverPop : {}), flex: 1 }} onClick={clearPlayersInPhase}>👤</button>
          <button {...pressHandlers} {...(!isMobile ? desktopHoverHandlers : {})} style={{ ...baseBtn, ...(!isMobile ? desktopHoverPop : {}), flex: 1 }}>💥</button>
          <button {...pressHandlers} {...(!isMobile ? desktopHoverHandlers : {})} style={{ ...baseBtn, ...(!isMobile ? desktopHoverPop : {}), flex: 1 }} onClick={clearStrokesInPhase}>✏️</button>
          <button {...pressHandlers} {...(!isMobile ? desktopHoverHandlers : {})} style={{ ...baseBtn, ...(!isMobile ? desktopHoverPop : {}), flex: 1 }}>📝</button>
          <button {...pressHandlers} {...(!isMobile ? desktopHoverHandlers : {})} style={{ ...baseBtn, ...(!isMobile ? desktopHoverPop : {}), flex: 1 }}>🖼</button>

        </div>
      </div>

      <Divider />

      <Divider />

      {/* DRAW TOOLS */}
      <div style={rowStyle}>
              <button
          {...pressHandlers}
          {...(!isMobile ? desktopHoverHandlers : {})}
          style={toolBtn(activeTool === "pen", "#2ed573")}
          {...(!isMobile ? desktopHoverPop : {})}
          onClick={() => {
  // toggle pen tool
  if (activeTool === "pen") {
    setTool(null);
    setActiveTool(null);
    setPenOpen(false);
  } else {
    setPenOpen(true);
    setTool(penTool);
    setActiveTool("pen");
  }
}}
        >
          ✏️
        </button>

        <button
          {...pressHandlers}
          {...(!isMobile ? desktopHoverHandlers : {})}
          style={toolBtn(activeTool === "eraser", "#ff4757")}
          {...(!isMobile ? desktopHoverPop : {})}
          onClick={() => {
  if (activeTool === "eraser") {
    setTool(null);
    setActiveTool(null);
  } else {
    setTool("eraser");
    setActiveTool("eraser");
  }
  setPenOpen(false);
}}

        >
          ⛔
        </button>
      </div>
            {penOpen && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 6
          }}
          
        >
                    {[
            ["pen", "✏️"],
            ["arrow", "➤"],
            ["dashed", "┄┄"],
            ["line", "─"],
            ["rect", "⬛"],
            ["path", "〰️"]
          ].map(([type, icon]) => (
            <button
              key={type}
              {...pressHandlers}
              {...(!isMobile ? desktopHoverHandlers : {})}
              onClick={() => {
                setPenTool(type);
                setTool(type);
              }}
              style={{
                ...baseBtn,
                ...(!isMobile ? desktopHoverPop : {}),
                fontSize: 11,
                background:
                  penTool === type ? "#2ed57333" : "#2f3542",
                border:
                  penTool === type
                    ? "1px solid #2ed573"
                    : "1px solid #2f3542",
                color: penTool === type ? "#2ed573" : "#fff"
              }}
            
            >
              {icon}
            </button>
          ))}
        </div>
      )}
            {penOpen && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 10,
            background: "#1f2430",
            border: "1px solid #2f3542",
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
         {/* COLOR */}
<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
  <div style={{ fontSize: 11, opacity: 0.75 }}>Color</div>

  <label
  {...(!isMobile ? desktopHoverHandlers : {})}
    style={{
      width: 44,
      height: 44,
      ...(!isMobile ? desktopHoverPop : {}),
      borderRadius: "50%",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <img
      src="/ui/color-wheel.png"
      alt="Color picker"
      draggable={false}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        display: "block"
      }}
    />

    <input
      type="color"
      onChange={(e) => setColor(e.target.value)}
      style={{
        position: "absolute",
        opacity: 0,
        pointerEvents: "none"
      }}
    />
  </label>
</div>



          {/* OPACITY */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    minWidth: 0
  }}
>
  <div style={{ fontSize: 12, opacity: 0.85, width: 70 }}>
    Opacity
  </div>

  <input
    type="range"
    min={0.1}
    max={1}
    step={0.05}
    defaultValue={1}
    onChange={(e) => setPenOpacity(Number(e.target.value))}
    style={{
      flex: 1,
      minWidth: 0,
      maxWidth: "100%",
      appearance: "none",
      height: 6,
      borderRadius: 10,
      background: "linear-gradient(to right, #d1d5db, #9ca3af)",
      outline: "none"
    }}
    onMouseDown={(e)=> e.stopPropagation()}
  />
</div>

{/* THICKNESS */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    minWidth: 0
  }}
>
  <div style={{ fontSize: 12, opacity: 0.85, width: 70 }}>
    Thickness
  </div>

  <input
    type="range"
    min={1}
    max={6}
    defaultValue={3}
    onChange={(e) => setPenWidth(Number(e.target.value))}
    style={{
      flex: 1,
      minWidth: 0,
      maxWidth: "100%",
      appearance: "none",
      height: 6,
      borderRadius: 10,
      background: "linear-gradient(to right, #d1d5db, #9ca3af)",
      outline: "none"
    }}
    onMouseDown={(e)=> e.stopPropagation()}
  />
</div>

        </div>
      )}



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

      <Divider />

      {/* SAVE */}

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

const hoverPop = {
  transition: "transform 140ms ease, box-shadow 140ms ease",
};

const hoverPopHandlers = {
  onMouseEnter: (e) => {
    e.currentTarget.style.transform = "scale(1.06)";
    e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.35)";
  },
  onMouseLeave: (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "";
  }
};


const baseBtn = {
  flex: 1,
  maxWidth: "100%",
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
const desktopHoverPop = {
  transition: "transform 140ms ease, box-shadow 140ms ease"
};

const desktopHoverHandlers = {
  onMouseEnter: (e) => {
    e.currentTarget.style.transform = "scale(1.06)";
    e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.35)";
  },
  onMouseLeave: (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "";
  }
};
/* modern slider styling */
const sliderCSS = `
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #9ca3af;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 0 10px rgba(255,255,255,0.25);
}
input[type="range"]::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 10px;
}
`;









































