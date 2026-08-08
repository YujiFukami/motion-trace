import { createCircleMotionPoint } from "./circleMotion";
import { createLinearMotionPoint } from "./linearMotion";
import type { MotionPoint, PlacedPoint } from "./types";

// Extension point for future motion types (ellipse, Lissajous, spiral, ...).
// New factories register here without touching the renderer.
export const MOTION_FACTORIES = {
  circle: createCircleMotionPoint,
  linear: createLinearMotionPoint,
};

export function createMotionPoint(placed: PlacedPoint): MotionPoint {
  switch (placed.type) {
    case "circle":
      return MOTION_FACTORIES.circle(placed.id, placed.params);
    case "linear":
      return MOTION_FACTORIES.linear(placed.id, placed.params);
  }
}
