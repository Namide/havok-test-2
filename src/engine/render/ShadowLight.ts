import * as THREE from "three";
import { DEBUG, SHADOW, SOFT_SHADOW } from "../../config";
import { World } from "../elements/World";
import pcssFragment from "../render/pcss.fragment.glsl";
import pcssGetShadowFragment from "../render/pcssGetShadow.fragment.glsl";
import { vector3 } from "../../constants";

const LIGHT_POSITION = new THREE.Vector3(2, 8, 4)
const TARGET_POSITION = new THREE.Vector3(0, 0, 0)
const SHADOW_SIDE = 5
const SHADOW_DEPTH = 4

export class ShadowLight {

  light?: THREE.DirectionalLight

  init({
    world
  }: {
    world: World
  }) {
    // Shadows
    if (SOFT_SHADOW && SHADOW) {
      const shader = THREE.ShaderChunk.shadowmap_pars_fragment
        .replace(
          "#ifdef USE_SHADOWMAP",
          `#ifdef USE_SHADOWMAP
  ${pcssFragment}`,
        )
        .replace(
          "#if defined( SHADOWMAP_TYPE_PCF )",
          `${pcssGetShadowFragment}
  #if defined( SHADOWMAP_TYPE_PCF )`,
        );

      THREE.ShaderChunk.shadowmap_pars_fragment = shader;
    }
    if (SHADOW) {
      world.renderer.shadowMap.enabled = true;
    }

    // Lights
    world.scene.add(new THREE.AmbientLight(0xAAAAFF, 2));
    this.light = new THREE.DirectionalLight(0xFFFFFF, 3);
    this.light.position.copy(LIGHT_POSITION);
    this.light.lookAt(TARGET_POSITION);

    const distance = vector3.copy(LIGHT_POSITION).sub(TARGET_POSITION).length()

    if (SHADOW) {
      this.light.castShadow = true;
      this.light.shadow.mapSize.width = 1024;
      this.light.shadow.mapSize.height = 1024;
      this.light.shadow.camera.far = distance + SHADOW_DEPTH;
      this.light.shadow.camera.near = distance - SHADOW_DEPTH;
      this.light.shadow.camera.top = SHADOW_SIDE
      this.light.shadow.camera.bottom = -SHADOW_SIDE;
      this.light.shadow.camera.left = SHADOW_SIDE;
      this.light.shadow.camera.right = -SHADOW_SIDE;
      if (DEBUG) {
        world.scene.add(new THREE.CameraHelper(this.light.shadow.camera));
      }
    } else if (DEBUG) {
      world.scene.add(new THREE.DirectionalLightHelper(this.light));
    }
    world.scene.add(this.light);
  }

  center(target: THREE.Object3D) {
    if (SHADOW && this.light) {
      vector3.copy(target.position).add(LIGHT_POSITION)
      this.light.position.copy(vector3);
      this.light.target = target;
    }
  }
}