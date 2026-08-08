"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";

export interface DataControlsProps {
  onExport: () => void;
  onImportFile: (file: File) => void;
  onShare: () => Promise<boolean>;
}

export default function DataControls({
  onExport,
  onImportFile,
  onShare,
}: DataControlsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useLocale();
  const [justCopied, setJustCopied] = useState(false);

  async function handleShareClick() {
    const copied = await onShare();
    if (copied) {
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-4">
      <button
        type="button"
        onClick={onExport}
        className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
      >
        {t("data.export")}
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
      >
        {t("data.import")}
      </button>
      <button
        type="button"
        onClick={handleShareClick}
        className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
      >
        {justCopied ? t("data.shareCopied") : t("data.share")}
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
