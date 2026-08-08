import type { PlacedPoint } from "@/lib/motion/types";
import type { Connection } from "@/lib/connections/types";

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1));
}

// Keeps generated points within a modest region around the canvas center so
// their motion (radius/amplitude) mostly stays on-screen.
const CENTER_RANGE = 180;
const RADIUS_RANGE: [number, number] = [30, 140];
const AMPLITUDE_RANGE: [number, number] = [30, 140];
const PERIOD_RANGE: [number, number] = [1, 6];

export function generateRandomScene(): {
  points: PlacedPoint[];
  connections: Connection[];
} {
  const count = randomInt(2, 6);
  const points: PlacedPoint[] = [];

  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    const centerX = randomInRange(-CENTER_RANGE, CENTER_RANGE);
    const centerY = randomInRange(-CENTER_RANGE, CENTER_RANGE);
    const period = randomInRange(...PERIOD_RANGE);
    const initialPhase = randomInRange(0, 2 * Math.PI);

    if (Math.random() < 0.5) {
      points.push({
        id,
        type: "circle",
        params: {
          centerX,
          centerY,
          period,
          initialPhase,
          radius: randomInRange(...RADIUS_RANGE),
          clockwise: Math.random() < 0.5,
        },
      });
    } else {
      points.push({
        id,
        type: "linear",
        params: {
          centerX,
          centerY,
          period,
          initialPhase,
          amplitude: randomInRange(...AMPLITUDE_RANGE),
          angleDeg: randomInRange(0, 360),
        },
      });
    }
  }

  // Fully connect every point to every other point (a complete graph), per
  // the user's request that a random layout links all of them together.
  const connections: Connection[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      connections.push({
        id: crypto.randomUUID(),
        pointIdA: points[i].id,
        pointIdB: points[j].id,
      });
    }
  }

  return { points, connections };
}
