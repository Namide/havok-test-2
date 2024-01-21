import { Havok } from "./getHavok";

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
  const ret = new Float32Array(
    havok.HEAPU8.buffer,
    bufferBegin,
    vertices.byteLength,
  );
  ret.set(vertices);

  return {
    offset: bufferBegin,
    numObjects: vertices.byteLength,
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
  ret.set(new Uint8Array(indices));
  // for (let i = 0; i < indices.length; i++) {
  //   ret[i] = indices[i];
  // }
  return { offset: bufferBegin, numObjects: indices.length };
}

export function renderGeometryToPhysicShape(
  geometry: THREE.BufferGeometry,
  havok: Havok,
) {
  const vertices = geometry.getAttribute("position").array;
  const havokPositions = getVertices(havok, vertices as Float32Array);
  const numVec3s = havokPositions.numObjects / 3;
  const havokTriangles = getTriangles(havok, [
    ...(geometry.getIndex()?.array || []),
  ]);
  const numTriangles = havokTriangles.numObjects / 3;
  const shape = havok.HP_Shape_CreateMesh(
    havokPositions.offset,
    numVec3s,
    havokTriangles.offset,
    numTriangles,
  )[1];

  // @ts-ignore
  havok._free(havokTriangles);

  // @ts-ignore
  havok._free(havokPositions);

  return shape;
}
