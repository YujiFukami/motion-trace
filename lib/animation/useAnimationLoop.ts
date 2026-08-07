import { useEffect, useRef } from "react";

export interface AnimationLoopHandle {
  simTimeRef: React.MutableRefObject<number>;
  timeMultiplierRef: React.MutableRefObject<number>;
}

export function useAnimationLoop(
  isPlaying: boolean,
  onTick: (simTime: number, dt: number) => void,
): AnimationLoopHandle {
  const simTimeRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const timeMultiplierRef = useRef(1); // not exposed in v0.1 UI; hook for a future time-multiplier
  const onTickRef = useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  });

  useEffect(() => {
    if (!isPlaying) {
      lastTsRef.current = null;
      return;
    }

    let raf: number;
    const loop = (ts: number) => {
      if (lastTsRef.current === null) {
        lastTsRef.current = ts;
      }
      const dt = ((ts - lastTsRef.current) / 1000) * timeMultiplierRef.current;
      lastTsRef.current = ts;
      simTimeRef.current += dt;
      onTickRef.current(simTimeRef.current, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  return { simTimeRef, timeMultiplierRef };
}
