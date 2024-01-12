import * as THREE from "three";
import { SHADOW } from "../../config";
import { World } from "../elements/World";
import { Quaternion, Vector3 } from "../physic/havok/HavokPhysics";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

type StanceNames = 'Jump' | 'Run' | 'IDLE'

export class PlayerRender {
  world: World
  mesh: THREE.Group = new THREE.Group()
  mixer?: THREE.AnimationMixer
  rotationY = 0

  private _animation: StanceNames = 'IDLE'
  private _animations?: {
    IDLE: THREE.AnimationAction,
    Run: THREE.AnimationAction,
    Jump: THREE.AnimationAction,
  }

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
        // console.log(object.name, object)
        const mesh = object as THREE.Mesh

        if (mesh.material) {

          switch ((mesh.material as { name: string }).name) {
            case 'Head':
              mesh.material = new THREE.MeshPhongMaterial({
                color: 0xf2d000,
                specular: 0xcd001e,
                emissive: 0x33000b,
                emissiveIntensity: 10,
                shininess: 10,
              })
              break
            case 'Body':
              mesh.material = new THREE.MeshPhongMaterial({
                color: 0x3584e4,
                specular: 0x99c1f1,
                emissive: 0x000000,
                emissiveIntensity: 10,
                shininess: 0,
              })
              break
          }

          mesh.castShadow = true;


          console.log(mesh.name, mesh)
        }
      });

      const skeleton = new THREE.SkeletonHelper(gltf.scene);
      skeleton.visible = false;
      this.mesh.add(skeleton);

      // wait until the model can be added to the scene without blocking due to shader compilation
      await this.world.render.renderer.compileAsync(model, this.world.render.camera, this.world.render.scene);
      this.mesh.add(model);
      // render();


      // this._animations = gltf.animations;

      this.mixer = new THREE.AnimationMixer(model);
      // console.log(animations)
      this._animations = {
        IDLE: this.mixer.clipAction(gltf.animations.find(({ name }) => name === 'IDLE') as THREE.AnimationClip),
        Run: this.mixer.clipAction(gltf.animations.find(({ name }) => name === 'Run') as THREE.AnimationClip),
        Jump: this.mixer.clipAction(gltf.animations.find(({ name }) => name === 'Jump') as THREE.AnimationClip),
      }


      // const idleAction = this.mixer.clipAction(animations[0]);
      // const walkAction = this.mixer.clipAction(animations[3]);
      // const runAction = this.mixer.clipAction(animations[1]);

      // const actions = [idleAction, walkAction, runAction];

      // biome-ignore lint/complexity/noForEach: <explanation>
      Object.values(this._animations).forEach((action) => {
        action.play();
      });
      this.animation = 'IDLE'
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

  set animation(value: StanceNames) {
    if (this._animation !== value) {
      this._animation = value

      if (this._animations) {
        Object.entries(this._animations).forEach(([name, action]) => {
          action.weight = name === value ? 1 : 0
        });
      }
    }
  }

  tick(delta: number) {
    this.mesh.rotation.y = this.rotationY
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}
