export interface Point2D {
  x: number;
  y: number;
}

export type MotionType = "circle" | "linear";

export interface MotionParamsBase {
  centerX: number;
  centerY: number;
  period: number; // seconds per full cycle
  initialPhase: number; // radians
}

export interface CircleMotionParams extends MotionParamsBase {
  radius: number;
  clockwise: boolean;
}

export interface LinearMotionParams extends MotionParamsBase {
  amplitude: number;
  angleDeg: number; // 0 = horizontal, 90 = vertical, 45 = diagonal
}

export interface MotionPoint<
  P extends MotionParamsBase = CircleMotionParams | LinearMotionParams,
> {
  id: string;
  type: MotionType;
  params: P;
  getPosition(t: number): Point2D;
}
