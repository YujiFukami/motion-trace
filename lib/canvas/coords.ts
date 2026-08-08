import type { Point2D } from "@/lib/motion/types";

// Inverse of the ctx.translate(width/2, height/2) origin shift used when
// drawing, plus a correction for CSS-vs-internal-resolution scaling (the
// canvas is styled w-full max-w-3xl and can render smaller than its
// internal pixel size).
export function clientToWorld(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): Point2D {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const canvasX = (clientX - rect.left) * scaleX;
  const canvasY = (clientY - rect.top) * scaleY;
  return {
    x: canvasX - canvas.width / 2,
    y: canvasY - canvas.height / 2,
  };
}
