import * as THREE from "three";

let checkerTexture: THREE.Texture;

// export const getGroundNormalTexture = () => {
//   return new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/ground-normal.jpg`);
// }

export const getGroundNormalTexture = () => {
  return new THREE.TextureLoader().load(
    `${import.meta.env.BASE_URL}assets/Moon_001_NORM.jpeg`,
  );
};

export const getGroundDiffuseTexture = () => {
  return new THREE.TextureLoader().load(
    `${import.meta.env.BASE_URL}assets/Moon_001_COLOR.jpeg`,
  );
};

export const getGroundAmbiantOcclusionTexture = () => {
  return new THREE.TextureLoader().load(
    `${import.meta.env.BASE_URL}assets/Moon_001_OCC.jpeg`,
  );
};

export const getGroundSpecularTexture = () => {
  return new THREE.TextureLoader().load(
    `${import.meta.env.BASE_URL}assets/Moon_001_SPEC.jpeg`,
  );
};

// export const getGroundDisplaceTexture = () => {
//   return new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/Moon_001_DISP.png`);
// }

export const getCheckerTexture = async () => {
  if (!checkerTexture) {
    checkerTexture = await loadTexture(
      `${import.meta.env.BASE_URL}assets/checker-map.webp`,
    );
  }
  return checkerTexture;
};

function loadTexture(url: string): Promise<THREE.Texture> {
  const loader = new THREE.TextureLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      resolve,
      // onProgress callback currently not supported
      undefined,
      reject,
    );
  });
}
