import { Texture } from "three";
import { euler, quaternion } from "../constants";
import { getHavok } from "../physic/getHavok";
import { Quaternion } from "../physic/havok/HavokPhysics";
import { World } from "../render/World";
import { getCheckerTexture } from "../render/textures";
import { Ground } from "../elements/Ground";

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

  const updates: (() => void)[] = []

  // Ground
  const ground = new Ground(world, texture)
  world.scene.add(ground);

  // Sphere
  for (let i = 0; i < 10; i++) {
    const { mesh, update } = await createSphere({
      physicWorld,
      position: [rand(1, -1), rand(4, 2), rand(1, -1)],
      size: rand(0.2, 0.1),
    });
    renderWorld.scene.add(mesh);
    updates.push(update);

    mouseEmitter.over.on(mesh, () => {
      renderWorld.renderer.domElement.style.cursor = "grab";
    });

    mouseEmitter.out.on(mesh, () => {
      renderWorld.renderer.domElement.style.cursor = "auto";
    });

    mouseEmitter.click.on(mesh, (target) => {
      console.log("click:", target);
    });
  }

  // Cards
  for (let i = 0; i < 5; i++) {
    const { mesh: card, update } = await createCard({
      physicWorld,
      position: [rand(1, -1), rand(4, 2), rand(1, -1)],
      rotation: quaternion
        .setFromEuler(
          euler.set(rand(2 * Math.PI), rand(2 * Math.PI), rand(2 * Math.PI)),
          true,
        )
        .toArray() as Quaternion,
      size: [1, 3 / 2, 0.01],
      mouseEmitter,
      renderWorld,
    });
    renderWorld.scene.add(card);
    updates.push(update);
  }

  // Cube
  for (let i = 0; i < 100; i++) {
    const { mesh, update } = await createCube({
      renderWorld,
      physicWorld,
      position: [
        rand(GROUND_SIZE * 0.48, -GROUND_SIZE * 0.48),
        rand(4, 2),
        rand(GROUND_SIZE * 0.48, -GROUND_SIZE * 0.48),
      ],
      size: [rand(1, 0.2), rand(1, 0.2), rand(1, 0.2)],
      rotation: getRandomRotation(),
      mouseEmitter,
    });
    renderWorld.scene.add(mesh);
    updates.push(update);
  }

  renderWorld.renderer.setAnimationLoop(tick);

  function tick(/* time: number */) {
    // required if controls.enableDamping or controls.autoRotate are set to true
    update3DBases();

    // Ste the simulation forward.

    // Get and print the rigid-body's position.
    for (const update of updates) {
      update();
    }

    render();
  }
}
}