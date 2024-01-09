import * as THREE from "three";
import { World } from "./World";
import { GROUND_SIZE, SHADOW } from "../../config";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { RenderElement } from "../render/RenderElement";
import { PhysicElement } from "../physic/PhysicElement";
import { PhysicMotionType, PhysicShapeType } from "../physic/PhysicTypes";

export class Ground {
  render: RenderElement<PhysicShapeType.Box>
  physic: PhysicElement<PhysicShapeType.Box>

  constructor(world: World, texture: THREE.Texture) {

    const position: Vector3 = [0, 0, 0] as const
    const rotation: Quaternion = [0, 0, 0, 1] as const
    const size: Vector3 = GROUND_SIZE

    this.render = new RenderElement({
      world,
      texture,
      position,
      size,
      rotation,
      shape: PhysicShapeType.Box
    })
    if (SHADOW) {
      this.render.mesh.castShadow = false;
    }

    this.physic = new PhysicElement({
      world,
      position,
      size,
      rotation,
      shapeType: PhysicShapeType.Box,
      motionType: PhysicMotionType.Static
    })

    const transform = this.physic.getTransform();
    this.render.mesh.position.set(...transform.position);
    this.render.mesh.quaternion.set(...transform.quaternion);
  }
}
