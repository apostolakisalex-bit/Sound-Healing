import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

/**
 * Sacred-geometry lotus / mandala: two rings of pointed petals inside a circle
 * with a dotted outer ring. Thin single-colour line-art, matching the slate
 * sacred-geometry symbols used for the other services.
 */
export function SacredMandala({
  size = 44,
  color = "#545F7A",
  strokeWidth = 1.5,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const outerAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const innerAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
  const outerPetal = "M50 50 C 44 33, 44 19, 50 8 C 56 19, 56 33, 50 50 Z";
  const innerPetal = "M50 50 C 46.5 40, 46.5 31, 50 24 C 53.5 31, 53.5 40, 50 50 Z";
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
      <Circle cx={50} cy={50} r={43} fill="none" stroke={color} strokeWidth={strokeWidth} />
      {/* inner ring of petals */}
      {innerAngles.map((a) => (
        <Path
          key={`i${a}`}
          d={innerPetal}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          transform={`rotate(${a} 50 50)`}
        />
      ))}
      {/* outer ring of petals */}
      {outerAngles.map((a) => (
        <Path
          key={`o${a}`}
          d={outerPetal}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          transform={`rotate(${a} 50 50)`}
        />
      ))}
      {/* centre */}
      <Circle cx={50} cy={50} r={6} fill="none" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}
