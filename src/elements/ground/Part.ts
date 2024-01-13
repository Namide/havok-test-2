import * as THREE from "three";
import { GROUND_SIZE, SHADOW } from "../../config"
import { euler, quaternion } from "../../constants"
import { HP_BodyId, Quaternion, Vector3 } from "../../engine/physic/havok/HavokPhysics"
import { World } from "../World"
import { generateHeight } from "./heightMap"
import { renderGeometryToPhysicShape } from "../../engine/physic/renderGeometryToPhysicShape";
import { Rock } from "./Rock";
import { getBottomIntersect } from "../../engine/render/getIntersect";

const PRECISION = 8

export class Part {
  world: World
  object3d: THREE.Group
  body: HP_BodyId

  x: number
  y: number

  constructor(world: World, x: number, y: number, material: THREE.Material) {
    this.object3d = new THREE.Group()
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
    const mesh = new THREE.Mesh(geometry, material)
    this.object3d.add(mesh);


    // Rocks
    const rocksCount = Math.round(Math.random() * 10) + 10
    for (let i = 0; i < rocksCount; i++) {
      const x = (Math.random() - 0.5) * width
      const y = (Math.random() - 0.5) * height
      this.addRock(x, y, depth, mesh, position)
    }


    // Shadow
    if (SHADOW) {
      mesh.receiveShadow = true;
      mesh.castShadow = true;
    }

    if (SHADOW) {
      mesh.castShadow = false;
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
    mesh.position.set(...transform[0]);
    mesh.quaternion.set(...transform[1]);
  }

  addRock(x: number, y: number, depthMax: number, mesh: THREE.Mesh, globalPosition: Vector3) {
    const flyPosition = new THREE.Vector3(
      x,
      y,
      depthMax + 0.1
    )
    const position = getBottomIntersect(
      flyPosition,
      [mesh],
      new THREE.Vector3(0, 0, -1)
    )

    const rock = new Rock({ world: this.world, position: [globalPosition[0] + position.x, globalPosition[1] + position.z, globalPosition[2] - position.y] })
    this.object3d.add(rock.mesh)

  }

  dispose() {
    this.object3d.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (mesh.isMesh && mesh.geometry) {
        mesh.geometry.dispose()
        console.log('dispose')
      }
    })
    this.object3d.parent?.remove(this.object3d)
    this.world.physic.havok.HP_Body_Release(this.body);
  }
}