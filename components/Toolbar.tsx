"use client";

import type { Mode } from "@/lib/scene/sceneReducer";

const MODE_LABELS: Record<Mode, string> = {
  select: "選択/編集",
  placeCircle: "円運動を配置",
  placeLinear: "上下運動を配置",
  connect: "接続",
};

const MODES: Mode[] = ["select", "placeCircle", "placeLinear", "connect"];

export interface ToolbarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function Toolbar({ mode, onModeChange }: ToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-white/5 p-4">
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onModeChange(m)}
          className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
            mode === m ? "bg-sky-500 hover:bg-sky-400" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          {MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );
}
