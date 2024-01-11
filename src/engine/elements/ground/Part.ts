import * as THREE from "three";
import { GROUND_SIZE, SHADOW } from "../../../config"
import { euler, quaternion } from "../../../constants"
import { HP_BodyId, Quaternion, Vector3 } from "../../physic/havok/HavokPhysics"
import { World } from "../World"
import { generateHeight } from "./heightMap"
import { Havok } from "../../physic/getHavok";

const PRECISION = 8

/**
 * Helper to keep a reference to plugin memory.
 * Used to avoid https://github.com/emscripten-core/emscripten/issues/7294
 * @internal
 */
interface PluginMemoryRef {
  /** The offset from the beginning of the plugin's heap */
  offset: number;
  /** The number of identically-sized objects the buffer contains */
  numObjects: number;
}


function getVertices(havok: Havok, vertices: Float32Array) {

  // @ts-ignore
  const bufferBegin = havok._malloc(vertices.byteLength * 4);
  const ret = new Float32Array(havok.HEAPU8.buffer, bufferBegin, vertices.byteLength);
  ret.set(vertices)

  return {
    offset: bufferBegin,
    numObjects: vertices.byteLength
  };
}

/**
 * Allocate and populate the triangle indices inside the physics plugin
 *
 * @returns A new Int32Array, whose backing memory is inside the plugin. The array contains the indices
 * of the triangle positions, where a single triangle is defined by three indices. You must call
 * freeBuffer() on this array once you have finished with it, to free the memory inside the plugin..
 */
function getTriangles(havok: Havok, indices: number[]): PluginMemoryRef {
  const bytesPerInt = 4;
  const nBytes = indices.length * bytesPerInt;
  // @ts-ignore
  const bufferBegin = havok._malloc(nBytes);
  const ret = new Int32Array(havok.HEAPU8.buffer, bufferBegin, indices.length);
  ret.set(new Uint8Array(indices))
  // for (let i = 0; i < indices.length; i++) {
  //   ret[i] = indices[i];
  // }
  return { offset: bufferBegin, numObjects: indices.length };
}

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

    const vertices = geometry.getAttribute('position').array
    const havokPositions = getVertices(this.world.physic.havok, vertices as Float32Array);
    const numVec3s = havokPositions.numObjects / 3;
    const havokTriangles = getTriangles(this.world.physic.havok, [...(geometry.getIndex()?.array || [])])
    const numTriangles = havokTriangles.numObjects / 3;
    const shape = this.world.physic.havok.HP_Shape_CreateMesh(havokPositions.offset, numVec3s, havokTriangles.offset, numTriangles)[1]

    // @ts-ignore
    this.world.physic.havok._free(havokTriangles)

    // @ts-ignore
    this.world.physic.havok._free(havokPositions)

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