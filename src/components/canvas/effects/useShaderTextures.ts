import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import type { ImportedShaderTexture } from './importedShaderTypes';

function toWrapMode(mode: ImportedShaderTexture['wrap']) {
  if (mode === 'repeat') {
    return THREE.RepeatWrapping;
  }

  if (mode === 'mirror') {
    return THREE.MirroredRepeatWrapping;
  }

  return THREE.ClampToEdgeWrapping;
}

function toFilterMode(mode: ImportedShaderTexture['minFilter'] | ImportedShaderTexture['magFilter']) {
  return mode === 'nearest' ? THREE.NearestFilter : THREE.LinearFilter;
}

function applyTextureOptions(texture: THREE.Texture, definition: ImportedShaderTexture) {
  texture.flipY = definition.flipY ?? false;
  texture.wrapS = toWrapMode(definition.wrap);
  texture.wrapT = toWrapMode(definition.wrap);
  texture.minFilter = toFilterMode(definition.minFilter);
  texture.magFilter = toFilterMode(definition.magFilter);
  texture.needsUpdate = true;
}

function createPlaceholderTexture(definition: ImportedShaderTexture) {
  const texture = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
  applyTextureOptions(texture, definition);
  return texture;
}

export function useShaderTextures(definitions: ImportedShaderTexture[]) {
  const placeholders = useMemo(() => {
    return Object.fromEntries(
      definitions.map((definition) => [definition.name, createPlaceholderTexture(definition)]),
    ) as Record<string, THREE.Texture>;
  }, [definitions]);

  const [loadedTextures, setLoadedTextures] = useState<Record<string, THREE.Texture>>({});

  useEffect(() => {
    setLoadedTextures({});

    if (definitions.length === 0) {
      return undefined;
    }

    const loader = new THREE.TextureLoader();
    const nextTextures: THREE.Texture[] = [];
    let cancelled = false;

    for (const definition of definitions) {
      loader.load(
        definition.src,
        (texture) => {
          applyTextureOptions(texture, definition);
          nextTextures.push(texture);

          if (!cancelled) {
            setLoadedTextures((current) => ({
              ...current,
              [definition.name]: texture,
            }));
          }
        },
        undefined,
        (error) => {
          console.error(`Failed to load shader texture "${definition.name}" from "${definition.src}".`, error);
        },
      );
    }

    return () => {
      cancelled = true;
      for (const texture of nextTextures) {
        texture.dispose();
      }
    };
  }, [definitions]);

  useEffect(() => {
    return () => {
      for (const texture of Object.values(placeholders)) {
        texture.dispose();
      }
    };
  }, [placeholders]);

  return useMemo(() => {
    const textures: Record<string, THREE.Texture> = {};

    for (const definition of definitions) {
      textures[definition.name] = loadedTextures[definition.name] ?? placeholders[definition.name];
    }

    return textures;
  }, [definitions, loadedTextures, placeholders]);
}
