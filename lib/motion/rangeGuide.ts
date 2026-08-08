import type { PlacedPoint, Point2D } from "./types";

export type RangeGuide =
  | { type: "circle"; center: Point2D; radius: number }
  | { type: "linear"; p1: Point2D; p2: Point2D };

export function getRangeGuide(point: PlacedPoint): RangeGuide {
  if (point.type === "circle") {
    return {
      type: "circle",
      center: { x: point.params.centerX, y: point.params.centerY },
      radius: point.params.radius,
    };
  }
  const angleRad = (point.params.angleDeg * Math.PI) / 180;
  const dx = Math.cos(angleRad) * point.params.amplitude;
  const dy = Math.sin(angleRad) * point.params.amplitude;
  return {
    type: "linear",
    p1: {
      x: point.params.centerX - dx,
      y: point.params.centerY - dy,
    },
    p2: {
      x: point.params.centerX + dx,
      y: point.params.centerY + dy,
    },
  };
}
