import React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * Minimal line-style "sound spiral" (ηχοσπείρα) icon.
 * Matches the thin outline aesthetic of the other bottom-nav icons.
 */
export function SoundSpiral({
  size = 21,
  color = "#293344",
  strokeWidth = 1.8,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const cx = 12;
  const cy = 12;
  const turns = 2.6;
  const maxR = 9;
  const steps = 160;
  const total = turns * 2 * Math.PI;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * total;
    const r = (t / total) * maxR;
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t);
    d += (i === 0 ? "M" : " L") + x.toFixed(2) + " " + y.toFixed(2);
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
