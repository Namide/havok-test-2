import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";

const loader = new GLTFLoader();
export function loadGLTF(path: string): Promise<GLTF> {
  return new Promise((resolve) => {
    loader.load(`${import.meta.env.BASE_URL}${path}`, resolve);
  });
}
