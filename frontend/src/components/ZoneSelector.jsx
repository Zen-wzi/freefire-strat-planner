"use client";
import { useMemo } from "react";

export default function ZoneSelector({
  zone,
  setZone,
  isMobile
}) {

  const clamp = (v) => {
  if (isMobile) return Math.max(1, Math.min(8, v)); // mobile cannot go below 1
  return Math.max(0, Math.min(8, v)); // desktop keeps 0
};

const visibleNumbers = useMemo(() => {
  const nums = [];

  if (isMobile) {
    // MOBILE STRUCTURE
    if (zone >= 2) {
      nums.push({ value: zone - 1, type: "blur" });
    }

    nums.push({ value: zone, type: "current" });

    if (zone <= 7) {
      nums.push({ value: zone + 1, type: "blur" });
    }

    return nums;
  }

  // DESKTOP STRUCTURE
  if (zone >= 2)
    nums.push({ value: zone - 2, type: "blur" });

  if (zone >= 1)
    nums.push({ value: zone - 1, type: "normal" });

  nums.push({ value: zone, type: "current" });

  if (zone <= 7)
    nums.push({ value: zone + 1, type: "normal" });

  if (zone <= 6)
    nums.push({ value: zone + 2, type: "blur" });

  return nums;
}, [zone, isMobile]);

  const wheelHandler = (e) => {
    if (isMobile) return;
    if (e.deltaY > 0) setZone(clamp(zone + 1));
    if (e.deltaY < 0) setZone(clamp(zone - 1));
  };

  const keyHandler = (e) => {
    if (isMobile) return;
    if (e.key >= "0" && e.key <= "8") {
      setZone(Number(e.key));
    }
  };

  // MOBILE (vertical under settings)
  return (
    <div
      style={{
  display: "flex",
  flexDirection: "column",
  gap: 8,
  alignItems: "center",
  userSelect: "none"
}}
    >
      {visibleNumbers.map((n) => (
        <div
          key={n.value}
          onClick={() => setZone(n.value)}
          style={{
            fontSize:
              n.type === "current" ? 22 :
              n.type === "normal" ? 18 : 14,
            opacity:
              n.type === "current" ? 1 :
              n.type === "normal" ? 0.9 : 0.35,
            fontWeight:
              n.type === "current" ? 700 : 500,
            color:
              n.type === "current" ? "#4cc9ff" : "#cfd6e4",
            cursor: "pointer"
          }}
        >
          {n.value}
        </div>
      ))}
    </div>
  );
}

