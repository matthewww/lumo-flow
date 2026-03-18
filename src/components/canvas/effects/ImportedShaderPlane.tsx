import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { simplexNoiseGLSL } from './glsl';
import type { ImportedShaderDefinition, ImportedShaderUniform, ShaderBlendMode, ShaderChunk, ShaderSide } from './importedShaderTypes';
import { useColorPalette } from './useColorPalette';
import { useShaderTextures } from './useShaderTextures';

const fullscreenVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const builtinFragmentUniformDeclarations = `
  uniform float u_time;
  uniform float u_time_delta;
  uniform int u_frame;
  uniform vec2 u_resolution;
  uniform vec4 u_date;
  uniform float u_refresh_rate;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
`;

function getChunkSource(chunk: ShaderChunk) {
  if (chunk === 'simplexNoise') {
    return simplexNoiseGLSL;
  }

  return '';
}

function getUniformType(uniform: ImportedShaderUniform) {
  return uniform.type;
}

function createUniformValue(uniform: ImportedShaderUniform) {
  switch (uniform.type) {
    case 'float':
    case 'int':
    case 'bool':
      return uniform.value;
    case 'vec2':
      return new THREE.Vector2(...uniform.value);
    case 'vec3':
      return new THREE.Vector3(...uniform.value);
    case 'vec4':
      return new THREE.Vector4(...uniform.value);
  }
}

function createUniforms(definition: ImportedShaderDefinition, textures: Record<string, THREE.Texture>) {
  const uniforms: Record<string, THREE.IUniform> = {
    u_time: { value: 0 },
    u_time_delta: { value: 0 },
    u_frame: { value: 0 },
    u_resolution: { value: new THREE.Vector2() },
    u_date: { value: new THREE.Vector4() },
    u_refresh_rate: { value: 60 },
    u_color1: { value: new THREE.Color(0xffffff) },
    u_color2: { value: new THREE.Color(0xffffff) },
    u_color3: { value: new THREE.Color(0xffffff) },
  };

  for (const [name, uniform] of Object.entries(definition.uniforms ?? {})) {
    uniforms[name] = { value: createUniformValue(uniform) };
  }

  for (const texture of definition.textures ?? []) {
    uniforms[texture.name] = { value: textures[texture.name] };
  }

  return uniforms;
}

function buildUniformDeclarations(definition: ImportedShaderDefinition) {
  const customUniformDeclarations = Object.entries(definition.uniforms ?? {})
    .map(([name, uniform]) => `uniform ${getUniformType(uniform)} ${name};`)
    .join('\n');

  const textureUniformDeclarations = (definition.textures ?? [])
    .map((texture) => `uniform sampler2D ${texture.name};`)
    .join('\n');

  return [builtinFragmentUniformDeclarations.trim(), customUniformDeclarations, textureUniformDeclarations]
    .filter(Boolean)
    .join('\n');
}

function buildFragmentShader(definition: ImportedShaderDefinition) {
  const chunkSource = (definition.chunks ?? [])
    .map(getChunkSource)
    .filter(Boolean)
    .join('\n\n');

  return `
    precision highp float;

    ${buildUniformDeclarations(definition)}
    ${chunkSource}

    ${definition.fragmentSource.trim()}
  `;
}

function getBlending(mode: ShaderBlendMode | undefined) {
  return mode === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending;
}

function getSide(side: ShaderSide | undefined) {
  return side === 'double' ? THREE.DoubleSide : THREE.FrontSide;
}

interface ImportedShaderPlaneProps {
  definition: ImportedShaderDefinition;
}

export function ImportedShaderPlane({ definition }: ImportedShaderPlaneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
  const frameRef = useRef(0);
  const resolution = useMemo(() => new THREE.Vector2(), []);
  const textures = useShaderTextures(definition.textures ?? []);
  const fragmentShader = useMemo(() => buildFragmentShader(definition), [definition]);

  if (uniformsRef.current === null) {
    uniformsRef.current = createUniforms(definition, textures);
  }

  useColorPalette(materialRef, definition.usesColorPalette ?? false);

  useEffect(() => {
    if (!materialRef.current) {
      return;
    }

    for (const texture of definition.textures ?? []) {
      materialRef.current.uniforms[texture.name].value = textures[texture.name];
    }
  }, [definition, textures]);

  useFrame((state, delta) => {
    if (!materialRef.current) {
      return;
    }

    state.gl.getDrawingBufferSize(resolution);

    const now = new Date();
    const secondsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
    const shaderUniforms = materialRef.current.uniforms;

    shaderUniforms.u_time.value = state.clock.elapsedTime;
    shaderUniforms.u_time_delta.value = delta;
    shaderUniforms.u_frame.value = frameRef.current;
    shaderUniforms.u_resolution.value.copy(resolution);
    shaderUniforms.u_date.value.set(now.getFullYear(), now.getMonth() + 1, now.getDate(), secondsSinceMidnight);
    shaderUniforms.u_refresh_rate.value = 60;

    frameRef.current += 1;
  });

  return (
    <mesh scale={definition.scale ?? [12, 12, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={fullscreenVertexShader}
        fragmentShader={fragmentShader}
        transparent={definition.transparent ?? true}
        depthWrite={definition.depthWrite ?? false}
        blending={getBlending(definition.blending)}
        side={getSide(definition.side)}
        uniforms={uniformsRef.current}
      />
    </mesh>
  );
}
