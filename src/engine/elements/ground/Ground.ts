import * as THREE from "three";
import { World } from "../World";
import { GROUND_SIZE, SHADOW } from "../../../config";
import { getGroundNormalTexture } from "../../render/textures";
import { Part } from './Part'


// https://github.com/BabylonJS/Babylon.js/blob/48cf7b374a7bbee9f3bef02f2992715ed683cf98/packages/dev/core/src/Physics/v2/Plugins/havokPlugin.ts

export class Ground {
  group: THREE.Group = new THREE.Group()
  world: World
  list: Part[] = []

  material: THREE.Material

  constructor(world: World, texture: THREE.Texture) {

    this.world = world


    // Render
    // const texture2 = generateTexture(data, PRECISION + 1, PRECISION + 1)
    this.material = SHADOW ?
      new THREE.MeshLambertMaterial({
        // map: texture,
        color: 0xCCCCCC,
        bumpMap: getGroundNormalTexture()
      }) :
      new THREE.MeshBasicMaterial({
        map: texture
      });


    // Physic

    // this.body = []

    this.addGround(0, 0)
    // this.addGround(GROUND_SIZE[0], GROUND_SIZE[2])
    // this.addGround(GROUND_SIZE[0], 0)
  }

  update(x: number, y: number) {

    const middle = [
      Math.round(x / GROUND_SIZE[0]),
      Math.round(y / GROUND_SIZE[2])
    ]

    const arround: { x: number, y: number }[] = []
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        arround.push({
          x: (middle[0] + i) * GROUND_SIZE[0],
          y: (middle[1] + j) * GROUND_SIZE[2]
        })
      }
    }

    const toAdd = arround.filter(ground => !this.list.find(({ x, y }) => x === ground.x && y === ground.y))
    const toRemove = this.list.filter(ground => !arround.find(({ x, y }) => x === ground.x && y === ground.y))

    for (const { x, y } of toRemove) {
      this.removeGround(x, y)
    }

    for (const { x, y } of toAdd) {
      this.addGround(x, y)
    }
  }

  addGround(x: number, y: number) {
    const groundPart = new Part(this.world, x, y, this.material)
    this.group.add(groundPart.mesh)
    this.list.push(groundPart)
  }

  removeGround(x: number, y: number) {
    const index = this.list.findIndex(ground => ground.x === x && ground.y === y)
    const groundPart = this.list[index]
    groundPart.dispose()
    this.list.splice(index, 1)
  }
}
