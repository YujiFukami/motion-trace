"use client";

import { useEffect, useReducer, useState } from "react";
import SimulationCanvas, { type CanvasHit } from "./SimulationCanvas";
import ControlsPanel from "./ControlsPanel";
import Toolbar from "./Toolbar";
import PointEditPopover from "./PointEditPopover";
import ConnectionContextMenu from "./ConnectionContextMenu";
import ColorSettingsPanel from "./ColorSettings";
import DataControls from "./DataControls";
import SettingsAccordion from "./SettingsAccordion";
import LanguageSwitcher from "./LanguageSwitcher";
import Footer from "./Footer";
import { sceneReducer, initialSceneState } from "@/lib/scene/sceneReducer";
import { DEFAULT_COLORS, type ColorSettings } from "@/lib/render/colors";
import {
  downloadTextFile,
  parseSceneFile,
  serializeScene,
} from "@/lib/scene/sceneFile";
import { decodeSceneFromParam, encodeSceneToParam } from "@/lib/scene/shareLink";
import { generateRandomScene } from "@/lib/scene/randomScene";
import { useLocale } from "@/lib/i18n/LocaleContext";

type PopoverState =
  | { kind: "point"; pointId: string; x: number; y: number }
  | { kind: "connection"; connectionId: string; x: number; y: number }
  | null;

export default function MotionPlayground() {
  const { t } = useLocale();
  const [scene, dispatch] = useReducer(sceneReducer, initialSceneState);
  const [popover, setPopover] = useState<PopoverState>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [recordInterval, setRecordInterval] = useState(0.05);
  const [trailLifetime, setTrailLifetime] = useState(9);
  const [resetSignal, setResetSignal] = useState(0);
  const [clearTrailSignal, setClearTrailSignal] = useState(0);
  const [colors, setColors] = useState<ColorSettings>(DEFAULT_COLORS);
  const [showGuides, setShowGuides] = useState(false);

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

  // Load a shared scene from ?s=<encoded> if present, then clean the URL so
  // further edits aren't tied to the stale link.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("s");
    if (!param) return;
    try {
      const data = decodeSceneFromParam(param);
      dispatch({
        type: "LOAD_SCENE",
        points: data.points,
        connections: data.connections,
      });
    } catch {
      // Ignore invalid/corrupted share links; keep the default scene.
    }
    window.history.replaceState(null, "", window.location.pathname);
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

  function handlePointMove(id: string, centerX: number, centerY: number) {
    dispatch({ type: "UPDATE_POINT_PARAMS", id, params: { centerX, centerY } });
  }

  function handleRandomize() {
    const { points, connections } = generateRandomScene();
    dispatch({ type: "LOAD_SCENE", points, connections });
    setPopover(null);
    setResetSignal((v) => v + 1);
    setClearTrailSignal((v) => v + 1);
  }

  function handleColorsChange(partial: Partial<ColorSettings>) {
    setColors((prev) => ({ ...prev, ...partial }));
  }

  function handleExport() {
    const json = serializeScene({
      version: 1,
      points: scene.points,
      connections: scene.connections,
      recordInterval,
      trailLifetime,
      colors,
    });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadTextFile(`motion-trace-${timestamp}.json`, json);
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const data = parseSceneFile(text);
      dispatch({
        type: "LOAD_SCENE",
        points: data.points,
        connections: data.connections,
      });
      if (typeof data.recordInterval === "number") {
        setRecordInterval(data.recordInterval);
      }
      if (typeof data.trailLifetime === "number") {
        setTrailLifetime(data.trailLifetime);
      }
      if (data.colors) {
        setColors((prev) => ({ ...prev, ...data.colors }));
      }
      setPopover(null);
    } catch {
      alert(t("data.importError"));
    }
  }

  async function handleShare(): Promise<boolean> {
    const encoded = encodeSceneToParam({
      points: scene.points,
      connections: scene.connections,
    });
    const url = `${window.location.origin}${window.location.pathname}?s=${encoded}`;

    // Prefer the OS/browser native share sheet (X, LINE, Mail, etc. — whatever
    // the device has installed) over just copying a link.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: t("app.title"), url });
        return false; // native UI already gave feedback; no toast needed
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return false;
        // fall through to the fallbacks below on any other failure
      }
    }

    // Browsers without the Web Share API (mainly desktop): open an X post
    // composer directly rather than silently copying.
    const tweetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(t("app.title"))}`;
    const opened = window.open(tweetUrl, "_blank", "noopener,noreferrer");
    if (opened) return false;

    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      prompt(t("data.share"), url);
      return false;
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
    <div className="landscape-shell flex w-full flex-col items-center gap-4 py-10 px-4">
      <div className="flex w-full max-w-3xl items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-zinc-50">
          {t("app.title")}
        </h1>
        <LanguageSwitcher />
      </div>

      <div className="landscape-body flex w-full max-w-3xl flex-col items-center gap-6">
        <div className="canvas-col w-full">
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
            editingPointId={popover?.kind === "point" ? popover.pointId : null}
            showGuides={showGuides}
            colors={colors}
            onCanvasClick={handleCanvasClick}
            onCanvasContextMenu={handleCanvasContextMenu}
            onPointMove={handlePointMove}
          />
        </div>

        <div className="controls-col flex w-full flex-col items-center gap-4">
          <div className="flex w-full flex-wrap items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <Toolbar
              mode={scene.mode}
              onModeChange={(mode) => dispatch({ type: "SET_MODE", mode })}
            />
            <div className="hidden h-8 w-px bg-white/10 sm:block" />
            <ControlsPanel
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((v) => !v)}
              onReset={() => setResetSignal((v) => v + 1)}
              onClearTrail={() => setClearTrailSignal((v) => v + 1)}
              recordInterval={recordInterval}
              onRecordIntervalChange={setRecordInterval}
              trailLifetime={trailLifetime}
              onTrailLifetimeChange={setTrailLifetime}
              showGuides={showGuides}
              onShowGuidesChange={setShowGuides}
              onRandomize={handleRandomize}
            />
          </div>

          <SettingsAccordion title={t("settings.title")}>
            <ColorSettingsPanel colors={colors} onChange={handleColorsChange} />
            <DataControls
              onExport={handleExport}
              onImportFile={handleImportFile}
              onShare={handleShare}
            />
          </SettingsAccordion>

          <Footer />
        </div>
      </div>

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
