import * as THREE from "three";
import { World } from "../World";
import { HP_BodyId, Quaternion, Vector3 } from "../../engine/physic/havok/HavokPhysics";
import { SHADOW } from "../../config";
import { loadGLTF } from "../../engine/render/loadGLTF";
import { euler, quaternion, vector3 } from "../../constants";
import { getGroundAmbiantOcclusionTexture, getGroundDiffuseTexture, getGroundNormalTexture } from "../../engine/render/textures";
import { renderGeometryToPhysicShape } from "../../engine/physic/renderGeometryToPhysicShape";

export class Rock {
  world: World
  mesh: THREE.Group = new THREE.Group()
  body?: HP_BodyId

  constructor(
    {
      world,
      position,
    }: {
      world: World,
      position: Vector3,
    }
  ) {
    this.world = world


    // RENDER

    const material =
      SHADOW ? new THREE.MeshLambertMaterial({
        // map: texture,
        // color: 0xCCCCCC,
        map: getGroundDiffuseTexture(),
        bumpMap: getGroundNormalTexture(),
        aoMap: getGroundAmbiantOcclusionTexture(),
        bumpScale: 5,
      }) : new THREE.MeshBasicMaterial({
        color: 0xCCCCCC,
      })
      ;

    loadGLTF('assets/rock-base.glb').then(gltf => {
      gltf.scene.traverse((object) => {
        const mesh = object as THREE.Mesh
        if (mesh.name === "Plane") {

          mesh.material = material
          // geometry = BufferGeometryUtils.mergeVertices(geometry)
          // // geometry.deleteAttribute('normal')
          // // BufferGeometryUtils.mergeVertices(geometry)
          // // geometry.computeVertexNormals()
          // geometry.computeVertexNormals();
          const vertices = mesh.geometry.getAttribute('position').array as Float32Array
          const DISPLACE = 0.1
          const SCALE = [Math.random() * 0.2 + 0.8, Math.random() * 0.2 + 0.8, Math.random() * 0.2 + 0.8]
          for (let j = 0; j < 4; j++) {
            for (let i = 0; i < vertices.length / 3; i++) {

              vector3.set(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2])
              vector3.multiplyScalar((Math.random() - 0.5) * 2 * DISPLACE + 1)

              // const realX = x + data[i * 3] // i % width
              // const realY = -y + data[i * 3 + 1] // ~ ~(i / width);
              vertices[i * 3] = vector3.x * SCALE[0]
              vertices[i * 3 + 1] = vector3.y * SCALE[1]
              vertices[i * 3 + 2] = vector3.z * SCALE[2]

              // data[i * 3 + 2] += Math.abs(perlin.noise(realX / quality, realY / quality, 0) * quality * 1.75) * (depth / 256);
            }
            mesh.geometry.computeBoundingBox()
            mesh.geometry.computeVertexNormals()
            // quality *= 5;
          }

          this.mesh.add(mesh)


          if (SHADOW) {
            mesh.receiveShadow = true;
            mesh.castShadow = true;
          }



          // PHYSIC

          this.world = world

          // Physic
          this.body = this.world.physic.havok.HP_Body_Create()[1];

          const shape = renderGeometryToPhysicShape(mesh.geometry, this.world.physic.havok)
          this.world.physic.havok.HP_Body_SetShape(this.body, shape);
          this.world.physic.havok.HP_Body_SetQTransform(this.body, [position, quaternion.setFromEuler(euler.set(0, Math.random() * 2 * Math.PI, 0)).toArray() as Quaternion]);
          this.world.physic.havok.HP_Body_SetMotionType(this.body, this.world.physic.havok.MotionType.STATIC);
          // this.world.physic.havok.HP_Body_SetMassProperties(this.body, [
          //   /* center of mass */[0, 0, 0],
          //   /* Mass */ mass,
          //   /* Inertia for mass of 1*/[0.01, 0.01, 0.01],
          //   /* Inertia Orientation */[0, 0, 0, 1],
          // ]);
          this.world.physic.havok.HP_World_AddBody(this.world.physic.world, this.body, false);


          // Update
          const transform = this.world.physic.havok.HP_Body_GetQTransform(this.body)[1];
          this.mesh.position.set(...transform[0]);
          this.mesh.quaternion.set(...transform[1]);
        }
      })
    })


    // this.mesh = new THREE.Mesh(geometry, material);

    // this.mesh.position.set(...position)
    // this.mesh.rotation.set(0, Math.random() * 2 * Math.PI, 0) // quaternion.set(...rotation)
    // this.mesh.scale.set(Math.random() + 1, Math.random() + 1, Math.random() + 1) // quaternion.set(...rotation)



  }
}