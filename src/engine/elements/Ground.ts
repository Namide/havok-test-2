import * as THREE from "three";
import { World } from "./World";
import { GROUND_SIZE, SHADOW } from "../../config";
import { HP_BodyId, Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { euler, quaternion } from "../../constants";
import { Havok } from "../physic/getHavok";
import { generateHeight } from "./GroundMountain";

const PRECISION = 8

// https://github.com/BabylonJS/Babylon.js/blob/48cf7b374a7bbee9f3bef02f2992715ed683cf98/packages/dev/core/src/Physics/v2/Plugins/havokPlugin.ts

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

export class Ground {
  mesh: THREE.Mesh
  body: HP_BodyId

  constructor(world: World, texture: THREE.Texture) {

    const rotation: Quaternion = quaternion
      .setFromEuler(
        euler.set(-Math.PI / 2, 0, 0),
        true,
      )
      .toArray() as Quaternion;
    const [width, depth, height] = GROUND_SIZE
    const position: Vector3 = [0, -depth / 4, 0] as const


    // Render

    const material = new (
      SHADOW ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial
    )({
      map: texture,
    });

    const geometry = new THREE.PlaneGeometry(width, height, PRECISION, PRECISION);

    this.mesh = new THREE.Mesh(geometry, material);

    if (SHADOW) {
      this.mesh.receiveShadow = true;
      this.mesh.castShadow = true;
    }

    if (SHADOW) {
      this.mesh.castShadow = false;
    }




    // Perlin noise
    generateHeight(PRECISION + 1, PRECISION + 1, depth, this.mesh.geometry.getAttribute('position').array as Float32Array)
    // console.log(this.mesh.geometry.getAttribute('position').array)





    // this.physic = new PhysicElement({
    //   world,
    //   position,
    //   size,
    //   rotation,
    //   shapeType: ShapeType.Box,
    //   motionType: PhysicMotionType.Static
    // })


    // Physic

    this.body = world.havok.HP_Body_Create()[1];

    /** Creates a geometry representing a height map.
     * `heights` should be a buffer of floats, of size (numXSamples * numZSamples), describing heights at (x,z) of
     * [(0,0), (1,0), ... (numXSamples-1, 0), (0, 1), (1, 1) ... (numXSamples-1, 1) ... (numXSamples-1, numZSamples-)]
     * `scale` is a vector, whose X and Z components convert from integer space to shape space, while the Y coordinate supplies a scaling factor for the height. */
    // const shape = world.havok.HP_Shape_CreateHeightField(PRECISION, PRECISION, size, new Float32Array([0, 0, 0, 0]))

    // Creates a geometry representing the surface of a mesh. Note, like CreateConvexHull, vertices should be a buffer of Vector, allocated using _malloc. Similarly, triangles should be triples of 32-bit integers which index into vertices.

    // // Fix strange physic engine decal
    // const geom = geometry.clone()
    // matrix4.identity()
    // geometry.getAttribute('position').applyMatrix4(matrix4.makeTranslation(width, height, 0))

    const vertices = geometry.getAttribute('position').array
    const havokPositions = getVertices(world.havok, vertices as Float32Array);
    const numVec3s = havokPositions.numObjects / 3;
    const havokTriangles = getTriangles(world.havok, [...(geometry.getIndex()?.array || [])])
    const numTriangles = havokTriangles.numObjects / 3;
    const shape = world.havok.HP_Shape_CreateMesh(havokPositions.offset, numVec3s, havokTriangles.offset, numTriangles)[1]

    // @ts-ignore
    world.havok._free(havokTriangles)

    // @ts-ignore
    world.havok._free(havokPositions)


    // const shape = world.havok.HP_Shape_CreateBox([0, 0, 0], [0, 0, 0, 1], [width, height, 0])[1]

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
