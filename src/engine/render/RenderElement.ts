import * as THREE from "three";
import { SHADOW } from "../../config";
import { World } from "../elements/World";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { PhysicShapeType } from "../physic/PhysicTypes";
import { SizeByShape } from "../physic/PhysicElement";

export class RenderElement<CurrentPhysicShapeType extends PhysicShapeType, CurrentSize = SizeByShape[CurrentPhysicShapeType]> {
  world: World
  mesh: THREE.Mesh

  constructor(
    {
      world,
      texture,
      position,
      size,
      rotation,
      shape,
    }: {
      world: World,
      texture: THREE.Texture,
      position: Vector3,
      size: CurrentSize,
      rotation: Quaternion,
      shape: CurrentPhysicShapeType
    }
  ) {
    this.world = world

    const material = new (
      SHADOW ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial
    )({
      map: texture,
    });

    let geometry: THREE.BufferGeometry
    if (shape === PhysicShapeType.Box) {
      geometry = new THREE.BoxGeometry(...size as Vector3);
    } else {
      geometry = new THREE.SphereGeometry(size as number);
    }

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(...position)
    this.mesh.quaternion.set(...rotation)

    if (SHADOW) {
      this.mesh.receiveShadow = true;
      this.mesh.castShadow = true;
    }
  }
}
