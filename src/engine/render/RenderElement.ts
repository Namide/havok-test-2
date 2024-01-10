import * as THREE from "three";
import { SHADOW } from "../../config";
import { World } from "../elements/World";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { CapsuleSize, ShapeType, SizeByShape } from "../../types";
import { vector3 } from "../../constants";

export class RenderElement<CurrentPhysicShapeType extends ShapeType, CurrentSize = SizeByShape[CurrentPhysicShapeType]> {
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
    if (shape === ShapeType.Box) {
      geometry = new THREE.BoxGeometry(...size as Vector3);
    } else if (shape === ShapeType.Sphere) {
      geometry = new THREE.SphereGeometry(size as number);
    } else { // Capsule
      const typedSize = size as CapsuleSize
      const length = new THREE.Vector3(...typedSize[0]).distanceTo(vector3.set(...typedSize[1]))
      geometry = new THREE.CapsuleGeometry(typedSize[2], length, 2, 9)
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
