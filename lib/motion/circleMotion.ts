import type { CircleMotionParams, MotionPoint } from "./types";

export function createCircleMotionPoint(
  id: string,
  params: CircleMotionParams,
): MotionPoint<CircleMotionParams> {
  return {
    id,
    type: "circle",
    params,
    getPosition(t) {
      const omega =
        ((2 * Math.PI) / params.period) * (params.clockwise ? -1 : 1);
      const theta = omega * t + params.initialPhase;
      return {
        x: params.centerX + params.radius * Math.cos(theta),
        y: params.centerY + params.radius * Math.sin(theta),
      };
    },
  };
}

export const DEFAULT_CIRCLE_PARAMS: CircleMotionParams = {
  centerX: 0,
  centerY: 0,
  period: 4,
  initialPhase: 0,
  radius: 120,
  clockwise: false,
};
