import { Havok } from "./getHavok";
import { HP_BodyId, HP_WorldId, Vector3 } from "./havok/HavokPhysics";

// class ContactPoint {
//   public bodyId: bigint = BigInt(0); //0,2
//   //public colliderId: number = 0; //2,4
//   //public shapePath: ShapePath = new ShapePath(); //4,8
//   public position: Vector3 = new Vector3(); //8,11
//   public normal: Vector3 = new Vector3(); //11,14
//   //public triIdx: number = 0; //14,15
// }

// class CollisionEvent {
//   public contactOnA: ContactPoint = new ContactPoint(); //1
//   public contactOnB: ContactPoint = new ContactPoint();
//   public impulseApplied: number = 0;
//   public type: number = 0;

//   static readToRef(buffer: any, offset: number, eventOut: CollisionEvent) {
//     const intBuf = new Int32Array(buffer, offset);
//     const floatBuf = new Float32Array(buffer, offset);
//     const offA = 2;
//     eventOut.contactOnA.bodyId = BigInt(intBuf[offA]); //<todo Need to get the high+low words!
//     eventOut.contactOnA.position.set(floatBuf[offA + 8], floatBuf[offA + 9], floatBuf[offA + 10]);
//     eventOut.contactOnA.normal.set(floatBuf[offA + 11], floatBuf[offA + 12], floatBuf[offA + 13]);
//     const offB = 18;
//     eventOut.contactOnB.bodyId = BigInt(intBuf[offB]);
//     eventOut.contactOnB.position.set(floatBuf[offB + 8], floatBuf[offB + 9], floatBuf[offB + 10]);
//     eventOut.contactOnB.normal.set(floatBuf[offB + 11], floatBuf[offB + 12], floatBuf[offB + 13]);
//     eventOut.impulseApplied = floatBuf[offB + 13 + 3];
//     eventOut.type = intBuf[0];
//   }
// }

function createCollisionEvent(buffer: ArrayBufferLike, offset: number) {
  const intBuf = new Int32Array(buffer, offset);
  const floatBuf = new Float32Array(buffer, offset);
  const offA = 2;
  // eventOut.contactOnA.bodyId = BigInt(intBuf[offA]);
  // eventOut.contactOnA.position.set(floatBuf[offA + 8], floatBuf[offA + 9], floatBuf[offA + 10]);
  // eventOut.contactOnA.normal.set(floatBuf[offA + 11], floatBuf[offA + 12], floatBuf[offA + 13]);
  const offB = 18;
  // eventOut.contactOnB.bodyId = BigInt(intBuf[offB]);
  // eventOut.contactOnB.position.set(floatBuf[offB + 8], floatBuf[offB + 9], floatBuf[offB + 10]);
  // eventOut.contactOnB.normal.set(floatBuf[offB + 11], floatBuf[offB + 12], floatBuf[offB + 13]);
  // eventOut.impulseApplied = floatBuf[offB + 13 + 3];
  // eventOut.type = intBuf[0];

  return {
    a: {
      body: [BigInt(intBuf[offA])] as HP_BodyId,
      position: [floatBuf[offA + 8], floatBuf[offA + 9], floatBuf[offA + 10]] as Vector3,
      normal: [floatBuf[offA + 11], floatBuf[offA + 12], floatBuf[offA + 13]] as Vector3,
    },
    b: {
      body: [BigInt(intBuf[offB])] as HP_BodyId,
      position: [floatBuf[offB + 8], floatBuf[offB + 9], floatBuf[offB + 10]] as Vector3,
      normal: [floatBuf[offB + 11], floatBuf[offB + 12], floatBuf[offB + 13]] as Vector3,
    },
    impulse: floatBuf[offB + 13 + 3],
    type: intBuf[0]
  }
}

export class PhysicWorld {

  world: HP_WorldId
  havok: Havok
  collisions: ReturnType<typeof createCollisionEvent>[] = []

  constructor(havok: Havok) {
    this.havok = havok
    this.world = this.havok.HP_World_Create()[1];
    this.havok.HP_World_SetGravity(this.world, [0, -9.81, 0]);


  }



  collisionTest() {
    this.collisions = []
    let eventAddress = this.havok.HP_World_GetCollisionEvents(this.world)[1];

    // const event = new CollisionEvent();
    // const worldAddr = Number(this.world);
    if (eventAddress) {
      console.log('->', eventAddress)

      const event = createCollisionEvent(this.havok.HEAPU8.buffer, eventAddress)
      this.collisions.push(event)

      // console.log(event)

      // CollisionEvent.readToRef(this.havok.HEAPU8.buffer, eventAddress, event);
      // const bodyInfoA = this._bodies.get(event.contactOnA.bodyId);
      // const bodyInfoB = this._bodies.get(event.contactOnB.bodyId);

      // // Bodies may have been disposed between events. Check both still exist.
      // if (bodyInfoA && bodyInfoB) {
      //   const collisionInfo: any = {
      //     collider: bodyInfoA.body,
      //     colliderIndex: bodyInfoA.index,
      //     collidedAgainst: bodyInfoB.body,
      //     collidedAgainstIndex: bodyInfoB.index,
      //     type: this._nativeCollisionValueToCollisionType(event.type),
      //   };
      //   if (collisionInfo.type === PhysicsEventType.COLLISION_FINISHED) {
      //     this.onCollisionEndedObservable.notifyObservers(collisionInfo);
      //   } else {
      //     event.contactOnB.position.subtractToRef(event.contactOnA.position, this._tmpVec3[0]);
      //     const distance = Vector3.Dot(this._tmpVec3[0], event.contactOnA.normal);
      //     collisionInfo.point = event.contactOnA.position;
      //     collisionInfo.distance = distance;
      //     collisionInfo.impulse = event.impulseApplied;
      //     collisionInfo.normal = event.contactOnA.normal;
      //     this.onCollisionObservable.notifyObservers(collisionInfo);
      //   }

      //   if (this._bodyCollisionObservable.size && collisionInfo.type !== PhysicsEventType.COLLISION_FINISHED) {
      //     const observableA = this._bodyCollisionObservable.get(event.contactOnA.bodyId);
      //     const observableB = this._bodyCollisionObservable.get(event.contactOnB.bodyId);

      //     if (observableA) {
      //       observableA.notifyObservers(collisionInfo);
      //     } else if (observableB) {
      //       //<todo This seems like it would give unexpected results when both bodies have observers?
      //       // Flip collision info:
      //       collisionInfo.collider = bodyInfoB.body;
      //       collisionInfo.colliderIndex = bodyInfoB.index;
      //       collisionInfo.collidedAgainst = bodyInfoA.body;
      //       collisionInfo.collidedAgainstIndex = bodyInfoA.index;
      //       collisionInfo.normal = event.contactOnB.normal;
      //       observableB.notifyObservers(collisionInfo);
      //     }
      //   } else if (this._bodyCollisionEndedObservable.size) {
      //     const observableA = this._bodyCollisionEndedObservable.get(event.contactOnA.bodyId);
      //     const observableB = this._bodyCollisionEndedObservable.get(event.contactOnB.bodyId);

      //     if (observableA) {
      //       observableA.notifyObservers(collisionInfo);
      //     } else if (observableB) {
      //       //<todo This seems like it would give unexpected results when both bodies have observers?
      //       // Flip collision info:
      //       collisionInfo.collider = bodyInfoB.body;
      //       collisionInfo.colliderIndex = bodyInfoB.index;
      //       collisionInfo.collidedAgainst = bodyInfoA.body;
      //       collisionInfo.collidedAgainstIndex = bodyInfoA.index;
      //       collisionInfo.normal = event.contactOnB.normal;
      //       observableB.notifyObservers(collisionInfo);
      //     }
      //   }
      // }

      eventAddress = this.havok.HP_World_GetNextCollisionEvent(Number(this.world), eventAddress);
    }
  }


  tick(delta: number) {
    this.havok.HP_World_Step(this.world, delta);
    this.collisionTest()
  }
}

