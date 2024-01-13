import * as THREE from "three";
import { vector3 } from "../../constants";

const raycaster = new THREE.Raycaster();

export function getBottomIntersect(position: THREE.Vector3, meshes: THREE.Object3D[], direction = vector3.set(0, -1, 0)) {
  raycaster.set(position, direction)
  const [gr] = raycaster.intersectObjects(meshes)
  return gr?.point
}