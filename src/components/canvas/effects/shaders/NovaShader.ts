import type { ImportedShaderDefinition } from '../importedShaderTypes';
import fragmentSource from './Nova.frag?raw';

export const novaShader: ImportedShaderDefinition = {
  fragmentSource,
  scale: [12, 12, 1],
  transparent: true,
  depthWrite: false,
};
