import * as THREE from "three";
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

let seed = Math.PI / 4;
function RNG() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateHeight(width: number, height: number, depth: number, data: Float32Array) {
  const size = width * height
  // const data = new Uint8Array(size);
  const perlin = new ImprovedNoise()
  const z = Math.random() * 100;

  let quality = 1;
  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      const x = data[i * 3] // i % width
      const y = data[i * 3 + 1] // ~ ~(i / width);
      data[i * 3 + 2] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75) * (depth / 256);
    }
    quality *= 5;
  }

  return data;
}

export function generateTexture(data: Uint8Array, width: number, height: number) {

  const vector3 = new THREE.Vector3(0, 0, 0);

  const sun = new THREE.Vector3(1, 1, 1);
  sun.normalize();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  let context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);

  let image = context.getImageData(0, 0, canvas.width, canvas.height);
  let imageData = image.data;

  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {

    vector3.x = data[j - 2] - data[j + 2];
    vector3.y = 2;
    vector3.z = data[j - width * 2] - data[j + width * 2];
    vector3.normalize();

    const shade = vector3.dot(sun);

    imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
    imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
    imageData[i + 2] = (shade * 96) * (0.5 + data[j] * 0.007);
  }

  context.putImageData(image, 0, 0);

  // Scaled 4x

  const canvasScaled = document.createElement('canvas');
  canvasScaled.width = width * 4;
  canvasScaled.height = height * 4;

  context = canvasScaled.getContext('2d') as CanvasRenderingContext2D;
  context.scale(4, 4);
  context.drawImage(canvas, 0, 0);

  image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
  imageData = image.data;

  for (let i = 0, l = imageData.length; i < l; i += 4) {

    const v = ~ ~(Math.random() * 5);

    imageData[i] += v;
    imageData[i + 1] += v;
    imageData[i + 2] += v;

  }

  context.putImageData(image, 0, 0);

  return canvasScaled;
}