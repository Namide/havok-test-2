import * as THREE from "three";
import {
  GROUND_ROCKS_MAX_COUNT,
  GROUND_ROCKS_MIN_COUNT,
  GROUND_SIZE,
} from "../../config";
import { PhysicGroundPart } from "../../engine/physic/PhysicGroundPart";
import { Vector3 } from "../../engine/physic/havok/HavokPhysics";
import { RenderGroundPart } from "../../engine/render/RenderGroundPart";
import { getBottomIntersect } from "../../engine/render/getIntersect";
import { World } from "../World";
import { Rock } from "./Rock";

export class Part {
  world: World;
  object3d: THREE.Group;

  physic: PhysicGroundPart;
  render: RenderGroundPart;

  x: number;
  y: number;

  constructor(world: World, x: number, y: number, material: THREE.Material) {
    this.object3d = new THREE.Group();
    this.world = world;
    this.x = x;
    this.y = y;

    const [width, depth, height] = GROUND_SIZE;
    const position: Vector3 = [x, -depth / 4, y] as const;

    this.render = new RenderGroundPart(this.world, x, y, material);
    this.object3d.add(this.render.object3d);

    this.physic = new PhysicGroundPart(
      this.world,
      position,
      this.render.object3d.geometry,
    );

    // Rocks
    const rocksCount =
      Math.round(
        Math.random() * (GROUND_ROCKS_MAX_COUNT - GROUND_ROCKS_MIN_COUNT),
      ) + GROUND_ROCKS_MIN_COUNT;
    for (let i = 0; i < rocksCount; i++) {
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      this.addRock(x, y, depth, this.render.object3d, position);
    }

    // Update
    this.render.object3d.position.set(...position);
    this.render.object3d.rotation.set(-Math.PI / 2, 0, 0);
  }

  addRock(
    x: number,
    y: number,
    depthMax: number,
    mesh: THREE.Mesh,
    globalPosition: Vector3,
  ) {
    const flyPosition = new THREE.Vector3(x, y, depthMax + 0.1);
    const position = getBottomIntersect(
      flyPosition,
      [mesh],
      new THREE.Vector3(0, 0, -1),
    );

    const rock = new Rock({
      world: this.world,
      position: [
        globalPosition[0] + position.x,
        globalPosition[1] + position.z,
        globalPosition[2] - position.y,
      ],
    });
    this.object3d.add(rock.mesh);
  }

  dispose() {
    this.render.dispose();
    this.physic.dispose();
  }
}
