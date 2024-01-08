import { World } from "../render/World";
import { HP_BodyId, Vector3 } from "./havok/HavokPhysics";

export class CollisionSphere {

  world: World
  body: HP_BodyId

  constructor({ world, position, size }: {
    world: World,
    position: Vector3;
    size?: number;
  }) {
    this.world = world
    this.body = this.world.havok.HP_Body_Create()[1];

    this.world.havok.HP_Body_SetShape(this.body, this.world.havok.HP_Shape_CreateSphere([0, 0, 0], size ?? 1)[1]);
    this.world.havok.HP_Body_SetQTransform(this.body, [position, [0, 0, 0, 1]]);
    this.world.havok.HP_Body_SetMassProperties(this.body, [
      /* center of mass */[0, 0, 0],
      /* Mass */ 1,
      /* Inertia for mass of 1*/[0.001, 0.001, 0.001],
      /* Inertia Orientation */[0, 0, 0, 1],
    ]);
    this.world.havok.HP_World_AddBody(this.world.physicWorld, this.body, false);
    this.world.havok.HP_Body_SetMotionType(this.body, this.world.havok.MotionType.DYNAMIC);

  }

  getTransform() {
    const [position, quaternion] = this.world.havok.HP_Body_GetQTransform(this.body)[1];
    return { position, quaternion };
  };
};
