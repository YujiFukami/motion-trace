"use client";

import { useState } from "react";
import SimulationCanvas from "./SimulationCanvas";
import ControlsPanel from "./ControlsPanel";
import PointParamsForm from "./PointParamsForm";
import { DEFAULT_CIRCLE_PARAMS } from "@/lib/motion/circleMotion";
import { DEFAULT_LINEAR_PARAMS } from "@/lib/motion/linearMotion";
import type {
  CircleMotionParams,
  LinearMotionParams,
} from "@/lib/motion/types";

export default function MotionPlayground() {
  const [pointAParams, setPointAParams] = useState<CircleMotionParams>(
    DEFAULT_CIRCLE_PARAMS,
  );
  const [pointBParams, setPointBParams] = useState<LinearMotionParams>(
    DEFAULT_LINEAR_PARAMS,
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [recordInterval, setRecordInterval] = useState(0.1);
  const [trailLifetime, setTrailLifetime] = useState(3);
  const [resetSignal, setResetSignal] = useState(0);
  const [clearTrailSignal, setClearTrailSignal] = useState(0);

  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4">
      <h1 className="text-2xl font-semibold text-zinc-50">
        軌道・残像ジェネレーター
      </h1>

      <SimulationCanvas
        pointAParams={pointAParams}
        pointBParams={pointBParams}
        isPlaying={isPlaying}
        recordInterval={recordInterval}
        trailLifetime={trailLifetime}
        resetSignal={resetSignal}
        clearTrailSignal={clearTrailSignal}
      />

      <ControlsPanel
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((v) => !v)}
        onReset={() => setResetSignal((v) => v + 1)}
        onClearTrail={() => setClearTrailSignal((v) => v + 1)}
        recordInterval={recordInterval}
        onRecordIntervalChange={setRecordInterval}
        trailLifetime={trailLifetime}
        onTrailLifetimeChange={setTrailLifetime}
      />

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <PointParamsForm
          type="circle"
          label="点A"
          radius={pointAParams.radius}
          period={pointAParams.period}
          onRadiusChange={(radius) =>
            setPointAParams((p) => ({ ...p, radius }))
          }
          onPeriodChange={(period) =>
            setPointAParams((p) => ({ ...p, period }))
          }
        />
        <PointParamsForm
          type="linear"
          label="点B"
          amplitude={pointBParams.amplitude}
          period={pointBParams.period}
          angleDeg={pointBParams.angleDeg}
          onAmplitudeChange={(amplitude) =>
            setPointBParams((p) => ({ ...p, amplitude }))
          }
          onPeriodChange={(period) =>
            setPointBParams((p) => ({ ...p, period }))
          }
          onAngleChange={(angleDeg) =>
            setPointBParams((p) => ({ ...p, angleDeg }))
          }
        />
      </div>
    </div>
  );
}
