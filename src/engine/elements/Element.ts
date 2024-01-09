import * as THREE from "three";
import { World } from "./World";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { PhysicElement, SizeByShape } from "../physic/PhysicElement";
import { PhysicMotionType, PhysicShapeType } from "../physic/PhysicTypes";
import { RenderElement } from "../render/RenderElement";

export class Element<
  CurrentPhysicShapeType extends PhysicShapeType,
  CurrentSize = SizeByShape[CurrentPhysicShapeType]
> {
  render: RenderElement<CurrentPhysicShapeType>
  physic: PhysicElement<CurrentPhysicShapeType>

  constructor({
    world,
    texture,
    shape,
    position,
    size,
    rotation = [0, 0, 0, 1],
  }: {
    world: World,
    texture: THREE.Texture,
    position: Vector3,
    rotation?: Quaternion,
    size: CurrentSize,
    shape: CurrentPhysicShapeType
  }) {

    this.render = new RenderElement({
      world,
      texture,
      position,
      shape,
      size,
      rotation
    })

    this.physic = new PhysicElement({
      world,
      position,
      size,
      rotation,
      shapeType: shape,
      motionType: PhysicMotionType.Dynamic
    })

    this.update = this.update.bind(this)
    this.update()
  }

  update() {
    const { position, quaternion } = this.physic.getTransform();
    this.render.mesh.position.set(...position);
    this.render.mesh.quaternion.set(...quaternion);
  }
}
