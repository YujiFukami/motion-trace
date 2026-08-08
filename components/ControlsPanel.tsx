"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

const RECORD_INTERVAL_OPTIONS = [0.05, 0.1, 0.5];

export interface ControlsPanelProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onClearTrail: () => void;
  recordInterval: number;
  onRecordIntervalChange: (value: number) => void;
  trailLifetime: number;
  onTrailLifetimeChange: (value: number) => void;
}

export default function ControlsPanel({
  isPlaying,
  onTogglePlay,
  onReset,
  onClearTrail,
  recordInterval,
  onRecordIntervalChange,
  trailLifetime,
  onTrailLifetimeChange,
}: ControlsPanelProps) {
  const { t } = useLocale();
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
        >
          {isPlaying ? t("controls.pause") : t("controls.play")}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
        >
          {t("controls.reset")}
        </button>
        <button
          type="button"
          onClick={onClearTrail}
          className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
        >
          {t("controls.clearTrail")}
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        {t("controls.recordInterval")}
        <select
          value={recordInterval}
          onChange={(e) => onRecordIntervalChange(Number(e.target.value))}
          className="rounded-md border border-white/10 bg-black/40 px-2 py-1"
        >
          {RECORD_INTERVAL_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
              {t("controls.seconds")}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        {t("controls.trailLifetime")}
        <input
          type="number"
          min={0.5}
          max={60}
          step={0.5}
          value={trailLifetime}
          onChange={(e) => onTrailLifetimeChange(Number(e.target.value))}
          className="w-20 rounded-md border border-white/10 bg-black/40 px-2 py-1"
        />
        {t("controls.seconds")}
      </label>
    </div>
  );
}
