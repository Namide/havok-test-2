import * as THREE from "three";
import { GROUND_SIZE, SHADOW } from "../../config"
import { World } from "../../elements/World"
import { generateHeight } from "../../elements/ground/heightMap"

const PRECISION = 8

export class RenderGroundPart {
  world: World
  object3d: THREE.Mesh

  constructor(world: World, x: number, y: number, material: THREE.Material) {
    this.world = world
    const [width, depth, height] = GROUND_SIZE

    // Perlin noise
    const geometry = new THREE.PlaneGeometry(width, height, PRECISION, PRECISION);
    generateHeight({
      width: PRECISION + 1,
      height: PRECISION + 1,
      depth,
      data: geometry.getAttribute('position').array as Float32Array,
      x,
      y,
    })


    // Render
    this.object3d = new THREE.Mesh(geometry, material)


    // Shadow
    if (SHADOW) {
      this.object3d.receiveShadow = true;
      this.object3d.castShadow = true;
    }

  }

  dispose() {
    this.object3d.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (mesh.isMesh && mesh.geometry) {
        mesh.geometry.dispose()
        console.log('dispose')
      }
    })
    this.object3d.parent?.remove(this.object3d)
  }
}