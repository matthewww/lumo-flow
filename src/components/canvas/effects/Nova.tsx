import { ImportedShaderPlane } from './ImportedShaderPlane';
import { novaShader } from './shaders/NovaShader';

export function Nova() {
  return <ImportedShaderPlane definition={novaShader} />;
}
