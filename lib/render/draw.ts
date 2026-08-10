import type { Point2D } from "../motion/types";
import type { TrailSegment } from "../trail/trailBuffer";

export function drawTrailSegment(
  ctx: CanvasRenderingContext2D,
  segment: TrailSegment,
  currentTime: number,
  trailLifetime: number,
  lineWidth: number,
  color: string,
): void {
  const alpha = Math.max(
    0,
    Math.min(1, 1 - (currentTime - segment.createdAt) / trailLifetime),
  );
  ctx.globalAlpha = alpha;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(segment.p1.x, segment.p1.y);
  ctx.lineTo(segment.p2.x, segment.p2.y);
  ctx.stroke();
}

export function drawCurrentLine(
  ctx: CanvasRenderingContext2D,
  p1: Point2D,
  p2: Point2D,
  lineWidth: number,
  color: string,
): void {
  ctx.globalAlpha = 1;
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

export function drawPointMarker(
  ctx: CanvasRenderingContext2D,
  p: Point2D,
  radius: number,
  color: string,
): void {
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function drawPointHighlight(
  ctx: CanvasRenderingContext2D,
  p: Point2D,
  radius: number,
  color: string,
): void {
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawGuideCircle(
  ctx: CanvasRenderingContext2D,
  center: Point2D,
  radius: number,
  color: string,
): void {
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawGuideLine(
  ctx: CanvasRenderingContext2D,
  p1: Point2D,
  p2: Point2D,
  color: string,
): void {
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawCenterMark(
  ctx: CanvasRenderingContext2D,
  center: Point2D,
  size: number,
  color: string,
): void {
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(center.x - size, center.y - size);
  ctx.lineTo(center.x + size, center.y + size);
  ctx.moveTo(center.x + size, center.y - size);
  ctx.lineTo(center.x - size, center.y + size);
  ctx.stroke();
}
