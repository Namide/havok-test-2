import { Vector3 } from "./engine/physic/havok/HavokPhysics"

export const enum PhysicMotionType {
  Static = 1,
  Dynamic = 2
}

export const enum ShapeType {
  Box = 1,
  Sphere = 2,
  Capsule = 3
}

export type SizeByShape = {
  [ShapeType.Box]: Vector3,
  [ShapeType.Sphere]: number,
  [ShapeType.Capsule]: [Vector3, Vector3, number],
}

export type CapsuleSize = [
  Vector3,
  Vector3,
  number
]