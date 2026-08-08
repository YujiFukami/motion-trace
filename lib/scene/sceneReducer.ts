import { DEFAULT_CIRCLE_PARAMS } from "@/lib/motion/circleMotion";
import { DEFAULT_LINEAR_PARAMS } from "@/lib/motion/linearMotion";
import type {
  CircleMotionParams,
  LinearMotionParams,
  PlacedPoint,
  Point2D,
} from "@/lib/motion/types";
import type { Connection } from "@/lib/connections/types";

export type Mode = "select" | "placeCircle" | "placeLinear" | "connect";

export interface SceneState {
  points: PlacedPoint[];
  connections: Connection[];
  mode: Mode;
  connectStartId: string | null;
}

export type SceneAction =
  | { type: "SET_MODE"; mode: Mode }
  | { type: "PLACE_POINT"; pointType: "circle" | "linear"; pos: Point2D }
  | {
      type: "UPDATE_POINT_PARAMS";
      id: string;
      params: Partial<CircleMotionParams> | Partial<LinearMotionParams>;
    }
  | { type: "DELETE_POINT"; id: string }
  | { type: "CONNECT_CLICK"; pointId: string }
  | { type: "CANCEL_PENDING_CONNECT" }
  | { type: "DELETE_CONNECTION"; id: string }
  | { type: "LOAD_SCENE"; points: PlacedPoint[]; connections: Connection[] };

export const initialSceneState: SceneState = {
  points: [
    { id: "a", type: "circle", params: DEFAULT_CIRCLE_PARAMS },
    { id: "b", type: "linear", params: DEFAULT_LINEAR_PARAMS },
  ],
  connections: [{ id: "a-b", pointIdA: "a", pointIdB: "b" }],
  mode: "select",
  connectStartId: null,
};

function hasConnection(
  connections: Connection[],
  a: string,
  b: string,
): boolean {
  return connections.some(
    (c) =>
      (c.pointIdA === a && c.pointIdB === b) ||
      (c.pointIdA === b && c.pointIdB === a),
  );
}

export function sceneReducer(
  state: SceneState,
  action: SceneAction,
): SceneState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode, connectStartId: null };

    case "PLACE_POINT": {
      const id = crypto.randomUUID();
      const point: PlacedPoint =
        action.pointType === "circle"
          ? {
              id,
              type: "circle",
              params: {
                ...DEFAULT_CIRCLE_PARAMS,
                centerX: action.pos.x,
                centerY: action.pos.y,
              },
            }
          : {
              id,
              type: "linear",
              params: {
                ...DEFAULT_LINEAR_PARAMS,
                centerX: action.pos.x,
                centerY: action.pos.y,
              },
            };
      return { ...state, points: [...state.points, point] };
    }

    case "UPDATE_POINT_PARAMS":
      return {
        ...state,
        points: state.points.map((p) =>
          p.id === action.id
            ? ({ ...p, params: { ...p.params, ...action.params } } as PlacedPoint)
            : p,
        ),
      };

    case "DELETE_POINT":
      return {
        ...state,
        points: state.points.filter((p) => p.id !== action.id),
        connections: state.connections.filter(
          (c) => c.pointIdA !== action.id && c.pointIdB !== action.id,
        ),
        connectStartId:
          state.connectStartId === action.id ? null : state.connectStartId,
      };

    case "CONNECT_CLICK": {
      if (state.connectStartId === null) {
        return { ...state, connectStartId: action.pointId };
      }
      if (state.connectStartId === action.pointId) {
        return { ...state, connectStartId: null };
      }
      const a = state.connectStartId;
      const b = action.pointId;
      const alreadyConnected = hasConnection(state.connections, a, b);
      return {
        ...state,
        connections: alreadyConnected
          ? state.connections
          : [
              ...state.connections,
              { id: crypto.randomUUID(), pointIdA: a, pointIdB: b },
            ],
        // The just-connected endpoint becomes the new pending start, so
        // clicking point3 right after point1->point2 chains point2->point3
        // without needing to re-click point2 first.
        connectStartId: b,
      };
    }

    case "CANCEL_PENDING_CONNECT":
      return { ...state, connectStartId: null };

    case "DELETE_CONNECTION":
      return {
        ...state,
        connections: state.connections.filter((c) => c.id !== action.id),
      };

    case "LOAD_SCENE":
      return {
        points: action.points,
        connections: action.connections,
        mode: "select",
        connectStartId: null,
      };

    default:
      return state;
  }
}
