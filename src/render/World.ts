import * as THREE from "three";
import { getHavok } from "../physic/getHavok";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import pcssFragment from "./pcss.fragment.glsl";
import pcssGetShadowFragment from "./pcssGetShadow.fragment.glsl";
import { HP_WorldId } from "../physic/havok/HavokPhysics";
import { DEBUG, ORBIT_CONTROL, SHADOW, SOFT_SHADOW } from "../config";

// Soft shadows
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_shadowmap_pcss.html
// https://threejs.org/examples/?q=shado#webgl_shadowmap_pcss

export class World {

  screenSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  clock: THREE.Clock

  controls?: OrbitControls

  havok: Awaited<ReturnType<typeof getHavok>>
  physicWorld: HP_WorldId

  constructor(havok: Awaited<ReturnType<typeof getHavok>>) {

    this.resize = this.resize.bind(this)

    // Physic
    this.havok = havok;
    this.physicWorld = this.havok.HP_World_Create()[1];
    this.havok.HP_World_SetGravity(this.physicWorld, [0, -9.81, 0]);

    // Scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      70,
      this.screenSize.width / this.screenSize.height,
      1,
      1000,
    );
    this.camera.position.z = 5;
    this.camera.position.y = 10;
    this.camera.lookAt(new THREE.Vector3(0, 1, 0));

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: document.querySelector("canvas") as HTMLCanvasElement,
    });
    this.clock = new THREE.Clock();
    this.renderer.setSize(this.screenSize.width, this.screenSize.height, false);

    // Shadow
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
      this.renderer.shadowMap.enabled = true;
    }

    // const mouseEmitter = await createMouseEmitter({
    //   screenSize,
    //   this.scene,
    //   this.camera,
    //   canvas: this.renderer.domElement,
    // });

    // Orbit control
    if (ORBIT_CONTROL) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.update();
      // mouseEmitter.drag.on("start", () => {
      //   this.controls.enabled = false;
      // });
      // mouseEmitter.drag.on("stop", () => {
      //   this.controls.enabled = true;
      // });
    }

    // Lights
    this.scene.add(new THREE.AmbientLight(0xaaaaaa, 3));
    const light = new THREE.DirectionalLight(0xf0f6ff, 4.5);
    light.position.set(2, 8, 4);
    if (SHADOW) {
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      light.shadow.camera.far = 15;
      light.shadow.camera.near = 1;
      light.shadow.camera.top = 15;
      light.shadow.camera.bottom = -15;
      light.shadow.camera.left = 15;
      light.shadow.camera.right = -15;
      if (DEBUG) {
        this.scene.add(new THREE.CameraHelper(light.shadow.camera));
      }
    } else if (DEBUG) {
      this.scene.add(new THREE.DirectionalLightHelper(light));
    }
    this.scene.add(light);

    window.addEventListener("resize", this.resize);
  }

  resize() {
    this.screenSize.width = window.innerWidth;
    this.screenSize.height = window.innerHeight;
    this.renderer.setSize(this.screenSize.width, this.screenSize.height, false);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update() {
    const delta = this.clock.getDelta();
    // mouseEmitter.testHover();
    if (this.controls) {
      this.controls.update();
    }

    // Physic
    if (this.havok && this.physicWorld) {
      this.havok.HP_World_Step(this.physicWorld, delta);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
