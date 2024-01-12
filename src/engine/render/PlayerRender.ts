import * as THREE from "three";
import { SHADOW } from "../../config";
import { World } from "../elements/World";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class PlayerRender {
  world: World
  mesh: THREE.Group = new THREE.Group()
  mixer?: THREE.AnimationMixer

  constructor(
    { world, texture, position, rotation }:
      { world: World, texture: THREE.Texture, position: Vector3, rotation: Quaternion }
  ) {
    this.world = world

    // const material = new (
    //   SHADOW ? THREE.MeshLambertMaterial : THREE.MeshBasicMaterial
    // )({
    //   map: texture,
    // });

    const loader = new GLTFLoader()
    loader.load(`${import.meta.env.BASE_URL}assets/cosmonaut.glb`, async (gltf) => {
      const model = gltf.scene

      gltf.scene.traverse((object) => {
        console.log(object.name, object)
        if ((object as THREE.Mesh).isMesh) {
          // console.log(object)
          // model = (object as THREE.Mesh)
          object.castShadow = true;
        }
      });

      const skeleton = new THREE.SkeletonHelper(gltf.scene);
      skeleton.visible = false;
      this.mesh.add(skeleton);

      // wait until the model can be added to the scene without blocking due to shader compilation
      await this.world.render.renderer.compileAsync(model, this.world.render.camera, this.world.render.scene);
      this.mesh.add(model);
      // render();


      const animations = gltf.animations;

      this.mixer = new THREE.AnimationMixer(model);

      const idleAction = this.mixer.clipAction(animations[0]);
      const walkAction = this.mixer.clipAction(animations[3]);
      const runAction = this.mixer.clipAction(animations[1]);

      const actions = [idleAction, walkAction, runAction];

      // biome-ignore lint/complexity/noForEach: <explanation>
      actions.forEach((action) => {
        action.play();
      });
    });


    // this.mesh = new THREE.Mesh(geometry, material);
    // this.mesh.position.set(...position)
    // this.mesh.quaternion.set(...rotation)
    this.mesh.scale.set(0.1, 0.1, 0.1)
    this.mesh.position.set(0, -0.165, 0)

    if (SHADOW) {
      this.mesh.receiveShadow = true;
      this.mesh.castShadow = true;
    }
  }

  tick(delta: number) {
    if (this.mixer)
      this.mixer.update(delta);
  }
}
