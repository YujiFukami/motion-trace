"use client";

import { useEffect, useRef } from "react";
import PointParamsForm from "./PointParamsForm";
import type {
  CircleMotionParams,
  LinearMotionParams,
  PlacedPoint,
} from "@/lib/motion/types";
import { useLocale } from "@/lib/i18n/LocaleContext";

function radiansToCycleFraction(radians: number): number {
  return Math.round(((radians / (2 * Math.PI)) % 1) * 100) / 100;
}

export interface PointEditPopoverProps {
  point: PlacedPoint;
  onChange: (
    params: Partial<CircleMotionParams> | Partial<LinearMotionParams>,
  ) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function PointEditPopover({
  point,
  onChange,
  onDelete,
  onClose,
}: PointEditPopoverProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { t } = useLocale();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div ref={ref} className="flex w-64 flex-col gap-2 drop-shadow-xl">
        {point.type === "circle" ? (
          <PointParamsForm
            type="circle"
            period={point.params.period}
            initialPhase={radiansToCycleFraction(point.params.initialPhase)}
            clockwise={point.params.clockwise}
            onPeriodChange={(period) => onChange({ period })}
            onInitialPhaseChange={(frac) =>
              onChange({ initialPhase: frac * 2 * Math.PI })
            }
            onClockwiseChange={(clockwise) => onChange({ clockwise })}
          />
        ) : (
          <PointParamsForm
            type="linear"
            period={point.params.period}
            initialPhase={radiansToCycleFraction(point.params.initialPhase)}
            onPeriodChange={(period) => onChange({ period })}
            onInitialPhaseChange={(frac) =>
              onChange({ initialPhase: frac * 2 * Math.PI })
            }
          />
        )}
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md bg-red-500/80 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
        >
          {t("pointForm.delete")}
        </button>
      </div>
    </div>
  );
}
