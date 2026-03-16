import * as THREE from 'three';

export interface ColorPalette {
  color1: THREE.Color;
  color2: THREE.Color;
  color3: THREE.Color;
}

export const colorPalettes: ColorPalette[] = [
  {
    color1: new THREE.Color(0x0a2255),
    color2: new THREE.Color(0x1f4788),
    color3: new THREE.Color(0x42f5ff),
  },
  {
    color1: new THREE.Color(0xff4b1f),
    color2: new THREE.Color(0x8b3a62),
    color3: new THREE.Color(0xff9068),
  },
  {
    color1: new THREE.Color(0x0d1f2d),
    color2: new THREE.Color(0x1a5653),
    color3: new THREE.Color(0x76ffd6),
  },
  {
    color1: new THREE.Color(0x4a1a6d),
    color2: new THREE.Color(0x2a0845),
    color3: new THREE.Color(0xc77dff),
  },
  {
    color1: new THREE.Color(0x5d3a1a),
    color2: new THREE.Color(0xb8860b),
    color3: new THREE.Color(0xffe259),
  },
];
