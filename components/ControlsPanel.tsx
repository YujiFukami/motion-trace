"use client";

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
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
        >
          {isPlaying ? "一時停止" : "再生"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
        >
          リセット
        </button>
        <button
          type="button"
          onClick={onClearTrail}
          className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
        >
          軌跡クリア
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        軌跡記録間隔
        <select
          value={recordInterval}
          onChange={(e) => onRecordIntervalChange(Number(e.target.value))}
          className="rounded-md border border-white/10 bg-black/40 px-2 py-1"
        >
          {RECORD_INTERVAL_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}秒
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        残像時間
        <input
          type="number"
          min={0.5}
          max={60}
          step={0.5}
          value={trailLifetime}
          onChange={(e) => onTrailLifetimeChange(Number(e.target.value))}
          className="w-20 rounded-md border border-white/10 bg-black/40 px-2 py-1"
        />
        秒
      </label>
    </div>
  );
}
