import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useColorPalette } from './useColorPalette';
import { simplexNoiseGLSL } from './glsl';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
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
  varying vec3 vPosition;
  
  // Fractional Brownian Motion
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    
    return value;
  }
  
  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Create flowing fluid motion
    vec3 coord = vec3(uv * 1.5, u_time * 0.1);
    coord.x += u_time * 0.05;
    coord.y += sin(u_time * 0.1) * 0.5;
    
    // Layer multiple noise octaves for fluid effect
    float noise1 = fbm(coord);
    float noise2 = fbm(coord * 2.0 + vec3(100.0, 50.0, u_time * 0.15));
    
    // Combine noise for swirling effect
    float combined = noise1 * 0.6 + noise2 * 0.4;
    
    // Map noise to colors
    float t = combined * 0.5 + 0.5; // normalize to 0-1
    
    vec3 color1 = mix(u_color1, u_color2, smoothstep(0.0, 0.5, t));
    vec3 color2 = mix(u_color2, u_color3, smoothstep(0.5, 1.0, t));
    vec3 finalColor = mix(color1, color2, t);
    
    // Add some glow in the center
    float dist = length(uv);
    float glow = exp(-dist * 1.5);
    finalColor += u_color3 * glow * 0.3;
    
    // Fade at edges
    float alpha = smoothstep(1.5, 0.5, dist);
    
    gl_FragColor = vec4(finalColor, alpha * 0.8);
  }
`;

export function FluidMesh() {
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
    <mesh scale={[10, 10, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
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
