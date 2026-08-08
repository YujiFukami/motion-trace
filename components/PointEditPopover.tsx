"use client";

import { useEffect, useRef, useState } from "react";
import PointParamsForm from "./PointParamsForm";
import type {
  CircleMotionParams,
  LinearMotionParams,
  PlacedPoint,
} from "@/lib/motion/types";

export interface PointEditPopoverProps {
  point: PlacedPoint;
  x: number;
  y: number;
  onChange: (
    params: Partial<CircleMotionParams> | Partial<LinearMotionParams>,
  ) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function PointEditPopover({
  point,
  x,
  y,
  onChange,
  onDelete,
  onClose,
}: PointEditPopoverProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const left = Math.min(x, window.innerWidth - rect.width - margin);
    const top = Math.min(y, window.innerHeight - rect.height - margin);
    setPos({ left: Math.max(margin, left), top: Math.max(margin, top) });
  }, [x, y]);

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ position: "fixed", left: pos.left, top: pos.top }}
      className="z-50 flex w-64 flex-col gap-2 drop-shadow-xl"
    >
      {point.type === "circle" ? (
        <PointParamsForm
          type="circle"
          label="点を編集"
          radius={point.params.radius}
          period={point.params.period}
          onRadiusChange={(radius) => onChange({ radius })}
          onPeriodChange={(period) => onChange({ period })}
        />
      ) : (
        <PointParamsForm
          type="linear"
          label="点を編集"
          amplitude={point.params.amplitude}
          period={point.params.period}
          angleDeg={point.params.angleDeg}
          onAmplitudeChange={(amplitude) => onChange({ amplitude })}
          onPeriodChange={(period) => onChange({ period })}
          onAngleChange={(angleDeg) => onChange({ angleDeg })}
        />
      )}
      <button
        type="button"
        onClick={onDelete}
        className="rounded-md bg-red-500/80 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
      >
        削除
      </button>
    </div>
  );
}
