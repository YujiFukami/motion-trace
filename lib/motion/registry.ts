import { createCircleMotionPoint } from "./circleMotion";
import { createLinearMotionPoint } from "./linearMotion";

// Extension point for future motion types (ellipse, Lissajous, spiral, ...).
// v0.1 only wires up circle/linear directly (point A/B have fixed types),
// but new factories register here without touching the renderer.
export const MOTION_FACTORIES = {
  circle: createCircleMotionPoint,
  linear: createLinearMotionPoint,
};
