import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useColorPalette } from './useColorPalette';
import { simplexNoiseGLSL } from './glsl';

const vertexShader = `
  ${simplexNoiseGLSL}
  uniform float u_time;
  varying vec3 vNormal;
  varying float vNoise;
  
  void main() {
    vec3 pos = position;
    
    // Calculate normal for fresnel
    vNormal = normalize(normalMatrix * normal);
    
    // Add organic noise displacement
    float t = u_time * 0.3;
    float noise = snoise(vec3(pos.xyz * 1.2 + t));
    vNoise = noise;
    
    pos += normal * noise * 0.4;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  varying vec3 vNormal;
  varying float vNoise;

  void main() {
    // Simple fresnel approximation pointing at camera
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 1.8);
    
    // Colorize based on noise peaks
    float t = clamp((vNoise + 1.0) * 0.5, 0.0, 1.0);
    vec3 color = mix(u_color1, u_color2, t);
    
    // Boost fresnel rim with tertiary color
    color = mix(color, u_color3, fresnel * 0.85);
    
    // Alpha falls off from center, brightest on the rims
    float alpha = clamp(0.3 + fresnel * 0.7, 0.0, 1.0);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export function MorphingSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useColorPalette(materialRef);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_color1: { value: new THREE.Color() },
    u_color2: { value: new THREE.Color() },
    u_color3: { value: new THREE.Color() },
  }), []);

  return (
    <mesh ref={meshRef} scale={[2.5, 2.5, 2.5]}>
      <icosahedronGeometry args={[1, 16]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
        wireframe={true}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </mesh>
  );
}
