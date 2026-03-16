import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useColorPalette } from './useColorPalette';
import { simplexNoiseGLSL } from './glsl';

const vertexShader = `
  ${simplexNoiseGLSL}
  uniform float u_time;
  varying float vHeight;
  
  void main() {
    vec3 pos = position;
    
    float t = u_time * 0.4;
    
    // Create dual repeating wave motion mixed with noise
    float waveX = sin(pos.x * 0.3 + t);
    float waveZ = cos(pos.z * 0.3 + t * 0.8);
    float noise = snoise(vec3(pos.x * 0.1, pos.z * 0.1, t * 0.5)) * 2.0;
    
    pos.y = waveX * waveZ * 1.5 + noise;
    vHeight = pos.y;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Scale point size based on depth and vertical height
    gl_PointSize = (12.0 + pos.y * 1.5) * (1.0 / -mvPosition.z);
  }
`;

const fragmentShader = `
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  varying float vHeight;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    // Soft circle with glowing center
    float alpha = pow(1.0 - (dist * 2.0), 1.5);
    
    // Color gradient based on wave height
    float t = clamp((vHeight + 2.0) / 4.0, 0.0, 1.0);
    vec3 colorA = mix(u_color1, u_color2, smoothstep(0.0, 0.5, t));
    vec3 finalColor = mix(colorA, u_color3, smoothstep(0.5, 1.0, t));
    
    // Fade out deeper waves
    alpha *= smoothstep(-3.0, 1.0, vHeight);

    gl_FragColor = vec4(finalColor, alpha * 0.85);
  }
`;

export function WaveGrid() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const width = 80;
  const depth = 60;
  const count = width * depth;
  const spacing = 0.5;

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    let i = 0;
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        pos[i++] = (x - width / 2) * spacing;
        pos[i++] = 0;
        pos[i++] = (z - depth / 2) * spacing - 10; // offset away from camera
      }
    }
    return [pos];
  }, [count, width, depth]);

  useColorPalette(materialRef);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
    if (pointsRef.current) {
      // Gently drift the whole grid rotation over time
      pointsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      pointsRef.current.rotation.x = Math.PI / 8; // Tilt slightly downward
    }
  });

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_color1: { value: new THREE.Color() },
    u_color2: { value: new THREE.Color() },
    u_color3: { value: new THREE.Color() },
  }), []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </points>
  );
}
