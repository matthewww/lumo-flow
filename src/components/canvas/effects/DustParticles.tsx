import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useColorPalette } from './useColorPalette';

const vertexShader = `
  uniform float u_time;
  attribute vec3 a_random; // x: speed, y: drift, z: phase
  varying float vAlpha;
  varying vec3 vColor;
  
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;

  void main() {
    vec3 pos = position;
    
    // Upward drift
    pos.y += u_time * (a_random.x * 0.5 + 0.1);
    
    // Side drift
    pos.x += sin(u_time * 0.5 + a_random.z * 10.0) * a_random.y * 2.0;

    // Wrap around bounds seamlessly
    pos.y = mod(pos.y + 10.0, 20.0) - 10.0;
    pos.x = mod(pos.x + 15.0, 30.0) - 15.0;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Scale point size by distance and random multiplier
    gl_PointSize = (30.0 * a_random.x + 10.0) * (1.0 / -mvPosition.z);
    
    // Smooth alpha pulsing
    vAlpha = (sin(u_time * 2.0 * a_random.x + a_random.z * 20.0) * 0.5 + 0.5) * 0.8 + 0.1;
    // Fade out at upper & lower edges
    vAlpha *= smoothstep(10.0, 5.0, abs(pos.y)); 

    // Mix the palette down to per-particle colors
    float colorMix = a_random.x + a_random.y;
    vec3 mixedColor = mix(u_color1, u_color2, colorMix);
    vColor = mix(mixedColor, u_color3, a_random.z);
  }
`;

const fragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard; // make it a circle
    
    // Soft glowing falloff
    float strength = pow(1.0 - (dist * 2.0), 2.0);
    
    gl_FragColor = vec4(vColor, strength * vAlpha);
  }
`;

export function DustParticles() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const count = 4000;
  
  const [positions, randoms] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 2;

      rnd[i * 3] = Math.random();
      rnd[i * 3 + 1] = Math.random();
      rnd[i * 3 + 2] = Math.random();
    }
    return [pos, rnd];
  }, [count]);

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
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
        <bufferAttribute attach="attributes-a_random" count={count} array={randoms} itemSize={3} args={[randoms, 3]} />
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
