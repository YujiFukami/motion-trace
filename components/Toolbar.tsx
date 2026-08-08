"use client";

import type { ReactNode } from "react";
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
    <div className="flex flex-wrap gap-2">
      {MODES.map((m) => (
        <IconButton
          key={m}
          label={MODE_LABELS[m]}
          active={mode === m}
          onClick={() => onModeChange(m)}
        >
          <ModeIcon mode={m} />
        </IconButton>
      ))}
    </div>
  );
}

interface IconButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function IconButton({ label, active, onClick, children }: IconButtonProps) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`flex h-10 w-10 items-center justify-center rounded-md text-white ${
          active ? "bg-sky-500 hover:bg-sky-400" : "bg-white/10 hover:bg-white/20"
        }`}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-zinc-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

function ModeIcon({ mode }: { mode: Mode }) {
  switch (mode) {
    case "select":
      return (
        <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor">
          <path d="M4 2.5 L4 16.5 L7.6 13 L9.8 17.6 L11.9 16.6 L9.7 12 L14.2 11.7 Z" />
        </svg>
      );
    case "placeCircle":
      return (
        <svg
          viewBox="0 0 20 20"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <circle cx="10" cy="10" r="6.5" strokeDasharray="2.5 2.5" />
          <circle cx="10" cy="3.5" r="1.7" fill="currentColor" stroke="none" />
        </svg>
      );
    case "placeLinear":
      return (
        <svg
          viewBox="0 0 20 20"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <line x1="10" y1="2.5" x2="10" y2="17.5" strokeDasharray="2.5 2.5" />
          <path d="M6.8 5.8 L10 2.5 L13.2 5.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.8 14.2 L10 17.5 L13.2 14.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="10" r="1.7" fill="currentColor" stroke="none" />
        </svg>
      );
    case "connect":
      return (
        <svg
          viewBox="0 0 20 20"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <line x1="5" y1="15" x2="15" y2="5" />
          <circle cx="5" cy="15" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="5" r="2.2" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}
