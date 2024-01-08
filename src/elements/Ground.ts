import * as THREE from "three";
import { getCheckerTexture } from "../render/textures";
import { World } from "../render/World";
import { GROUND_SIZE, SHADOW } from "../config";
import { HP_BodyId, Quaternion, Vector3 } from "../physic/havok/HavokPhysics";

export class Ground {
  world: World
  body: HP_BodyId
  mesh: THREE.Mesh

  constructor(world: World, texture: THREE.Texture) {

    const position: Vector3 = [0, 0, 0] as const
    const rotation: Quaternion = [0, 0, 0, 1] as const

    this.world = world

    const material = new (
      SHADOW ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial
    )({
      map: texture,
    });
    const geometry = new THREE.BoxGeometry(...GROUND_SIZE);
    this.mesh = new THREE.Mesh(geometry, material);
    if (SHADOW) {
      this.mesh.receiveShadow = true;
    }

    // Havok
    this.body = this.world.havok.HP_Body_Create()[1];
    this.world.havok.HP_Body_SetShape(
      this.body,
      this.world.havok.HP_Shape_CreateBox([0, 0, 0], rotation, GROUND_SIZE)[1],
    );
    this.world.havok.HP_Body_SetQTransform(this.body, [position, rotation]);
    this.world.havok.HP_World_AddBody(this.world.physicWorld, this.body, false);
    this.world.havok.HP_Body_SetMotionType(this.body, this.world.havok.MotionType.STATIC);
  }
}
