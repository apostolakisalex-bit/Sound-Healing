import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

/**
 * Sacred-geometry hexagram (Merkaba) enclosed in a circle with a dotted outer
 * ring. Thin line-art in a single color, matching the slate sacred-geometry
 * symbols used for the other services.
 */
export function SacredStar({
  size = 44,
  color = "#545F7A",
  strokeWidth = 1.8,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* dotted outer ring */}
      <Circle
        cx={50}
        cy={50}
        r={48}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray="1 4"
        strokeLinecap="round"
      />
      {/* solid enclosing circle */}
      <Circle cx={50} cy={50} r={42} fill="none" stroke={color} strokeWidth={strokeWidth} />
      {/* upward triangle */}
      <Path
        d="M50 12 L82.91 69 L17.09 69 Z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* downward triangle */}
      <Path
        d="M50 88 L82.91 31 L17.09 31 Z"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {/* inner circle */}
      <Circle cx={50} cy={50} r={13} fill="none" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}
