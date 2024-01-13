import * as THREE from "three";
import { DEBUG, SHADOW, SOFT_SHADOW } from "../../config";
import pcssFragment from "../render/pcss.fragment.glsl";
import pcssGetShadowFragment from "../render/pcssGetShadow.fragment.glsl";
import { vector3 } from "../../constants";

const LIGHT_POSITION = new THREE.Vector3(8, 8, 8)
const TARGET_POSITION = new THREE.Vector3(0, 0, 0)

const SHADOW_WIDTH = 8
const SHADOW_HEIGHT = 8
const SHADOW_DEPTH = 11
const SHADOW_BLUR_RADIUS = 2
// const SHADOW_BLUR_SAMPLE = 4

// Soft shadows
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_shadowmap_pcss.html
// https://threejs.org/examples/?q=shado#webgl_shadowmap_pcss

export class ShadowLight {

  light?: THREE.DirectionalLight

  init({
    renderer,
    scene,
    width,
    height,
  }: {
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    width: number,
    height: number
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
      renderer.shadowMap.enabled = true;
      /*
        THREE.BasicShadowMap 
        THREE.PCFShadowMap 
        THREE.PCFSoftShadowMap
        THREE.VSMShadowMap
      */
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Lights
    scene.add(new THREE.AmbientLight(0xAAAAFF, 2));
    this.light = new THREE.DirectionalLight(0xFFFFFF, 3);
    this.light.position.copy(LIGHT_POSITION);
    this.light.lookAt(TARGET_POSITION);

    const distance = vector3.copy(LIGHT_POSITION).sub(TARGET_POSITION).length()

    if (SHADOW) {
      this.light.castShadow = true;
      if (!SOFT_SHADOW) {
        this.light.shadow.radius = SHADOW_BLUR_RADIUS
        // this.light.shadow.blurSamples = SHADOW_BLUR_SAMPLE
      }
      this.light.shadow.mapSize.width = Math.min(width, height);
      this.light.shadow.mapSize.height = Math.min(width, height);
      this.light.shadow.camera.far = distance + SHADOW_DEPTH;
      this.light.shadow.camera.near = Math.max(1, distance - SHADOW_DEPTH);
      this.light.shadow.camera.top = SHADOW_HEIGHT
      this.light.shadow.camera.bottom = -SHADOW_HEIGHT;
      this.light.shadow.camera.left = SHADOW_WIDTH;
      this.light.shadow.camera.right = -SHADOW_WIDTH;
      if (DEBUG) {
        scene.add(new THREE.CameraHelper(this.light.shadow.camera));
      }
    } else if (DEBUG) {
      scene.add(new THREE.DirectionalLightHelper(this.light));
    }
    scene.add(this.light);
  }

  center(target: THREE.Vector3) {
    if (SHADOW && this.light) {
      this.light.position.copy(target).add(LIGHT_POSITION)
      this.light.target.position.copy(target)
      this.light.target.updateMatrixWorld()
    }
  }
}