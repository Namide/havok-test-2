import { World } from "../render/World";
import { HP_BodyId, Quaternion, Vector3 } from "./havok/HavokPhysics";

export class CollisionBox {

  body: HP_BodyId
  world: World

  constructor({ world, position, rotation, size }: {
    world: World,
    position: Vector3;
    rotation?: Quaternion;
    size?: Vector3;
  }) {
    this.world = world
    this.body = world.havok.HP_Body_Create()[1];

    this.world.havok.HP_Body_SetShape(
      this.body,
      this.world.havok.HP_Shape_CreateBox([0, 0, 0], [0, 0, 0, 1], size || [1, 1, 1])[1],
    );
    this.world.havok.HP_Body_SetQTransform(this.body, [position, rotation || [0, 0, 0, 1]]);
    this.world.havok.HP_Body_SetMassProperties(this.body, [
      /* center of mass */[0, 0, 0],
      /* Mass */ 1,
      /* Inertia for mass of 1*/[0.1, 0.1, 0.1],
      /* Inertia Orientation */[0, 0, 0, 1],
    ]);
    this.world.havok.HP_World_AddBody(this.world.physicWorld, this.body, false);
    this.world.havok.HP_Body_SetMotionType(this.body, this.world.havok.MotionType.DYNAMIC);
  }

  getTransform() {
    const [position, quaternion] = this.world.havok.HP_Body_GetQTransform(this.body)[1];
    return { position, quaternion };
  }
}
