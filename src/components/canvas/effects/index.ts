import type { ComponentType } from 'react';
import type { BackgroundEffect } from '../../../store/useDeckStore';
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
 *  2. Import and register it here — TypeScript will error if the key isn't in BackgroundEffect
 *  3. Add its key to BackgroundEffect and BACKGROUND_EFFECTS in useDeckStore.ts
 */
export const effects: Record<BackgroundEffect, ComponentType> = {
  particles: DustParticles,
  fluid: FluidMesh,
  aurora: Aurora,
  nova: Nova,
  waveGrid: WaveGrid,
  morphingSphere: MorphingSphere,
};
