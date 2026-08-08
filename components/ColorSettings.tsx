"use client";

import type { ColorSettings } from "@/lib/render/colors";

export interface ColorSettingsPanelProps {
  colors: ColorSettings;
  onChange: (colors: Partial<ColorSettings>) => void;
}

const FIELDS: { key: keyof ColorSettings; label: string }[] = [
  { key: "background", label: "背景" },
  { key: "point", label: "点" },
  { key: "line", label: "線" },
  { key: "trail", label: "軌跡" },
];

export default function ColorSettingsPanel({
  colors,
  onChange,
}: ColorSettingsPanelProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
      {FIELDS.map(({ key, label }) => (
        <label
          key={key}
          className="flex items-center gap-2 text-sm text-zinc-300"
        >
          {label}
          <input
            type="color"
            value={colors[key]}
            onChange={(e) => onChange({ [key]: e.target.value })}
            className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0"
          />
        </label>
      ))}
    </div>
  );
}
