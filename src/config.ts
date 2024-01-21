import { Vector3 } from "./engine/physic/havok/HavokPhysics";

export const SHADOW = true;
export const SOFT_SHADOW = false;

export const DRAG_DISTANCE = 0.5;
export const ORBIT_CONTROL = false;
export const CAMERA_FOLLOW = true;
export const CAMERA_POSITION: Vector3 = [0, 3, 1.5] as const;

export const GROUND_SIZE: Vector3 = [16, 30, 16] as const;
export const DEBUG = false;

export const GROUND_ROCKS_MIN_COUNT = 10;
export const GROUND_ROCKS_MAX_COUNT = 20;
