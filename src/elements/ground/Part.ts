import * as THREE from "three";
import { GROUND_SIZE, SHADOW } from "../../config"
import { euler, quaternion } from "../../constants"
import { HP_BodyId, Quaternion, Vector3 } from "../../engine/physic/havok/HavokPhysics"
import { World } from "../World"
import { generateHeight } from "./heightMap"
import { renderGeometryToPhysicShape } from "../../engine/physic/renderGeometryToPhysicShape";

const PRECISION = 8

export class Part {
  world: World
  mesh: THREE.Mesh
  body: HP_BodyId

  x: number
  y: number

  constructor(world: World, x: number, y: number, material: THREE.Material) {
    this.world = world
    this.x = x
    this.y = y

    const rotation: Quaternion = quaternion
      .setFromEuler(
        euler.set(-Math.PI / 2, 0, 0),
        true,
      )
      .toArray() as Quaternion;
    const [width, depth, height] = GROUND_SIZE
    const position: Vector3 = [x, -depth / 4, y] as const


    // Perlin noise
    const geometry = new THREE.PlaneGeometry(width, height, PRECISION, PRECISION);
    generateHeight({
      width: PRECISION + 1,
      height: PRECISION + 1,
      depth,
      data: geometry.getAttribute('position').array as Float32Array,
      x,
      y,
    })


    // Render
    this.mesh = new THREE.Mesh(geometry, material);


    // Shadow
    if (SHADOW) {
      this.mesh.receiveShadow = true;
      this.mesh.castShadow = true;
    }

    if (SHADOW) {
      this.mesh.castShadow = false;
    }


    // Physic
    this.body = this.world.physic.havok.HP_Body_Create()[1];

    const shape = renderGeometryToPhysicShape(geometry, this.world.physic.havok)

    this.world.physic.havok.HP_Body_SetShape(this.body, shape);
    this.world.physic.havok.HP_Body_SetQTransform(this.body, [position, rotation]);
    this.world.physic.havok.HP_Body_SetMotionType(this.body, this.world.physic.havok.MotionType.STATIC);
    // this.world.physic.havok.HP_Body_SetMassProperties(this.body, [
    //   /* center of mass */[0, 0, 0],
    //   /* Mass */ mass,
    //   /* Inertia for mass of 1*/[0.01, 0.01, 0.01],
    //   /* Inertia Orientation */[0, 0, 0, 1],
    // ]);
    this.world.physic.havok.HP_World_AddBody(this.world.physic.world, this.body, false);


    // Update
    const transform = this.world.physic.havok.HP_Body_GetQTransform(this.body)[1];
    this.mesh.position.set(...transform[0]);
    this.mesh.quaternion.set(...transform[1]);
  }

  dispose() {
    this.mesh.geometry.dispose()
    this.mesh.parent?.remove(this.mesh)
    this.world.physic.havok.HP_Body_Release(this.body);
  }
}