"use client";

import { useEffect, useRef, useState } from "react";
import { createMotionPoint } from "@/lib/motion/registry";
import type {
  CircleMotionParams,
  LinearMotionParams,
  MotionPoint,
  PlacedPoint,
  Point2D,
} from "@/lib/motion/types";
import type { Connection } from "@/lib/connections/types";
import type { Mode } from "@/lib/scene/sceneReducer";
import { pruneExpired, type TrailSegment } from "@/lib/trail/trailBuffer";
import {
  drawCenterMark,
  drawCurrentLine,
  drawGuideCircle,
  drawGuideLine,
  drawPointHighlight,
  drawPointMarker,
  drawTrailSegment,
} from "@/lib/render/draw";
import { getRangeGuide } from "@/lib/motion/rangeGuide";
import type { ColorSettings } from "@/lib/render/colors";
import { useAnimationLoop } from "@/lib/animation/useAnimationLoop";
import { clientToWorld } from "@/lib/canvas/coords";
import {
  hitTestCircleEdge,
  hitTestPoint,
  hitTestSegment,
} from "@/lib/canvas/hitTest";
import { useLocale } from "@/lib/i18n/LocaleContext";

const LANDSCAPE_WIDTH = 800;
const LANDSCAPE_HEIGHT = 560;
const HIGHLIGHT_COLOR = "#facc15";
const GUIDE_COLOR = "#c084fc";
const TRAIL_LINE_WIDTH = 1.5;
const CURRENT_LINE_WIDTH = 2.5;
const POINT_RADIUS = 4;
const HIGHLIGHT_RADIUS = 9;
const POINT_HIT_RADIUS = 14;
const LINE_HIT_DIST = 8;
const CENTER_MARK_SIZE = 8;
const ENDPOINT_MARK_RADIUS = 8;
const ENDPOINT_HIT_RADIUS = 14;

type DragKind = "point" | "center" | "radius" | "endpoint1" | "endpoint2";

const CURSOR_BY_MODE: Record<Mode, string> = {
  select: "cursor-grab",
  placeCircle: "cursor-crosshair",
  placeLinear: "cursor-crosshair",
  connect: "cursor-pointer",
};

// Minimum pointer travel (world units) before a select-mode press is
// treated as a drag rather than a click, so the click that ends a drag
// doesn't also fire onCanvasClick.
const DRAG_THRESHOLD = 3;

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
  editingPointId: string | null;
  showGuides: boolean;
  colors: ColorSettings;
  onCanvasClick: (hit: CanvasHit, worldPos: Point2D) => void;
  onCanvasContextMenu: (
    hit: CanvasHit,
    clientX: number,
    clientY: number,
  ) => void;
  onPointParamsChange: (
    id: string,
    params: Partial<CircleMotionParams> | Partial<LinearMotionParams>,
  ) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onClearTrail: () => void;
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
  editingPointId,
  showGuides,
  colors,
  onCanvasClick,
  onCanvasContextMenu,
  onPointParamsChange,
  onTogglePlay,
  onReset,
  onClearTrail,
}: SimulationCanvasProps) {
  const { t } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const draggingIdRef = useRef<string | null>(null);
  const dragKindRef = useRef<DragKind | null>(null);
  const dragStartWorldRef = useRef<Point2D>({ x: 0, y: 0 });
  const dragStartCenterRef = useRef<Point2D>({ x: 0, y: 0 });
  const draggedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
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
  const showGuidesRef = useRef(showGuides);
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    connectionsRef.current = connections;
    connectStartIdRef.current = connectStartId;
    showGuidesRef.current = showGuides;
    isPlayingRef.current = isPlaying;
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

    if (
      recordTrail &&
      t - lastRecordedRef.current >= recordIntervalRef.current
    ) {
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
        colors.trail,
      );
    }
    for (const { p1, p2 } of activeConnections) {
      drawCurrentLine(ctx, p1, p2, CURRENT_LINE_WIDTH, colors.line);
    }

    for (const p of points) {
      if (!showGuidesRef.current && p.id !== editingPointId) continue;
      const guide = getRangeGuide(p);
      if (guide.type === "circle") {
        drawGuideCircle(ctx, guide.center, guide.radius, GUIDE_COLOR);
      } else {
        drawGuideLine(ctx, guide.p1, guide.p2, GUIDE_COLOR);
      }
      drawCenterMark(
        ctx,
        { x: p.params.centerX, y: p.params.centerY },
        CENTER_MARK_SIZE,
        GUIDE_COLOR,
      );
      if (guide.type === "linear") {
        drawPointHighlight(ctx, guide.p1, ENDPOINT_MARK_RADIUS, GUIDE_COLOR);
        drawPointHighlight(ctx, guide.p2, ENDPOINT_MARK_RADIUS, GUIDE_COLOR);
      }
    }

    for (const id of motionPointsRef.current.keys()) {
      const pos = livePositionsRef.current.get(id);
      if (!pos) continue;
      drawPointMarker(ctx, pos, POINT_RADIUS, colors.point);
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
  }, [
    points,
    connections,
    connectStartId,
    editingPointId,
    showGuides,
    colors,
    isPlaying,
    mode,
  ]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Swap the canvas to a portrait (tall) shape on portrait viewports instead
  // of always rendering the landscape-shaped world, so a phone held upright
  // isn't stuck with a short, wide canvas leaving most of the screen empty.
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    // matchMedia only exists client-side; this mirrors the hydration-safe
    // localStorage-read pattern used for locale (read after mount, once).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPortrait(mq.matches);
    function onChange(e: MediaQueryListEvent) {
      setIsPortrait(e.matches);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  }

  const isFirstResetRef = useRef(true);
  useEffect(() => {
    if (isFirstResetRef.current) {
      isFirstResetRef.current = false;
      return;
    }
    simTimeRef.current = 0;
    lastRecordedRef.current = 0;
    trailRef.current = [];
    // While paused, no RAF tick is coming to pick up this change — redraw
    // immediately so the cleared trail is actually visible right away.
    if (!isPlayingRef.current) renderFrame(simTimeRef.current, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal, simTimeRef]);

  const isFirstClearRef = useRef(true);
  useEffect(() => {
    if (isFirstClearRef.current) {
      isFirstClearRef.current = false;
      return;
    }
    trailRef.current = [];
    if (!isPlayingRef.current) renderFrame(simTimeRef.current, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // The center mark / endpoint handles / circle edge are only grabbable
  // when their guide is actually drawn (showGuides toggle, or this point
  // is the one currently being edited) — never an invisible hit target.
  function isGuideVisible(pointId: string): boolean {
    return showGuidesRef.current || pointId === editingPointId;
  }

  // Priority order for select-mode drags: the static center mark (easiest
  // to grab reliably since it never moves) → linear endpoint handles →
  // the circle guide's edge → finally the live, moving dot itself (the
  // original drag-to-move target, kept working alongside the new handles).
  function resolveDragStart(
    clientX: number,
    clientY: number,
  ): { kind: DragKind; id: string; world: Point2D } | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const world = clientToWorld(canvas, clientX, clientY);

    for (const p of points) {
      if (!isGuideVisible(p.id)) continue;
      const center = { x: p.params.centerX, y: p.params.centerY };
      if (hitTestPoint(world, center, POINT_HIT_RADIUS)) {
        return { kind: "center", id: p.id, world };
      }
    }
    for (const p of points) {
      if (p.type !== "linear" || !isGuideVisible(p.id)) continue;
      const guide = getRangeGuide(p);
      if (guide.type !== "linear") continue;
      if (hitTestPoint(world, guide.p1, ENDPOINT_HIT_RADIUS)) {
        return { kind: "endpoint1", id: p.id, world };
      }
      if (hitTestPoint(world, guide.p2, ENDPOINT_HIT_RADIUS)) {
        return { kind: "endpoint2", id: p.id, world };
      }
    }
    for (const p of points) {
      if (p.type !== "circle" || !isGuideVisible(p.id)) continue;
      const center = { x: p.params.centerX, y: p.params.centerY };
      if (hitTestCircleEdge(world, center, p.params.radius, LINE_HIT_DIST)) {
        return { kind: "radius", id: p.id, world };
      }
    }
    for (const p of points) {
      const pos = livePositionsRef.current.get(p.id);
      if (pos && hitTestPoint(world, pos, POINT_HIT_RADIUS)) {
        return { kind: "point", id: p.id, world };
      }
    }
    return null;
  }

  const canvasWidth = isPortrait ? LANDSCAPE_HEIGHT : LANDSCAPE_WIDTH;
  const canvasHeight = isPortrait ? LANDSCAPE_WIDTH : LANDSCAPE_HEIGHT;

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "flex h-full w-full items-center justify-center bg-black"
          : "relative w-full max-w-3xl"
      }
    >
      <div
        className={`motion-canvas-box relative w-full ${
          isPortrait ? "aspect-[560/800]" : "aspect-[800/560]"
        }`}
        style={
          isFullscreen
            ? {
                width: isPortrait
                  ? "min(100%, calc(100vh * 560 / 800))"
                  : "min(100%, calc(100vh * 800 / 560))",
              }
            : undefined
        }
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onClick={(e) => {
            if (draggedRef.current) {
              draggedRef.current = false;
              return;
            }
            const { hit, world } = resolveHit(e.clientX, e.clientY);
            onCanvasClick(hit, world);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            const { hit } = resolveHit(e.clientX, e.clientY);
            onCanvasContextMenu(hit, e.clientX, e.clientY);
          }}
          onPointerDown={(e) => {
            if (mode !== "select") return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const target = resolveDragStart(e.clientX, e.clientY);
            if (!target) return;
            draggingIdRef.current = target.id;
            dragKindRef.current = target.kind;
            draggedRef.current = false;
            dragStartWorldRef.current = target.world;
            if (target.kind === "point" || target.kind === "center") {
              const point = points.find((p) => p.id === target.id);
              if (point) {
                dragStartCenterRef.current = {
                  x: point.params.centerX,
                  y: point.params.centerY,
                };
              }
            }
            canvas.setPointerCapture(e.pointerId);
            setIsDragging(true);
          }}
          onPointerMove={(e) => {
            const id = draggingIdRef.current;
            const kind = dragKindRef.current;
            const canvas = canvasRef.current;
            if (!id || !kind || !canvas) return;
            const world = clientToWorld(canvas, e.clientX, e.clientY);
            const dx = world.x - dragStartWorldRef.current.x;
            const dy = world.y - dragStartWorldRef.current.y;
            if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
              draggedRef.current = true;
            }

            if (kind === "point" || kind === "center") {
              onPointParamsChange(id, {
                centerX: dragStartCenterRef.current.x + dx,
                centerY: dragStartCenterRef.current.y + dy,
              });
              return;
            }

            const point = points.find((p) => p.id === id);
            if (!point) return;
            const center = {
              x: point.params.centerX,
              y: point.params.centerY,
            };

            if (kind === "radius" && point.type === "circle") {
              const radius = Math.min(
                250,
                Math.max(10, Math.hypot(world.x - center.x, world.y - center.y)),
              );
              onPointParamsChange(id, { radius });
              return;
            }

            if (
              (kind === "endpoint1" || kind === "endpoint2") &&
              point.type === "linear"
            ) {
              let vx = world.x - center.x;
              let vy = world.y - center.y;
              if (kind === "endpoint1") {
                vx = -vx;
                vy = -vy;
              }
              const amplitude = Math.min(250, Math.max(10, Math.hypot(vx, vy)));
              const angleDeg = (((Math.atan2(vy, vx) * 180) / Math.PI) + 360) % 360;
              onPointParamsChange(id, { amplitude, angleDeg });
            }
          }}
          onPointerUp={(e) => {
            if (draggingIdRef.current) {
              canvasRef.current?.releasePointerCapture(e.pointerId);
            }
            draggingIdRef.current = null;
            dragKindRef.current = null;
            setIsDragging(false);
          }}
          onPointerCancel={() => {
            draggingIdRef.current = null;
            dragKindRef.current = null;
            setIsDragging(false);
          }}
          style={{
            backgroundColor: colors.background,
            touchAction: "none",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
          }}
          className={`h-full w-full rounded-lg border border-white/10 ${
            isDragging ? "cursor-grabbing" : CURSOR_BY_MODE[mode]
          }`}
        />
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={
            isFullscreen ? t("fullscreen.exit") : t("fullscreen.enter")
          }
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white hover:bg-black/70"
        >
          <MaximizeIcon isFullscreen={isFullscreen} />
        </button>
        {isFullscreen && (
          <div className="absolute bottom-2 left-2 flex gap-2">
            <button
              type="button"
              onClick={onTogglePlay}
              className="rounded-md bg-black/50 px-3 py-1.5 text-sm font-medium text-white hover:bg-black/70"
            >
              {isPlaying ? t("controls.pause") : t("controls.play")}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-md bg-black/50 px-3 py-1.5 text-sm font-medium text-white hover:bg-black/70"
            >
              {t("controls.reset")}
            </button>
            <button
              type="button"
              onClick={onClearTrail}
              className="rounded-md bg-black/50 px-3 py-1.5 text-sm font-medium text-white hover:bg-black/70"
            >
              {t("controls.clearTrail")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MaximizeIcon({ isFullscreen }: { isFullscreen: boolean }) {
  if (isFullscreen) {
    return (
      <svg
        viewBox="0 0 20 20"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 3 L8 8 L3 8 M12 3 L12 8 L17 8 M8 17 L8 12 L3 12 M12 17 L12 12 L17 12" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8 L3 3 L8 3 M12 3 L17 3 L17 8 M17 12 L17 17 L12 17 M8 17 L3 17 L3 12" />
    </svg>
  );
}
