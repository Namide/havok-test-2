import * as THREE from "three";
import { PhysicWorld } from "../engine/physic/PhysicWorld";
import { Havok } from "../engine/physic/getHavok";
import { RenderWorld } from "../engine/render/RenderWorld";

export class World {
  screenSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  physic: PhysicWorld;
  render: RenderWorld;

  constructor(havok: Havok) {
    this.physic = new PhysicWorld(havok);
    this.render = new RenderWorld(
      this.screenSize.width,
      this.screenSize.height,
    );

    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);
  }

  resize() {
    this.screenSize.width = window.innerWidth;
    this.screenSize.height = window.innerHeight;
    this.render.resize(this.screenSize.width, this.screenSize.height);
  }

  tick(delta: number) {
    this.render.tick();
    this.physic.tick(delta);
  }

  display(center?: THREE.Object3D, ground?: THREE.Group, smooth = true) {
    this.render.render(center, ground, smooth);
  }
}
