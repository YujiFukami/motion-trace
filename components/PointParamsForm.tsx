"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";

interface CircleFormProps {
  type: "circle";
  radius: number;
  period: number;
  initialPhase: number;
  clockwise: boolean;
  onRadiusChange: (value: number) => void;
  onPeriodChange: (value: number) => void;
  onInitialPhaseChange: (value: number) => void;
  onClockwiseChange: (value: boolean) => void;
}

interface LinearFormProps {
  type: "linear";
  amplitude: number;
  period: number;
  initialPhase: number;
  angleDeg: number;
  onAmplitudeChange: (value: number) => void;
  onPeriodChange: (value: number) => void;
  onInitialPhaseChange: (value: number) => void;
  onAngleChange: (value: number) => void;
}

export type PointParamsFormProps = CircleFormProps | LinearFormProps;

export default function PointParamsForm(props: PointParamsFormProps) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-zinc-200">
        {t("pointForm.editTitle")}（
        {props.type === "circle"
          ? t("pointForm.circleLabel")
          : t("pointForm.linearLabel")}
        ）
      </h3>

      {props.type === "circle" ? (
        <>
          <NumberField
            label={t("pointForm.radius")}
            value={props.radius}
            min={10}
            max={250}
            step={5}
            onChange={props.onRadiusChange}
          />
          <NumberField
            label={t("pointForm.period")}
            value={props.period}
            min={0.5}
            max={20}
            step={0.5}
            onChange={props.onPeriodChange}
          />
          <NumberField
            label={t("pointForm.phase")}
            value={props.initialPhase}
            min={0}
            max={1}
            step={0.05}
            onChange={props.onInitialPhaseChange}
          />
          <DirectionToggle
            clockwise={props.clockwise}
            onChange={props.onClockwiseChange}
          />
        </>
      ) : (
        <>
          <NumberField
            label={t("pointForm.amplitude")}
            value={props.amplitude}
            min={10}
            max={250}
            step={5}
            onChange={props.onAmplitudeChange}
          />
          <NumberField
            label={t("pointForm.period")}
            value={props.period}
            min={0.5}
            max={20}
            step={0.5}
            onChange={props.onPeriodChange}
          />
          <NumberField
            label={t("pointForm.angle")}
            value={props.angleDeg}
            min={0}
            max={360}
            step={5}
            onChange={props.onAngleChange}
          />
          <NumberField
            label={t("pointForm.phase")}
            value={props.initialPhase}
            min={0}
            max={1}
            step={0.05}
            onChange={props.onInitialPhaseChange}
          />
        </>
      )}
    </div>
  );
}

interface DirectionToggleProps {
  clockwise: boolean;
  onChange: (value: boolean) => void;
}

function DirectionToggle({ clockwise, onChange }: DirectionToggleProps) {
  const { t } = useLocale();
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-zinc-300">
      <span className="w-28 shrink-0">{t("pointForm.direction")}</span>
      <div className="flex flex-1 gap-2">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium ${
            !clockwise ? "bg-sky-500 text-white" : "bg-white/10 text-zinc-300 hover:bg-white/20"
          }`}
        >
          {t("pointForm.ccw")}
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium ${
            clockwise ? "bg-sky-500 text-white" : "bg-white/10 text-zinc-300 hover:bg-white/20"
          }`}
        >
          {t("pointForm.cw")}
        </button>
      </div>
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function NumberField({ label, value, min, max, step, onChange }: NumberFieldProps) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm text-zinc-300">
      <span className="w-28 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
      <span className="w-12 shrink-0 text-right tabular-nums">{value}</span>
    </label>
  );
}
