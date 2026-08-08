import type { PlacedPoint } from "@/lib/motion/types";
import type { Connection } from "@/lib/connections/types";
import type { ColorSettings } from "@/lib/render/colors";

export interface SceneFile {
  version: 1;
  points: PlacedPoint[];
  connections: Connection[];
  recordInterval: number;
  trailLifetime: number;
  colors: ColorSettings;
}

export function serializeScene(data: SceneFile): string {
  return JSON.stringify(data, null, 2);
}

export function parseSceneFile(text: string): SceneFile {
  const data = JSON.parse(text);
  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.points) ||
    !Array.isArray(data.connections)
  ) {
    throw new Error("不正なファイル形式です");
  }
  return data as SceneFile;
}

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType = "application/json",
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
