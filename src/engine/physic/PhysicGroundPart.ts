import * as THREE from "three";
import { euler, quaternion } from "../../constants";
import { World } from "../../elements/World";
import {
  HP_BodyId,
  HP_ShapeId,
  Quaternion,
  Vector3,
} from "./havok/HavokPhysics";
import { renderGeometryToPhysicShape } from "./renderGeometryToPhysicShape";

export class PhysicGroundPart {
  world: World;
  body: HP_BodyId;
  shape: HP_ShapeId;

  constructor(world: World, position: Vector3, geometry: THREE.BufferGeometry) {
    this.world = world;

    const rotation: Quaternion = quaternion
      .setFromEuler(euler.set(-Math.PI / 2, 0, 0), true)
      .toArray() as Quaternion;

    // Physic
    this.body = this.world.physic.havok.HP_Body_Create()[1];
    this.shape = renderGeometryToPhysicShape(geometry, this.world.physic.havok);

    this.world.physic.havok.HP_Body_SetShape(this.body, this.shape);
    this.world.physic.havok.HP_Body_SetQTransform(this.body, [
      position,
      rotation,
    ]);
    this.world.physic.havok.HP_Body_SetMotionType(
      this.body,
      this.world.physic.havok.MotionType.STATIC,
    );
    // this.world.physic.havok.HP_Body_SetMassProperties(this.body, [
    //   /* center of mass */[0, 0, 0],
    //   /* Mass */ mass,
    //   /* Inertia for mass of 1*/[0.01, 0.01, 0.01],
    //   /* Inertia Orientation */[0, 0, 0, 1],
    // ]);
    this.world.physic.havok.HP_World_AddBody(
      this.world.physic.world,
      this.body,
      false,
    );
  }

  // get enabled() { return this._enabled }

  // set enabled(value: boolean) {
  //   if (value && !this._enabled) {
  //     this.create()
  //   } else if (!value && this._enabled) {
  //     this.dispose()
  //   }

  //   this._enabled = value
  // }

  dispose() {
    this.world.physic.havok.HP_Shape_Release(this.shape);
    this.world.physic.havok.HP_Body_Release(this.body);
  }
}
