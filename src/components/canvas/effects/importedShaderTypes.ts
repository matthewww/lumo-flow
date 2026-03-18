export type ShaderChunk = 'simplexNoise';

export type ShaderBlendMode = 'normal' | 'additive';

export type ShaderSide = 'front' | 'double';

export type ImportedShaderUniform =
  | { type: 'float'; value: number }
  | { type: 'int'; value: number }
  | { type: 'bool'; value: boolean }
  | { type: 'vec2'; value: [number, number] }
  | { type: 'vec3'; value: [number, number, number] }
  | { type: 'vec4'; value: [number, number, number, number] };

export interface ImportedShaderTexture {
  name: string;
  src: string;
  flipY?: boolean;
  wrap?: 'clamp' | 'repeat' | 'mirror';
  minFilter?: 'linear' | 'nearest';
  magFilter?: 'linear' | 'nearest';
}

export interface ImportedShaderDefinition {
  fragmentSource: string;
  chunks?: ShaderChunk[];
  usesColorPalette?: boolean;
  uniforms?: Record<string, ImportedShaderUniform>;
  textures?: ImportedShaderTexture[];
  scale?: [number, number, number];
  transparent?: boolean;
  depthWrite?: boolean;
  blending?: ShaderBlendMode;
  side?: ShaderSide;
}
