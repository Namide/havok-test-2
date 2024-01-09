import HavokPhysics, {
  ActivationState,
  ConstraintAxis,
  ConstraintAxisLimitMode,
  type HavokPhysicsWithBindings,
  MotionType,
} from "./havok/HavokPhysics";

// https://github.com/N8python/havokDemo
// https://github.com/BabylonJS/havok
// https://github.com/BabylonJS/Babylon.js/blob/48cf7b374a7bbee9f3bef02f2992715ed683cf98/packages/dev/core/src/Physics/v2/Plugins/havokPlugin.ts
let havok: HavokPhysicsWithBindings & {
  HEAPU8: Uint8Array;
  MotionType: {
    STATIC: MotionType.STATIC;
    DYNAMIC: MotionType.DYNAMIC;
    KINEMATIC: MotionType.KINEMATIC;
  };
  ActivationState: {
    ACTIVE: ActivationState.ACTIVE;
    INACTIVE: ActivationState.INACTIVE;
  };
  ConstraintAxisLimitMode: {
    FREE: ConstraintAxisLimitMode.FREE;
    LIMITED: ConstraintAxisLimitMode.LIMITED;
    LOCKED: ConstraintAxisLimitMode.LOCKED;
  };
  ConstraintAxis: {
    LINEAR_X: ConstraintAxis.LINEAR_X;
    LINEAR_Y: ConstraintAxis.LINEAR_Y;
    LINEAR_Z: ConstraintAxis.LINEAR_Z;
    ANGULAR_X: ConstraintAxis.ANGULAR_X;
    ANGULAR_Y: ConstraintAxis.ANGULAR_Y;
    ANGULAR_Z: ConstraintAxis.ANGULAR_Z;
    LINEAR_DISTANCE: ConstraintAxis.LINEAR_DISTANCE;
  };
};

export async function getHavok() {
  if (!havok) {
    havok = await HavokPhysics();
  }
  return havok;
}

export type Havok = Awaited<ReturnType<typeof getHavok>>
