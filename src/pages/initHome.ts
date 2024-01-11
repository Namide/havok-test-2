import * as THREE from "three";
import { euler, quaternion } from "../constants";
import { World } from "../engine/elements/World";
import { getCheckerTexture } from "../engine/render/textures";
import { Ground } from "../engine/elements/ground/Ground";
import { getHavok } from "../engine/physic/getHavok";
import { Quaternion } from "../engine/physic/havok/HavokPhysics";
import { Element } from "../engine/elements/Element";
import { Player } from "../engine/elements/Player";
import { ShapeType } from "../types";

const GROUND_SIZE = 20;

const rand = (max: number, min = 0) => Math.random() * (max - min) + min;

const getRandomRotation = () =>
  quaternion
    .setFromEuler(
      euler.set(rand(2 * Math.PI), rand(2 * Math.PI), rand(2 * Math.PI)),
      true,
    )
    .toArray() as Quaternion;

export async function initHome() {

  const havok = await getHavok()
  const texture = await getCheckerTexture()
  const world = new World(havok)
  const clock = new THREE.Clock();

  const updates: (() => void)[] = []

  // Ground
  const ground = new Ground(world, texture)
  world.render.scene.add(ground.group);

  // Player
  const player = new Player({
    world,
    texture,
    position: [5, 6, 0],
  });
  world.render.scene.add(player.render.mesh);
  updates.push(player.update);

  // Sphere
  for (let i = 0; i < 10; i++) {

    const sphere = new Element({
      world,
      texture,
      shape: ShapeType.Sphere,
      position: [rand(1, -1), rand(8, 4), rand(1, -1)],
      size: rand(0.2, 0.1),
    });
    world.render.scene.add(sphere.render.mesh);
    updates.push(sphere.update);

    // mouseEmitter.over.on(mesh, () => {
    //   renderworld.render.renderer.domElement.style.cursor = "grab";
    // });

    // mouseEmitter.out.on(mesh, () => {
    //   renderworld.render.renderer.domElement.style.cursor = "auto";
    // });

    // mouseEmitter.click.on(mesh, (target) => {
    //   console.log("click:", target);
    // });
  }

  // Cards
  // for (let i = 0; i < 5; i++) {
  //   const { mesh: card, update } = await createCard({
  //     physic,
  //     position: [rand(1, -1), rand(4, 2), rand(1, -1)],
  //     rotation: quaternion
  //       .setFromEuler(
  //         euler.set(rand(2 * Math.PI), rand(2 * Math.PI), rand(2 * Math.PI)),
  //         true,
  //       )
  //       .toArray() as Quaternion,
  //     size: [1, 3 / 2, 0.01],
  //     mouseEmitter,
  //     renderWorld,
  //   });
  //   renderworld.render.scene.add(card);
  //   updates.push(update);
  // }

  // Cube
  for (let i = 0; i < 100; i++) {
    const cube = new Element({
      world,
      texture,
      shape: ShapeType.Box,
      position: [
        rand(GROUND_SIZE * 0.48, -GROUND_SIZE * 0.48),
        rand(8, 4),
        rand(GROUND_SIZE * 0.48, -GROUND_SIZE * 0.48),
      ],
      size: [rand(1.2, 0.2), rand(1.2, 0.2), rand(1.2, 0.2)],
      rotation: getRandomRotation(),
      // mouseEmitter,
    });
    world.render.scene.add(cube.render.mesh);
    updates.push(cube.update);
  }

  world.render.renderer.setAnimationLoop(tick);

  function tick(/* time: number */) {

    const delta = clock.getDelta();

    player.updateControls();
    world.tick(delta);
    for (const update of updates) {
      update();
    }
    world.display(player.render.mesh, ground.group)
    ground.update(player.render.mesh.position.x, player.render.mesh.position.z)
  }

  return {
    world
  }
}
