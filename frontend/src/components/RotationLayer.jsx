"use client";

const PLAYER_SIZE = 36;

export default function RotationLayer({
  rotations = [],
  players = [],
  containerSize
}) {
  if (!containerSize || !players) return null;
  const safePlayers = Array.isArray(players) ? players : [];

  // ✅ SAME coordinate logic as PlayerLayer (center-based)
  const getCenterPos = (p) => ({
    x: ((p.x + PLAYER_SIZE / 2) / 1000) * containerSize.width,
    y: ((p.y + PLAYER_SIZE / 2) / 600) * containerSize.height
  });

  return (
    <svg
      width={containerSize.width}
      height={containerSize.height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 5
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="yellow" />
        </marker>
      </defs>

      {rotations.map((r, i) => {
        const from = safePlayers.find((p) => p.id === r.fromId);
        const to = safePlayers.find((p) => p.id === r.toId);
        if (!from || !to) return null;

        const start = getCenterPos(from);
        const end = getCenterPos(to);

        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2 - 30;

        return (
          <path
            key={i}
            d={`M${start.x},${start.y} Q${midX},${midY} ${end.x},${end.y}`}
            stroke="yellow"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
        );
      })}
    </svg>
  );
}
















