import * as THREE from "three";
import { SHADOW } from "../../config";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { World } from "../../elements/World";

export class RenderBox {
  world: World
  mesh: THREE.Mesh

  constructor(
    { world, texture, position, size, rotation }:
      { world: World, texture: THREE.Texture, position: Vector3, size: Vector3, rotation: Quaternion }
  ) {
    this.world = world

    const material = new (
      SHADOW ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial
    )({
      map: texture,
    });
    const geometry = new THREE.BoxGeometry(...size);

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(...position)
    this.mesh.quaternion.set(...rotation)

    if (SHADOW) {
      this.mesh.receiveShadow = true;
      this.mesh.castShadow = true;
    }
  }
}
