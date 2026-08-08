import type { PlacedPoint } from "@/lib/motion/types";
import type { Connection } from "@/lib/connections/types";

export interface ShareableScene {
  points: PlacedPoint[];
  connections: Connection[];
}

export function encodeSceneToParam(data: ShareableScene): string {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeSceneFromParam(param: string): ShareableScene {
  const base64 = param.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  const data = JSON.parse(json);
  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.points) ||
    !Array.isArray(data.connections)
  ) {
    throw new Error("Invalid share link");
  }
  return data as ShareableScene;
}
