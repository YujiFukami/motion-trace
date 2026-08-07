import type { Point2D } from "../motion/types";

export interface TrailSegment {
  p1: Point2D;
  p2: Point2D;
  createdAt: number; // simulation time when recorded (seconds)
}

export function pruneExpired(
  segments: TrailSegment[],
  currentTime: number,
  trailLifetime: number,
): void {
  while (
    segments.length > 0 &&
    currentTime - segments[0].createdAt > trailLifetime
  ) {
    segments.shift();
  }
}
