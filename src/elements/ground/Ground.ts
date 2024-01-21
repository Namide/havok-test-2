import * as THREE from "three";
import { GROUND_SIZE, SHADOW } from "../../config";
import {
  getGroundAmbiantOcclusionTexture,
  getGroundDiffuseTexture,
  getGroundNormalTexture,
} from "../../engine/render/textures";
import { World } from "../World";
import { Part } from "./Part";

// https://github.com/BabylonJS/Babylon.js/blob/48cf7b374a7bbee9f3bef02f2992715ed683cf98/packages/dev/core/src/Physics/v2/Plugins/havokPlugin.ts

const PLAYER_DISTANCE = 0.5;

export class Ground {
  group: THREE.Group = new THREE.Group();
  world: World;
  list: Part[] = [];

  material: THREE.Material;

  constructor(world: World) {
    this.world = world;

    // Render
    // const texture2 = generateTexture(data, PRECISION + 1, PRECISION + 1)
    this.material = SHADOW
      ? new THREE.MeshLambertMaterial({
          // map: texture,
          // color: 0xCCCCCC,
          map: getGroundDiffuseTexture(),
          bumpMap: getGroundNormalTexture(),
          aoMap: getGroundAmbiantOcclusionTexture(),

          bumpScale: 5,
        })
      : new THREE.MeshBasicMaterial({
          map: getGroundDiffuseTexture(),
        });

    this.addGround(0, 0);
  }

  update(x: number, y: number) {
    const arround: { x: number; y: number }[] = [];
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        const xRounded =
          Math.round(
            (x + i * PLAYER_DISTANCE * GROUND_SIZE[0]) / GROUND_SIZE[0],
          ) * GROUND_SIZE[0];
        const yRounded =
          Math.round(
            (y + j * PLAYER_DISTANCE * GROUND_SIZE[2]) / GROUND_SIZE[2],
          ) * GROUND_SIZE[2];
        if (
          !arround.find((item) => item.x === xRounded && item.y === yRounded)
        ) {
          arround.push({
            x: xRounded,
            y: yRounded,
          });
        }
      }
    }

    const toAdd = arround.filter(
      (ground) =>
        !this.list.find(({ x, y }) => x === ground.x && y === ground.y),
    );
    const toRemove = this.list.filter(
      (ground) => !arround.find(({ x, y }) => x === ground.x && y === ground.y),
    );

    for (const { x, y } of toRemove) {
      this.removeGround(x, y);
    }

    for (const { x, y } of toAdd) {
      this.addGround(x, y);
    }
  }

  addGround(x: number, y: number) {
    const groundPart = new Part(this.world, x, y, this.material);
    this.group.add(groundPart.object3d);
    this.list.push(groundPart);
    return groundPart;
  }

  removeGround(x: number, y: number) {
    const index = this.list.findIndex(
      (ground) => ground.x === x && ground.y === y,
    );
    const groundPart = this.list[index];
    groundPart.dispose();
    this.list.splice(index, 1);
  }
}
