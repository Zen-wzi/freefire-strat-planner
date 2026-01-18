"use client";

import { useEffect } from "react";
import StrategyCanvas from "../components/StrategyCanvas";

export default function Home() {
  useEffect(() => {
    // 🔒 LOCK SCROLL (PC + MOBILE)
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
        background: "#0f1115"
      }}
    >
      {/* The entire app frame now lives inside StrategyCanvas */}
      <StrategyCanvas />
    </div>
  );
}













