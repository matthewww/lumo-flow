import type { ImportedShaderDefinition } from '../importedShaderTypes';
import fragmentSource from './aurora.frag?raw';

export const auroraShader: ImportedShaderDefinition = {
  fragmentSource,
  chunks: ['simplexNoise'],
  usesColorPalette: true,
  scale: [12, 12, 1],
  transparent: true,
  depthWrite: false,
};
