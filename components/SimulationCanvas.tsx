"use client";

import { useEffect, useRef } from "react";
import { createMotionPoint } from "@/lib/motion/registry";
import type {
  MotionPoint,
  PlacedPoint,
  Point2D,
} from "@/lib/motion/types";
import type { Connection } from "@/lib/connections/types";
import type { Mode } from "@/lib/scene/sceneReducer";
import { pruneExpired, type TrailSegment } from "@/lib/trail/trailBuffer";
import {
  drawCurrentLine,
  drawPointHighlight,
  drawPointMarker,
  drawTrailSegment,
} from "@/lib/render/draw";
import { useAnimationLoop } from "@/lib/animation/useAnimationLoop";
import { clientToWorld } from "@/lib/canvas/coords";
import { hitTestPoint, hitTestSegment } from "@/lib/canvas/hitTest";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 560;
const TRAIL_COLOR = "#7dd3fc";
const CURRENT_LINE_COLOR = "#f8fafc";
const HIGHLIGHT_COLOR = "#facc15";
const TRAIL_LINE_WIDTH = 1.5;
const CURRENT_LINE_WIDTH = 2.5;
const POINT_RADIUS = 4;
const HIGHLIGHT_RADIUS = 9;
const POINT_HIT_RADIUS = 14;
const LINE_HIT_DIST = 8;

const CURSOR_BY_MODE: Record<Mode, string> = {
  select: "cursor-default",
  placeCircle: "cursor-crosshair",
  placeLinear: "cursor-crosshair",
  connect: "cursor-pointer",
};

export type CanvasHit =
  | { kind: "point"; id: string }
  | { kind: "connection"; id: string }
  | { kind: "empty" };

export interface SimulationCanvasProps {
  points: PlacedPoint[];
  connections: Connection[];
  isPlaying: boolean;
  recordInterval: number;
  trailLifetime: number;
  resetSignal: number;
  clearTrailSignal: number;
  mode: Mode;
  connectStartId: string | null;
  onCanvasClick: (hit: CanvasHit, worldPos: Point2D) => void;
  onCanvasContextMenu: (
    hit: CanvasHit,
    clientX: number,
    clientY: number,
  ) => void;
}

export default function SimulationCanvas({
  points,
  connections,
  isPlaying,
  recordInterval,
  trailLifetime,
  resetSignal,
  clearTrailSignal,
  mode,
  connectStartId,
  onCanvasClick,
  onCanvasContextMenu,
}: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trailRef = useRef<TrailSegment[]>([]);
  const lastRecordedRef = useRef(0);
  const livePositionsRef = useRef<Map<string, Point2D>>(new Map());

  const motionPointsRef = useRef<Map<string, MotionPoint>>(new Map());
  useEffect(() => {
    const map = new Map<string, MotionPoint>();
    for (const p of points) map.set(p.id, createMotionPoint(p));
    motionPointsRef.current = map;

    for (const id of livePositionsRef.current.keys()) {
      if (!map.has(id)) livePositionsRef.current.delete(id);
    }
  }, [points]);

  const recordIntervalRef = useRef(recordInterval);
  const trailLifetimeRef = useRef(trailLifetime);
  useEffect(() => {
    recordIntervalRef.current = recordInterval;
    trailLifetimeRef.current = trailLifetime;
  });

  const connectionsRef = useRef(connections);
  const connectStartIdRef = useRef(connectStartId);
  useEffect(() => {
    connectionsRef.current = connections;
    connectStartIdRef.current = connectStartId;
  });

  // Shared draw path used both by the RAF loop (recordTrail: true) and by a
  // one-off redraw whenever points/connections change while paused, so a
  // newly placed/deleted point or connection is visible and hit-testable
  // immediately instead of waiting for the next tick (which never comes
  // while paused).
  function renderFrame(t: number, recordTrail: boolean) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    for (const [id, mp] of motionPointsRef.current) {
      livePositionsRef.current.set(id, mp.getPosition(t));
    }

    const activeConnections = connectionsRef.current
      .map((c) => ({
        c,
        p1: livePositionsRef.current.get(c.pointIdA),
        p2: livePositionsRef.current.get(c.pointIdB),
      }))
      .filter(
        (x): x is { c: Connection; p1: Point2D; p2: Point2D } =>
          !!x.p1 && !!x.p2,
      );

    if (recordTrail && t - lastRecordedRef.current >= recordIntervalRef.current) {
      for (const { c, p1, p2 } of activeConnections) {
        trailRef.current.push({ connectionId: c.id, p1, p2, createdAt: t });
      }
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
    for (const { p1, p2 } of activeConnections) {
      drawCurrentLine(ctx, p1, p2, CURRENT_LINE_WIDTH, CURRENT_LINE_COLOR);
    }
    for (const id of motionPointsRef.current.keys()) {
      const pos = livePositionsRef.current.get(id);
      if (!pos) continue;
      drawPointMarker(ctx, pos, POINT_RADIUS, CURRENT_LINE_COLOR);
      if (id === connectStartIdRef.current) {
        drawPointHighlight(ctx, pos, HIGHLIGHT_RADIUS, HIGHLIGHT_COLOR);
      }
    }

    ctx.restore();
  }

  const { simTimeRef } = useAnimationLoop(isPlaying, (t) => {
    renderFrame(t, true);
  });

  useEffect(() => {
    if (!isPlaying) renderFrame(simTimeRef.current, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, connections, connectStartId, isPlaying]);

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

  function resolveHit(
    clientX: number,
    clientY: number,
  ): { hit: CanvasHit; world: Point2D } {
    const canvas = canvasRef.current;
    if (!canvas) return { hit: { kind: "empty" }, world: { x: 0, y: 0 } };
    const world = clientToWorld(canvas, clientX, clientY);

    for (const p of points) {
      const pos = livePositionsRef.current.get(p.id);
      if (pos && hitTestPoint(world, pos, POINT_HIT_RADIUS)) {
        return { hit: { kind: "point", id: p.id }, world };
      }
    }
    for (const c of connections) {
      const p1 = livePositionsRef.current.get(c.pointIdA);
      const p2 = livePositionsRef.current.get(c.pointIdB);
      if (p1 && p2 && hitTestSegment(world, p1, p2, LINE_HIT_DIST)) {
        return { hit: { kind: "connection", id: c.id }, world };
      }
    }
    return { hit: { kind: "empty" }, world };
  }

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onClick={(e) => {
        const { hit, world } = resolveHit(e.clientX, e.clientY);
        onCanvasClick(hit, world);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        const { hit } = resolveHit(e.clientX, e.clientY);
        onCanvasContextMenu(hit, e.clientX, e.clientY);
      }}
      className={`w-full max-w-3xl rounded-lg border border-white/10 bg-black ${CURSOR_BY_MODE[mode]}`}
    />
  );
}
