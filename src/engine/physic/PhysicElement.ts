import * as THREE from "three";
import { vector3 } from "../../constants";
import { World } from "../../elements/World";
import {
  CapsuleSize,
  PhysicMotionType,
  ShapeType,
  SizeByShape,
} from "../../types";
import {
  HP_BodyId,
  HP_ShapeId,
  Quaternion,
  Vector3,
} from "./havok/HavokPhysics";

export class PhysicElement<
  CurrentPhysicShapeType extends ShapeType,
  CurrentSize = SizeByShape[CurrentPhysicShapeType],
> {
  body: HP_BodyId;
  shape: HP_ShapeId;
  world: World;

  constructor({
    world,
    position,
    rotation,
    size,
    shapeType,
    motionType,
    massRatio = 1,
  }: {
    world: World;
    position: Vector3;
    rotation: Quaternion;
    size: CurrentSize;
    shapeType: CurrentPhysicShapeType;
    motionType: PhysicMotionType;
    massRatio?: number;
  }) {
    this.world = world;

    this.body = world.physic.havok.HP_Body_Create()[1];

    let mass: number;
    if (shapeType === ShapeType.Box) {
      this.shape = this.world.physic.havok.HP_Shape_CreateBox(
        [0, 0, 0],
        [0, 0, 0, 1],
        size as Vector3,
      )[1];
      mass =
        massRatio * (size as Vector3).reduce((total, side) => total * side);
    } else if (shapeType === ShapeType.Sphere) {
      this.shape = this.world.physic.havok.HP_Shape_CreateSphere(
        [0, 0, 0],
        size as number,
      )[1];
      mass = (massRatio * (4 * Math.PI * (size as number) ** 3)) / 3;
    } else {
      const typedSize = size as CapsuleSize;
      const length = new THREE.Vector3(...typedSize[0]).distanceTo(
        vector3.set(...typedSize[1]),
      );
      this.shape = this.world.physic.havok.HP_Shape_CreateCapsule(
        ...typedSize,
      )[1];
      mass = massRatio * typedSize[2] * length;
    }

    this.world.physic.havok.HP_Body_SetShape(this.body, this.shape);
    this.world.physic.havok.HP_Body_SetQTransform(this.body, [
      position,
      rotation,
    ]);

    switch (motionType) {
      case PhysicMotionType.Static:
        this.world.physic.havok.HP_Body_SetMotionType(
          this.body,
          this.world.physic.havok.MotionType.STATIC,
        );
        break;
      case PhysicMotionType.Dynamic:
        this.world.physic.havok.HP_Body_SetMotionType(
          this.body,
          this.world.physic.havok.MotionType.DYNAMIC,
        );
        break;
    }
    this.world.physic.havok.HP_Body_SetMassProperties(this.body, [
      /* center of mass */ [0, 0, 0],
      /* Mass */ mass,
      /* Inertia for mass of 1*/ [0.01, 0.01, 0.01],
      /* Inertia Orientation */ [0, 0, 0, 1],
    ]);
    this.world.physic.havok.HP_World_AddBody(
      this.world.physic.world,
      this.body,
      false,
    );
  }

  getVelocity() {
    return this.world.physic.havok.HP_Body_GetLinearVelocity(this.body)[1];
  }

  setVelocity(velocity: Vector3) {
    this.world.physic.havok.HP_Body_SetLinearVelocity(this.body, velocity);
  }

  setTransform(translation: Vector3, rotation: Quaternion) {
    this.world.physic.havok.HP_Body_SetQTransform(this.body, [
      translation,
      rotation,
    ]);
  }

  // setAngle(velocity: Vector3) {
  // }

  getTransform() {
    const [position, quaternion] =
      this.world.physic.havok.HP_Body_GetQTransform(this.body)[1];
    return { position, quaternion };
  }

  dispose() {
    this.world.physic.havok.HP_Body_Release(this.body);
    this.world.physic.havok.HP_Shape_Release(this.shape);
  }
}
