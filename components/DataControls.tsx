"use client";

import { useRef } from "react";

export interface DataControlsProps {
  onExport: () => void;
  onImportFile: (file: File) => void;
}

export default function DataControls({
  onExport,
  onImportFile,
}: DataControlsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-4">
      <button
        type="button"
        onClick={onExport}
        className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
      >
        エクスポート
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
      >
        インポート
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImportFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
