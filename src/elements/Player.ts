import * as THREE from "three";
import { World } from "./World";
import { Quaternion, Vector3 } from "../engine/physic/havok/HavokPhysics";
import { PhysicElement } from "../engine/physic/PhysicElement";
// import { RenderElement } from "../render/RenderElement";
import { PhysicMotionType, ShapeType } from "../types";
import { Controller } from "../events/Controller";
import { PlayerRender } from "../engine/render/PlayerRender";

export class Player {
  world: World
  group = new THREE.Group()
  // capsule: RenderElement<ShapeType.Capsule>
  render: PlayerRender
  physic: PhysicElement<ShapeType.Capsule>
  controller: Controller

  isJump = false
  isJumpForce = false
  isFalling = false

  constructor({
    world,
    texture,
    position,
    rotation = [0, 0, 0, 1],
  }: {
    world: World,
    texture: THREE.Texture,
    position: Vector3,
    rotation?: Quaternion,
  }) {

    this.world = world

    const radius = 0.1
    const length = 0.35
    const a = [0, -length / 2, 0] as Vector3
    const b = [0, length / 2, 0] as Vector3
    const size = [a, b, radius]

    this.controller = new Controller({})

    this.render = new PlayerRender({
      world,
      texture,
      position,
      rotation
    })
    this.group.add(this.render.mesh)

    // this.capsule = new RenderElement({
    //   world,
    //   texture,
    //   position,
    //   shape: ShapeType.Capsule,
    //   size,
    //   rotation
    // })
    // this.capsule.mesh.position.set(0, 0, 0)
    // this.capsule.mesh.quaternion.set(0, 0, 0, 1)
    // this.group.add(this.capsule.mesh)

    this.physic = new PhysicElement({
      world,
      position,
      size,
      rotation,
      shapeType: ShapeType.Capsule,
      motionType: PhysicMotionType.Dynamic
    })



    const collideEvents = /* this.world.physic.havok.EventType.COLLISION_STARTED.value | */ this.world.physic.havok.EventType.COLLISION_CONTINUED.value /* | this.world.physic.havok.EventType.COLLISION_FINISHED.value */;
    // console.log(this.world.physic.havok.EventType.COLLISION_STARTED)
    this.world.physic.havok.HP_Body_SetEventMask(this.physic.body, collideEvents);

    this.tick = this.tick.bind(this)
    this.tick(0)
  }

  dispose() {
    this.world.physic.havok.HP_Body_SetEventMask(this.physic.body, 0);
    this.physic.dispose()
    // this.render.dispose()
  }

  updateControls() {
    const VELOCITY_GROUND = 2
    const VELOCITY_AIR = 0.5
    const JUMP_POWER = 3

    const velocity = this.physic.getVelocity()

    const onGround = this.world.physic.collisions
      .find(event => event.a.body[0] === this.physic.body[0] && event.a.normal[1] < -0.5)
      || (Math.abs(velocity[1]) < 1 && !this.isJump)

    if (onGround) {
      this.isJump = false
    } else {
      this.isJump = true
      this.isFalling = velocity[1] < 0
    }

    // Calculate move
    const move = new THREE.Vector3(0, 0, 0)
    if (this.controller.isLeft) { move.x = -1 }
    if (this.controller.isRight) { move.x = 1 }
    if (this.controller.isTop) { move.z = -1 }
    if (this.controller.isBottom) { move.z = 1 }
    move.setLength(this.isJump ? VELOCITY_AIR : VELOCITY_GROUND)


    // Apply move to velocity
    if (!this.isJump) {
      velocity[0] = move.x
      velocity[2] = move.z
    } else if (this.isJump) {
      if (move.x > 0) { velocity[0] = Math.max(move.x, velocity[0]) }
      if (move.x < 0) { velocity[0] = Math.min(move.x, velocity[0]) }
      if (move.z > 0) { velocity[2] = Math.max(move.z, velocity[2]) }
      if (move.z < 0) { velocity[2] = Math.min(move.z, velocity[2]) }
    }

    // Apply jump to velocity
    if (this.controller.isAction1 && !this.isJump) {
      // this.world.physic.havok.HP_Body_ApplyImpulse(this.physic.body, this.render.mesh.position.toArray(), [0, JUMP_POWER, 0])
      velocity[1] = JUMP_POWER
    } /* else if (this.isJump && !this.isFalling && velocity[1] < 0) {
      this.isFalling = true
    } else if (this.isJump && this.isFalling && velocity[1] > 0) {
      this.isJump = false
      this.isFalling = false
    } */

    this.physic.setVelocity(velocity)

    // Disable rotation
    this.world.physic.havok.HP_Body_SetAngularVelocity(this.physic.body, [0, 0, 0])

    // Animation
    const isMoving = move.length() > 0
    if (isMoving) {
      this.render.rotationY = Math.atan2(move.x, move.z)
    }
    if (this.isJump) {
      this.render.animation = 'Jump'
    } else if (isMoving) {
      this.render.animation = 'Run'
    } else {
      this.render.animation = 'IDLE'
    }
  }

  tick(delta: number) {
    const [realPosition] = this.world.physic.havok.HP_Body_GetQTransform(this.physic.body)[1]
    this.physic.setTransform(
      realPosition,
      [0, 0, 0, 1]
    )
    const { position, quaternion } = this.physic.getTransform();

    this.group.position.set(...position);
    this.group.quaternion.set(...quaternion);

    this.render.tick(delta)
  }
}
