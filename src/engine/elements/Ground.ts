import * as THREE from "three";
import { World } from "./World";
import { GROUND_SIZE, SHADOW } from "../../config";
import { HP_BodyId, Quaternion, Vector3 } from "../physic/havok/HavokPhysics";

const PRECISION = 10

export class Ground {
  mesh: THREE.Mesh
  body: HP_BodyId

  constructor(world: World, texture: THREE.Texture) {

    const position: Vector3 = [0, 0, 0] as const
    const rotation: Quaternion = [0, 0, 0, 1] as const
    const size: Vector3 = GROUND_SIZE

    // Render

    const material = new (
      SHADOW ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial
    )({
      map: texture,
    });

    const geometry = new THREE.BoxGeometry(...size as Vector3);

    this.mesh = new THREE.Mesh(geometry, material);

    if (SHADOW) {
      this.mesh.receiveShadow = true;
      this.mesh.castShadow = true;
    }

    if (SHADOW) {
      this.mesh.castShadow = false;
    }

    // this.physic = new PhysicElement({
    //   world,
    //   position,
    //   size,
    //   rotation,
    //   shapeType: PhysicShapeType.Box,
    //   motionType: PhysicMotionType.Static
    // })


    // Physic

    this.body = world.havok.HP_Body_Create()[1];

    const shape = world.havok.HP_Shape_CreateBox([0, 0, 0], [0, 0, 0, 1], size as Vector3)[1]

    world.havok.HP_Body_SetShape(this.body, shape);
    world.havok.HP_Body_SetQTransform(this.body, [position, rotation]);
    world.havok.HP_Body_SetMotionType(this.body, world.havok.MotionType.STATIC);
    // world.havok.HP_Body_SetMassProperties(this.body, [
    //   /* center of mass */[0, 0, 0],
    //   /* Mass */ mass,
    //   /* Inertia for mass of 1*/[0.01, 0.01, 0.01],
    //   /* Inertia Orientation */[0, 0, 0, 1],
    // ]);
    world.havok.HP_World_AddBody(world.physic, this.body, false);


    // Update

    const transform = world.havok.HP_Body_GetQTransform(this.body)[1];
    this.mesh.position.set(...transform[0]);
    this.mesh.quaternion.set(...transform[1]);
  }
}
