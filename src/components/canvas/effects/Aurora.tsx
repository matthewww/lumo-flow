import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useColorPalette } from './useColorPalette';
import { simplexNoiseGLSL } from './glsl';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  ${simplexNoiseGLSL}
  
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float t = u_time * 0.15;
    
    // Distort UVs to create organic flow
    vec2 warp = vec2(
      snoise(vec3(uv.x * 1.2, uv.y * 1.2, t)),
      snoise(vec3(uv.x * 1.5 + 10.0, uv.y * 1.5, t * 1.2))
    );
    uv += warp * 0.4;

    // Create glowing diagonal ribbons
    float wave = sin(uv.y * 4.0 - uv.x * 3.0 + u_time * 0.8) * 0.5 + 0.5;
    wave *= snoise(vec3(uv * 2.5, t * 2.0)) * 0.5 + 0.5;
    
    float intensity = smoothstep(0.1, 0.7, wave);

    // Mix the color palette
    vec3 col = mix(u_color1, u_color2, uv.x * 0.5 + 0.5);
    col = mix(col, u_color3, intensity);
    
    // Intensify core color
    col += u_color3 * pow(intensity, 2.5) * 0.6;

    // Fade edges (vignette)
    float dist = length(vUv - 0.5);
    float alpha = smoothstep(0.8, 0.2, dist) * 0.9;

    gl_FragColor = vec4(col, alpha);
  }
`;

export function Aurora() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useColorPalette(materialRef);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_color1: { value: new THREE.Color() },
    u_color2: { value: new THREE.Color() },
    u_color3: { value: new THREE.Color() },
  }), []);

  return (
    <mesh scale={[12, 12, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
        uniforms={uniforms}
      />
    </mesh>
  );
}
