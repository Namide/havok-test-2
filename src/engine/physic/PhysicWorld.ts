import { Havok } from "./getHavok";
import { HP_WorldId } from "./havok/HavokPhysics";

export class PhysicWorld {

  world: HP_WorldId
  havok: Havok

  constructor(havok: Havok) {
    this.havok = havok
    this.world = this.havok.HP_World_Create()[1];
    this.havok.HP_World_SetGravity(this.world, [0, -9.81, 0]);
  }


  tick(delta: number) {
    this.havok.HP_World_Step(this.world, delta);
  }
}

/*
private _notifyCollisions() {
        let eventAddress = this._hknp.HP_World_GetCollisionEvents(this.world)[1];
        const event = new CollisionEvent();
        const worldAddr = Number(this.world);
        while (eventAddress) {
            CollisionEvent.readToRef(this._hknp.HEAPU8.buffer, eventAddress, event);
            const bodyInfoA = this._bodies.get(event.contactOnA.bodyId);
            const bodyInfoB = this._bodies.get(event.contactOnB.bodyId);

            // Bodies may have been disposed between events. Check both still exist.
            if (bodyInfoA && bodyInfoB) {
                const collisionInfo: any = {
                    collider: bodyInfoA.body,
                    colliderIndex: bodyInfoA.index,
                    collidedAgainst: bodyInfoB.body,
                    collidedAgainstIndex: bodyInfoB.index,
                    type: this._nativeCollisionValueToCollisionType(event.type),
                };
                if (collisionInfo.type === PhysicsEventType.COLLISION_FINISHED) {
                    this.onCollisionEndedObservable.notifyObservers(collisionInfo);
                } else {
                    event.contactOnB.position.subtractToRef(event.contactOnA.position, this._tmpVec3[0]);
                    const distance = Vector3.Dot(this._tmpVec3[0], event.contactOnA.normal);
                    collisionInfo.point = event.contactOnA.position;
                    collisionInfo.distance = distance;
                    collisionInfo.impulse = event.impulseApplied;
                    collisionInfo.normal = event.contactOnA.normal;
                    this.onCollisionObservable.notifyObservers(collisionInfo);
                }

                if (this._bodyCollisionObservable.size && collisionInfo.type !== PhysicsEventType.COLLISION_FINISHED) {
                    const observableA = this._bodyCollisionObservable.get(event.contactOnA.bodyId);
                    const observableB = this._bodyCollisionObservable.get(event.contactOnB.bodyId);

                    if (observableA) {
                        observableA.notifyObservers(collisionInfo);
                    } else if (observableB) {
                        //<todo This seems like it would give unexpected results when both bodies have observers?
                        // Flip collision info:
                        collisionInfo.collider = bodyInfoB.body;
                        collisionInfo.colliderIndex = bodyInfoB.index;
                        collisionInfo.collidedAgainst = bodyInfoA.body;
                        collisionInfo.collidedAgainstIndex = bodyInfoA.index;
                        collisionInfo.normal = event.contactOnB.normal;
                        observableB.notifyObservers(collisionInfo);
                    }
                } else if (this._bodyCollisionEndedObservable.size) {
                    const observableA = this._bodyCollisionEndedObservable.get(event.contactOnA.bodyId);
                    const observableB = this._bodyCollisionEndedObservable.get(event.contactOnB.bodyId);

                    if (observableA) {
                        observableA.notifyObservers(collisionInfo);
                    } else if (observableB) {
                        //<todo This seems like it would give unexpected results when both bodies have observers?
                        // Flip collision info:
                        collisionInfo.collider = bodyInfoB.body;
                        collisionInfo.colliderIndex = bodyInfoB.index;
                        collisionInfo.collidedAgainst = bodyInfoA.body;
                        collisionInfo.collidedAgainstIndex = bodyInfoA.index;
                        collisionInfo.normal = event.contactOnB.normal;
                        observableB.notifyObservers(collisionInfo);
                    }
                }
            }

            eventAddress = this._hknp.HP_World_GetNextCollisionEvent(worldAddr, eventAddress);
        }
    }
    */