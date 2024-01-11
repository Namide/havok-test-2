import * as THREE from "three";
import { World } from "./World";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { PhysicElement } from "../physic/PhysicElement";
import { RenderElement } from "../render/RenderElement";
import { PhysicMotionType, ShapeType } from "../../types";
import { Controller } from "../../events/Controller";

export class Player {
  world: World
  render: RenderElement<ShapeType.Capsule>
  physic: PhysicElement<ShapeType.Capsule>
  controller: Controller

  isJump = false
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

    this.render = new RenderElement({
      world,
      texture,
      position,
      shape: ShapeType.Capsule,
      size,
      rotation
    })

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





    // if (body._pluginDataInstances && body._pluginDataInstances.length) {
    //   body._pluginDataInstances.forEach((bodyId) => {
    //     this._hknp.HP_Body_SetEventMask(bodyId.hpBodyId, enabled ? collideEvents : 0);
    //   });
    // } else if (body._pluginData) {
    //   this._hknp.HP_Body_SetEventMask(body._pluginData.hpBodyId, enabled ? collideEvents : 0);
    // }


    // Material
    // world.physic.havok.HP_Shape_SetMaterial(this.physic.shape, [
    //   /* static friction */ 100, // 0.5
    //   /* dynamic friction */ 100, // 0.5,
    //   /* restitution */ 0,
    //   // @ts-ignore
    //   /* friction combine mode */ world.physic.havok.MaterialCombine.MINIMUM,
    //   // @ts-ignore
    //   /* restitution combine mode */ world.physic.havok.MaterialCombine.MAXIMUM,
    // ])

    // Mass
    // this.world.physic.havok.HP_Body_SetMassProperties(this.physic.body, [
    //   /* center of mass */[0, 0, 0],
    //   /* Mass */ //0.035,
    //   /* Inertia for mass of 1*/[0.01, 0.01, 0.01],
    //   /* Inertia Orientation */[0, 0, 0, 1],
    // ]);





    // world.physic.havok.HP_Body_SetLinearDamping(this.physic.body, 10)


    // world.physic.havok.HP_Body_SetAngularDamping(this.physic.body, Number.POSITIVE_INFINITY)
    // const constraintID = world.physic.havok.HP_Constraint_Create()[1]
    // world.physic.havok.HP_Constraint_SetChildBody(constraintID, this.physic.body);
    // world.physic.havok.HP_Constraint_SetAxisMode(constraintID, world.physic.havok.ConstraintAxis.ANGULAR_X, world.physic.havok.ConstraintAxisLimitMode.LOCKED);
    // world.physic.havok.HP_Constraint_SetAxisMode(constraintID, world.physic.havok.ConstraintAxis.ANGULAR_Y, world.physic.havok.ConstraintAxisLimitMode.LOCKED);
    // world.physic.havok.HP_Constraint_SetAxisMode(constraintID, world.physic.havok.ConstraintAxis.ANGULAR_Z, world.physic.havok.ConstraintAxisLimitMode.LOCKED);

    this.update = this.update.bind(this)
    this.update()
  }

  dispose() {
    this.world.physic.havok.HP_Body_SetEventMask(this.physic.body, 0);
    this.physic.dispose()
    // this.render.dispose()
  }

  updateControls() {
    const VELOCITY_GROUND = 2
    const VELOCITY_AIR = 0.5
    const JUMP_POWER = 5

    const velocity = this.physic.getVelocity()

    const onGround = this.world.physic.collisions.find(event => event.a.body[0] === this.physic.body[0] && event.a.normal[1] < -0.5)
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
    this.physic.setTransform(
      this.render.mesh.position.toArray(),
      [0, 0, 0, 1]
    )
  }

  update() {
    const { position, quaternion } = this.physic.getTransform();
    this.render.mesh.position.set(...position);
    this.render.mesh.quaternion.set(...quaternion);
  }
}
