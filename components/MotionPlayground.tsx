"use client";

import { useEffect, useReducer, useState } from "react";
import SimulationCanvas, { type CanvasHit } from "./SimulationCanvas";
import ControlsPanel from "./ControlsPanel";
import Toolbar from "./Toolbar";
import PointEditPopover from "./PointEditPopover";
import ConnectionContextMenu from "./ConnectionContextMenu";
import { sceneReducer, initialSceneState } from "@/lib/scene/sceneReducer";

type PopoverState =
  | { kind: "point"; pointId: string; x: number; y: number }
  | { kind: "connection"; connectionId: string; x: number; y: number }
  | null;

export default function MotionPlayground() {
  const [scene, dispatch] = useReducer(sceneReducer, initialSceneState);
  const [popover, setPopover] = useState<PopoverState>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [recordInterval, setRecordInterval] = useState(0.1);
  const [trailLifetime, setTrailLifetime] = useState(3);
  const [resetSignal, setResetSignal] = useState(0);
  const [clearTrailSignal, setClearTrailSignal] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        dispatch({ type: "SET_MODE", mode: "select" });
        setPopover(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleCanvasClick(hit: CanvasHit, worldPos: { x: number; y: number }) {
    if (scene.mode === "placeCircle") {
      dispatch({ type: "PLACE_POINT", pointType: "circle", pos: worldPos });
    } else if (scene.mode === "placeLinear") {
      dispatch({ type: "PLACE_POINT", pointType: "linear", pos: worldPos });
    } else if (scene.mode === "connect") {
      if (hit.kind === "point") {
        dispatch({ type: "CONNECT_CLICK", pointId: hit.id });
      } else if (hit.kind === "empty") {
        dispatch({ type: "CANCEL_PENDING_CONNECT" });
      }
    }
  }

  function handleCanvasContextMenu(
    hit: CanvasHit,
    clientX: number,
    clientY: number,
  ) {
    if (hit.kind === "point") {
      setPopover({ kind: "point", pointId: hit.id, x: clientX, y: clientY });
    } else if (hit.kind === "connection") {
      setPopover({
        kind: "connection",
        connectionId: hit.id,
        x: clientX,
        y: clientY,
      });
    } else {
      setPopover(null);
    }
  }

  const editingPoint =
    popover?.kind === "point"
      ? scene.points.find((p) => p.id === popover.pointId)
      : undefined;

  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4">
      <h1 className="text-2xl font-semibold text-zinc-50">
        軌道・残像ジェネレーター
      </h1>

      <SimulationCanvas
        points={scene.points}
        connections={scene.connections}
        isPlaying={isPlaying}
        recordInterval={recordInterval}
        trailLifetime={trailLifetime}
        resetSignal={resetSignal}
        clearTrailSignal={clearTrailSignal}
        mode={scene.mode}
        connectStartId={scene.connectStartId}
        onCanvasClick={handleCanvasClick}
        onCanvasContextMenu={handleCanvasContextMenu}
      />

      <Toolbar
        mode={scene.mode}
        onModeChange={(mode) => dispatch({ type: "SET_MODE", mode })}
      />

      <ControlsPanel
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((v) => !v)}
        onReset={() => setResetSignal((v) => v + 1)}
        onClearTrail={() => setClearTrailSignal((v) => v + 1)}
        recordInterval={recordInterval}
        onRecordIntervalChange={setRecordInterval}
        trailLifetime={trailLifetime}
        onTrailLifetimeChange={setTrailLifetime}
      />

      {popover?.kind === "point" && editingPoint && (
        <PointEditPopover
          point={editingPoint}
          x={popover.x}
          y={popover.y}
          onChange={(params) =>
            dispatch({
              type: "UPDATE_POINT_PARAMS",
              id: editingPoint.id,
              params,
            })
          }
          onDelete={() => {
            dispatch({ type: "DELETE_POINT", id: editingPoint.id });
            setPopover(null);
          }}
          onClose={() => setPopover(null)}
        />
      )}

      {popover?.kind === "connection" && (
        <ConnectionContextMenu
          x={popover.x}
          y={popover.y}
          onDelete={() => {
            dispatch({ type: "DELETE_CONNECTION", id: popover.connectionId });
            setPopover(null);
          }}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}
