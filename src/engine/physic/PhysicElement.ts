import { World } from "../elements/World";
import { PhysicMotionType, PhysicShapeType } from "./PhysicTypes";
import { HP_BodyId, HP_ShapeId, Quaternion, Vector3 } from "./havok/HavokPhysics";

export type SizeByShape = {
  [PhysicShapeType.Box]: Vector3,
  [PhysicShapeType.Sphere]: number,
}

export class PhysicElement<CurrentPhysicShapeType extends PhysicShapeType, CurrentSize = SizeByShape[CurrentPhysicShapeType]> {

  body: HP_BodyId
  world: World

  constructor({
    world,
    position,
    rotation,
    size,
    shapeType,
    motionType
  }: {
    world: World,
    position: Vector3;
    rotation: Quaternion;
    size: CurrentSize;
    shapeType: CurrentPhysicShapeType
    motionType: PhysicMotionType;
  }) {
    this.world = world

    this.body = world.havok.HP_Body_Create()[1];

    let shape: HP_ShapeId
    let mass: number
    if (shapeType === PhysicShapeType.Box) {
      shape = this.world.havok.HP_Shape_CreateBox([0, 0, 0], [0, 0, 0, 1], size as Vector3)[1]
      mass = (size as Vector3).reduce((total, side) => total * side)
    } else {
      shape = this.world.havok.HP_Shape_CreateSphere([0, 0, 0], size as number)[1]
      mass = (4 * Math.PI * (size as number) ** 3) / 3
    }

    this.world.havok.HP_Body_SetShape(this.body, shape);
    this.world.havok.HP_Body_SetQTransform(this.body, [position, rotation]);

    switch (motionType) {
      case PhysicMotionType.Static:
        this.world.havok.HP_Body_SetMotionType(this.body, this.world.havok.MotionType.STATIC);
        break
      case PhysicMotionType.Dynamic:
        this.world.havok.HP_Body_SetMotionType(this.body, this.world.havok.MotionType.DYNAMIC);
        break
    }
    this.world.havok.HP_Body_SetMassProperties(this.body, [
      /* center of mass */[0, 0, 0],
      /* Mass */ mass,
      /* Inertia for mass of 1*/[0.01, 0.01, 0.01],
      /* Inertia Orientation */[0, 0, 0, 1],
    ]);
    this.world.havok.HP_World_AddBody(this.world.physic, this.body, false);
  }

  getTransform() {
    const [position, quaternion] = this.world.havok.HP_Body_GetQTransform(this.body)[1];
    return { position, quaternion };
  }
}
