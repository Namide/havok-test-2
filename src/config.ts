import { Vector3 } from "./engine/physic/havok/HavokPhysics";

export const SHADOW = true;
export const SOFT_SHADOW = false;

export const DRAG_DISTANCE = 0.5;
export const ORBIT_CONTROL = false;
export const CAMERA_FOLLOW = true;
export const CAMERA_POSITION: Vector3 = [0, 6, 3] as const;

export const GROUND_SIZE: Vector3 = [10, 30, 10] as const;
export const DEBUG = true;
