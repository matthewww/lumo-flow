import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDeckStore } from '../../../store/useDeckStore';
import { colorPalettes } from './colorPalettes';

/**
 * Shared hook that handles slide-driven color palette transitions.
 * Lerps material uniforms (u_color1, u_color2, u_color3) toward the
 * target palette each frame. Pass the shaderMaterial ref from your effect.
 */
export function useColorPalette(
  materialRef: React.RefObject<THREE.ShaderMaterial | null>,
  enabled = true,
) {
  const currentSlide = useDeckStore((state) => state.currentSlide);

  const currentColors = useRef({
    color1: new THREE.Color(),
    color2: new THREE.Color(),
    color3: new THREE.Color(),
  });

  const targetColors = useRef({
    color1: new THREE.Color(),
    color2: new THREE.Color(),
    color3: new THREE.Color(),
  });

  // Initialize to first palette
  useEffect(() => {
    if (!enabled || !materialRef.current) {
      return;
    }

    if (materialRef.current) {
      const palette = colorPalettes[0];
      currentColors.current.color1.copy(palette.color1);
      currentColors.current.color2.copy(palette.color2);
      currentColors.current.color3.copy(palette.color3);

      materialRef.current.uniforms.u_color1.value.copy(palette.color1);
      materialRef.current.uniforms.u_color2.value.copy(palette.color2);
      materialRef.current.uniforms.u_color3.value.copy(palette.color3);
    }
  }, [enabled, materialRef]);

  // Update target when slide changes
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const paletteIndex = currentSlide % colorPalettes.length;
    const palette = colorPalettes[paletteIndex];

    targetColors.current.color1.copy(palette.color1);
    targetColors.current.color2.copy(palette.color2);
    targetColors.current.color3.copy(palette.color3);
  }, [currentSlide, enabled]);

  // Lerp toward target each frame
  useFrame((_state, delta) => {
    if (!enabled || !materialRef.current) {
      return;
    }

    if (materialRef.current) {
      const lerpFactor = Math.min(delta * 0.8, 1.0);
      currentColors.current.color1.lerp(targetColors.current.color1, lerpFactor);
      currentColors.current.color2.lerp(targetColors.current.color2, lerpFactor);
      currentColors.current.color3.lerp(targetColors.current.color3, lerpFactor);

      materialRef.current.uniforms.u_color1.value.copy(currentColors.current.color1);
      materialRef.current.uniforms.u_color2.value.copy(currentColors.current.color2);
      materialRef.current.uniforms.u_color3.value.copy(currentColors.current.color3);
    }
  });
}
