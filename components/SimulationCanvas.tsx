"use client";

import { useEffect, useRef } from "react";
import { createCircleMotionPoint } from "@/lib/motion/circleMotion";
import { createLinearMotionPoint } from "@/lib/motion/linearMotion";
import type {
  CircleMotionParams,
  LinearMotionParams,
} from "@/lib/motion/types";
import { pruneExpired, type TrailSegment } from "@/lib/trail/trailBuffer";
import {
  drawCurrentLine,
  drawPointMarker,
  drawTrailSegment,
} from "@/lib/render/draw";
import { useAnimationLoop } from "@/lib/animation/useAnimationLoop";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 560;
const TRAIL_COLOR = "#7dd3fc";
const CURRENT_LINE_COLOR = "#f8fafc";
const TRAIL_LINE_WIDTH = 1.5;
const CURRENT_LINE_WIDTH = 2.5;
const POINT_RADIUS = 4;

export interface SimulationCanvasProps {
  pointAParams: CircleMotionParams;
  pointBParams: LinearMotionParams;
  isPlaying: boolean;
  recordInterval: number;
  trailLifetime: number;
  resetSignal: number;
  clearTrailSignal: number;
}

export default function SimulationCanvas({
  pointAParams,
  pointBParams,
  isPlaying,
  recordInterval,
  trailLifetime,
  resetSignal,
  clearTrailSignal,
}: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trailRef = useRef<TrailSegment[]>([]);
  const lastRecordedRef = useRef(0);

  const pointARef = useRef(createCircleMotionPoint("a", pointAParams));
  useEffect(() => {
    pointARef.current = createCircleMotionPoint("a", pointAParams);
  }, [pointAParams]);

  const pointBRef = useRef(createLinearMotionPoint("b", pointBParams));
  useEffect(() => {
    pointBRef.current = createLinearMotionPoint("b", pointBParams);
  }, [pointBParams]);

  const recordIntervalRef = useRef(recordInterval);
  const trailLifetimeRef = useRef(trailLifetime);
  useEffect(() => {
    recordIntervalRef.current = recordInterval;
    trailLifetimeRef.current = trailLifetime;
  });

  const { simTimeRef } = useAnimationLoop(isPlaying, (t) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const p1 = pointARef.current.getPosition(t);
    const p2 = pointBRef.current.getPosition(t);

    if (t - lastRecordedRef.current >= recordIntervalRef.current) {
      trailRef.current.push({ p1, p2, createdAt: t });
      lastRecordedRef.current = t;
    }
    pruneExpired(trailRef.current, t, trailLifetimeRef.current);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    for (const segment of trailRef.current) {
      drawTrailSegment(
        ctx,
        segment,
        t,
        trailLifetimeRef.current,
        TRAIL_LINE_WIDTH,
        TRAIL_COLOR,
      );
    }
    drawCurrentLine(ctx, p1, p2, CURRENT_LINE_WIDTH, CURRENT_LINE_COLOR);
    drawPointMarker(ctx, p1, POINT_RADIUS, CURRENT_LINE_COLOR);
    drawPointMarker(ctx, p2, POINT_RADIUS, CURRENT_LINE_COLOR);

    ctx.restore();
  });

  const isFirstResetRef = useRef(true);
  useEffect(() => {
    if (isFirstResetRef.current) {
      isFirstResetRef.current = false;
      return;
    }
    simTimeRef.current = 0;
    lastRecordedRef.current = 0;
    trailRef.current = [];
  }, [resetSignal, simTimeRef]);

  const isFirstClearRef = useRef(true);
  useEffect(() => {
    if (isFirstClearRef.current) {
      isFirstClearRef.current = false;
      return;
    }
    trailRef.current = [];
  }, [clearTrailSignal]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="w-full max-w-3xl rounded-lg border border-white/10 bg-black"
    />
  );
}
