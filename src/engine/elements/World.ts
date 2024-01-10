import * as THREE from "three";
import { Havok, getHavok } from "../physic/getHavok";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { HP_WorldId } from "../physic/havok/HavokPhysics";
import { DEBUG, ORBIT_CONTROL, SHADOW, SOFT_SHADOW } from "../../config";
import { ShadowLight } from "../render/ShadowLight";

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
  delta = 0

  shadowLight: ShadowLight = new ShadowLight()
  controls?: OrbitControls

  havok: Havok
  physic: HP_WorldId

  constructor(havok: Havok) {

    this.resize = this.resize.bind(this)

    // Physic
    this.havok = havok;
    this.physic = this.havok.HP_World_Create()[1];
    this.havok.HP_World_SetGravity(this.physic, [0, -9.81, 0]);

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
    this.shadowLight.init({
      world: this
    })

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
    this.delta = this.clock.getDelta();
    // mouseEmitter.testHover();
    if (this.controls) {
      this.controls.update();
    }

    // Physic
    if (this.havok && this.physic) {
      this.havok.HP_World_Step(this.physic, this.delta);
    }
  }

  render(center?: THREE.Object3D) {
    if (center) {
      this.shadowLight.center(center)
    }
    this.renderer.render(this.scene, this.camera);
  }
}
