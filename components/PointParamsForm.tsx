"use client";

interface CircleFormProps {
  type: "circle";
  label: string;
  radius: number;
  period: number;
  clockwise: boolean;
  onRadiusChange: (value: number) => void;
  onPeriodChange: (value: number) => void;
  onClockwiseChange: (value: boolean) => void;
}

interface LinearFormProps {
  type: "linear";
  label: string;
  amplitude: number;
  period: number;
  angleDeg: number;
  onAmplitudeChange: (value: number) => void;
  onPeriodChange: (value: number) => void;
  onAngleChange: (value: number) => void;
}

export type PointParamsFormProps = CircleFormProps | LinearFormProps;

export default function PointParamsForm(props: PointParamsFormProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-zinc-200">
        {props.label}（{props.type === "circle" ? "円運動" : "直線往復運動"}）
      </h3>

      {props.type === "circle" ? (
        <>
          <NumberField
            label="半径"
            value={props.radius}
            min={10}
            max={250}
            step={5}
            onChange={props.onRadiusChange}
          />
          <NumberField
            label="周期（秒）"
            value={props.period}
            min={0.5}
            max={20}
            step={0.5}
            onChange={props.onPeriodChange}
          />
          <DirectionToggle
            clockwise={props.clockwise}
            onChange={props.onClockwiseChange}
          />
        </>
      ) : (
        <>
          <NumberField
            label="振幅"
            value={props.amplitude}
            min={10}
            max={250}
            step={5}
            onChange={props.onAmplitudeChange}
          />
          <NumberField
            label="周期（秒）"
            value={props.period}
            min={0.5}
            max={20}
            step={0.5}
            onChange={props.onPeriodChange}
          />
          <NumberField
            label="方向角度（度）"
            value={props.angleDeg}
            min={0}
            max={360}
            step={5}
            onChange={props.onAngleChange}
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
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-zinc-300">
      <span className="w-28 shrink-0">回転方向</span>
      <div className="flex flex-1 gap-2">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium ${
            !clockwise ? "bg-sky-500 text-white" : "bg-white/10 text-zinc-300 hover:bg-white/20"
          }`}
        >
          反時計回り
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium ${
            clockwise ? "bg-sky-500 text-white" : "bg-white/10 text-zinc-300 hover:bg-white/20"
          }`}
        >
          時計回り
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
