import type { ComponentType } from 'react';
import { DustParticles } from './DustParticles';
import { FluidMesh } from './FluidMesh';
import { Aurora } from './Aurora';
import { Nova } from './Nova';
import { WaveGrid } from './WaveGrid';
import { MorphingSphere } from './MorphingSphere';

/**
 * Registry of available background effects.
 *
 * To add a new effect:
 *  1. Create a component in this folder (use useColorPalette for palette transitions)
 *  2. Import and register it here
 *  3. Add its key to BackgroundEffect in useDeckStore.ts
 */
export const effects: Record<string, ComponentType> = {
  particles: DustParticles,
  fluid: FluidMesh,
  aurora: Aurora,
  nova: Nova,
  waveGrid: WaveGrid,
  morphingSphere: MorphingSphere,
};
