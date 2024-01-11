import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { CAMERA_FOLLOW, CAMERA_POSITION, ORBIT_CONTROL } from "../../config";
import { ShadowLight } from "../render/ShadowLight";
import { vector3 } from "../../constants";

const raycaster = new THREE.Raycaster();

// Soft shadows
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_shadowmap_pcss.html
// https://threejs.org/examples/?q=shado#webgl_shadowmap_pcss

export class RenderWorld {

  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera

  private shadowLight: ShadowLight = new ShadowLight()
  private controls?: OrbitControls

  constructor(width: number, height: number) {

    // Scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      70,
      width / height,
      1,
      1000,
    );
    this.camera.position.set(...CAMERA_POSITION)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: document.querySelector("canvas") as HTMLCanvasElement,
    });

    this.renderer.setSize(width, height, false);

    // Shadow
    this.shadowLight.init({
      scene: this.scene,
      renderer: this.renderer,
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
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  tick() {
    // mouseEmitter.testHover();
    if (this.controls) {
      this.controls.update();
    }
  }

  render(center?: THREE.Object3D, ground?: THREE.Group) {
    if (center && ground) {

      raycaster.set(center.position, vector3.set(0, -1, 0).clone())
      const [gr] = raycaster.intersectObjects(ground.children)
      const point = gr?.point
      const target = point ?? center.position

      // Light
      this.shadowLight.center(target)

      // Camera follow
      if (CAMERA_FOLLOW && !ORBIT_CONTROL) {
        if (point) {
          this.camera.position.copy(vector3.set(...CAMERA_POSITION).add(point))
          this.camera.lookAt(point);
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
}
