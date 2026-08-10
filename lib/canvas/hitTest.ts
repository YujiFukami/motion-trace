import type { Point2D } from "@/lib/motion/types";

export function hitTestPoint(
  pos: Point2D,
  target: Point2D,
  radius: number,
): boolean {
  const dx = pos.x - target.x;
  const dy = pos.y - target.y;
  return dx * dx + dy * dy <= radius * radius;
}

export function hitTestSegment(
  pos: Point2D,
  p1: Point2D,
  p2: Point2D,
  maxDist: number,
): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;
  const t =
    lenSq === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((pos.x - p1.x) * dx + (pos.y - p1.y) * dy) / lenSq),
        );
  const closestX = p1.x + t * dx;
  const closestY = p1.y + t * dy;
  const ddx = pos.x - closestX;
  const ddy = pos.y - closestY;
  return ddx * ddx + ddy * ddy <= maxDist * maxDist;
}

export function hitTestCircleEdge(
  pos: Point2D,
  center: Point2D,
  radius: number,
  tolerance: number,
): boolean {
  const dx = pos.x - center.x;
  const dy = pos.y - center.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return Math.abs(dist - radius) <= tolerance;
}
