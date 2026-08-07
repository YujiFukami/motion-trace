import type { LinearMotionParams, MotionPoint } from "./types";

export function createLinearMotionPoint(
  id: string,
  params: LinearMotionParams,
): MotionPoint<LinearMotionParams> {
  const angleRad = (params.angleDeg * Math.PI) / 180;
  const dx = Math.cos(angleRad);
  const dy = Math.sin(angleRad);
  return {
    id,
    type: "linear",
    params,
    getPosition(t) {
      const omega = (2 * Math.PI) / params.period;
      const s = params.amplitude * Math.sin(omega * t + params.initialPhase);
      return {
        x: params.centerX + dx * s,
        y: params.centerY + dy * s,
      };
    },
  };
}

export const DEFAULT_LINEAR_PARAMS: LinearMotionParams = {
  centerX: 0,
  centerY: 0,
  period: 3,
  initialPhase: 0,
  amplitude: 150,
  angleDeg: 90,
};
