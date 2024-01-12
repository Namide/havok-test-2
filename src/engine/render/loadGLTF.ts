import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";

export function loadGLTF(path: string): Promise<GLTF> {
  const loader = new GLTFLoader()
  return new Promise((resolve) => {
    loader.load(`${import.meta.env.BASE_URL}${path}`, resolve)
  })
}