import { ImportedShaderPlane } from './ImportedShaderPlane';
import { auroraShader } from './shaders/AuroraShader';

export function Aurora() {
  return <ImportedShaderPlane definition={auroraShader} />;
}
