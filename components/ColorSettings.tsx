"use client";

import type { ColorSettings } from "@/lib/render/colors";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { TranslationKey } from "@/lib/i18n/translations";

export interface ColorSettingsPanelProps {
  colors: ColorSettings;
  onChange: (colors: Partial<ColorSettings>) => void;
}

const FIELDS: { key: keyof ColorSettings; labelKey: TranslationKey }[] = [
  { key: "background", labelKey: "colors.background" },
  { key: "point", labelKey: "colors.point" },
  { key: "line", labelKey: "colors.line" },
  { key: "trail", labelKey: "colors.trail" },
];

export default function ColorSettingsPanel({
  colors,
  onChange,
}: ColorSettingsPanelProps) {
  const { t } = useLocale();
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
      {FIELDS.map(({ key, labelKey }) => (
        <label
          key={key}
          className="flex items-center gap-2 text-sm text-zinc-300"
        >
          {t(labelKey)}
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
