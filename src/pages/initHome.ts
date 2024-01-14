import * as THREE from "three";
import { euler, quaternion } from "../constants";
import { World } from "../elements/World";
import { getCheckerTexture } from "../engine/render/textures";
import { Ground } from "../elements/ground/Ground";
import { getHavok } from "../engine/physic/getHavok";
import { Quaternion } from "../engine/physic/havok/HavokPhysics";
import { Element } from "../elements/Element";
import { Player } from "../elements/Player";
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
  const ground = new Ground(world)
  world.render.scene.add(ground.group);

  // Player
  const player = new Player({
    world,
    texture,
    position: [
      1,
      -5,
      1
    ],
  });
  world.render.scene.add(player.group);

  // Force camera position
  world.display(player.group, ground.group, false)

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
  }

  // Cube
  for (let i = 0; i < 10; i++) {
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
    player.tick(delta)
    world.display(player.group, ground.group)
    ground.update(player.group.position.x, player.group.position.z)
  }

  return {
    world
  }
}
