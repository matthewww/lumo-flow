import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const standardUniforms = [
  'u_resolution',
  'u_time',
  'u_time_delta',
  'u_frame',
  'u_date',
  'u_refresh_rate',
];

const interactiveUniforms = [
  'u_mouse',
  'u_drag',
  'u_scroll',
  'u_camera_pos',
  'u_camera_dir',
];

function printUsage() {
  console.error('Usage: node scripts\\extract-fragcoord-shader.mjs <input-html> <output-stem>');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractTemplateLiteral(source, variableName) {
  const match = source.match(new RegExp(`const\\s+${variableName}\\s*=\\s*\`([\\s\\S]*?)\`;`));

  if (!match) {
    throw new Error(`Could not find template literal "${variableName}" in FragCoord export.`);
  }

  return match[1];
}

function extractArrayLiteral(source, variableName) {
  const match = source.match(new RegExp(`const\\s+${variableName}\\s*=\\s*(\\[[\\s\\S]*?\\]);`));

  if (!match) {
    throw new Error(`Could not find array "${variableName}" in FragCoord export.`);
  }

  return vm.runInNewContext(match[1]);
}

function stripUniformDeclarations(shaderSource, uniformNames) {
  let nextSource = shaderSource;

  for (const uniformName of uniformNames) {
    const uniformPattern = new RegExp(`^\\s*uniform\\s+\\w+\\s+${escapeRegExp(uniformName)}\\s*;\\s*$`, 'gm');
    nextSource = nextSource.replace(uniformPattern, '');
  }

  return nextSource;
}

function ensureNoInteractiveUniformUsage(shaderSource) {
  const referencedUniforms = interactiveUniforms.filter((uniformName) => {
    return new RegExp(`\\b${escapeRegExp(uniformName)}\\b`).test(shaderSource);
  });

  if (referencedUniforms.length > 0) {
    throw new Error(
      `Shader still references interactive uniforms that are out of scope: ${referencedUniforms.join(', ')}.`,
    );
  }
}

function normalizeWhitespace(shaderSource) {
  return shaderSource
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeFragcoordShader(shaderSource, textureNames) {
  let nextSource = shaderSource.replace(/^\s*#version\s+300\s+es\s*$/gm, '');
  nextSource = nextSource.replace(/^\s*precision\s+\w+\s+\w+\s*;\s*$/gm, '');
  nextSource = nextSource.replace(/^\s*out\s+vec4\s+fragColor\s*;\s*$/gm, '');
  nextSource = stripUniformDeclarations(nextSource, [...standardUniforms, ...interactiveUniforms, ...textureNames]);

  ensureNoInteractiveUniformUsage(nextSource);

  if (/void\s+mainImage\s*\(/.test(nextSource) && !/void\s+main\s*\(/.test(nextSource)) {
    nextSource = `${nextSource.trim()}\n\nvoid main() {\n  mainImage(gl_FragColor, gl_FragCoord.xy);\n}`;
  } else {
    nextSource = nextSource.replace(/\bfragColor\b/g, 'gl_FragColor');
  }

  if (/\btexture\s*\(/.test(nextSource) && !/\bsampler(?:Cube|3D)\b/.test(nextSource)) {
    nextSource = nextSource.replace(/\btexture\s*\(/g, 'texture2D(');
  }

  return normalizeWhitespace(nextSource);
}

function toIdentifier(stem) {
  const parts = stem
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    throw new Error(`Output stem "${stem}" does not contain a valid identifier.`);
  }

  const [first, ...rest] = parts;
  return first.toLowerCase() + rest.map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase()).join('');
}

function serializeTextures(textureNames, textureUrls, textureFlipY, textureWrap, textureFilter, textureIsVideo) {
  if (textureNames.length !== textureUrls.length
    || textureNames.length !== textureFlipY.length
    || textureNames.length !== textureWrap.length
    || textureNames.length !== textureFilter.length
    || textureNames.length !== textureIsVideo.length) {
    throw new Error('FragCoord texture metadata arrays are not aligned.');
  }

  return textureNames.map((name, index) => {
    if (textureIsVideo[index]) {
      throw new Error(`Texture "${name}" is a video input. Video textures are not supported in this workflow.`);
    }

    const textureDefinition = {
      name,
      src: textureUrls[index],
      flipY: textureFlipY[index],
      wrap: textureWrap[index] ?? 'clamp',
      minFilter: textureFilter[index] ?? 'linear',
      magFilter: textureFilter[index] ?? 'linear',
    };

    return `    {
      name: ${JSON.stringify(textureDefinition.name)},
      src: ${JSON.stringify(textureDefinition.src)},
      flipY: ${textureDefinition.flipY ? 'true' : 'false'},
      wrap: ${JSON.stringify(textureDefinition.wrap)},
      minFilter: ${JSON.stringify(textureDefinition.minFilter)},
      magFilter: ${JSON.stringify(textureDefinition.magFilter)},
    }`;
  });
}

async function main() {
  const [inputPath, outputStem] = process.argv.slice(2);

  if (!inputPath || !outputStem) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const absoluteInputPath = path.resolve(inputPath);
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const outputDirectory = path.join(repoRoot, 'src', 'components', 'canvas', 'effects', 'shaders');
  const fragmentOutputPath = path.join(outputDirectory, `${outputStem}.frag`);
  const metadataOutputPath = path.join(outputDirectory, `${outputStem}Shader.ts`);
  const exportIdentifier = `${toIdentifier(outputStem)}Shader`;
  const source = await readFile(absoluteInputPath, 'utf8');

  const shaderSource = extractTemplateLiteral(source, 'userCode');
  const textureNames = extractArrayLiteral(source, 'texNames');
  const textureUrls = extractArrayLiteral(source, 'texUrls');
  const textureFlipY = extractArrayLiteral(source, 'texFlipY');
  const textureIsVideo = extractArrayLiteral(source, 'texIsVideo');
  const textureWrap = extractArrayLiteral(source, 'texWrap');
  const textureFilter = extractArrayLiteral(source, 'texFilter');
  const texture3DNames = extractArrayLiteral(source, 'tex3DNames');
  const textureCubeNames = extractArrayLiteral(source, 'texCubeNames');

  if (texture3DNames.length > 0 || textureCubeNames.length > 0) {
    throw new Error('Only sampler2D textures are supported by the current import workflow.');
  }

  const normalizedShader = normalizeFragcoordShader(shaderSource, textureNames);
  const serializedTextures = serializeTextures(
    textureNames,
    textureUrls,
    textureFlipY,
    textureWrap,
    textureFilter,
    textureIsVideo,
  );

  const metadataSource = `import type { ImportedShaderDefinition } from '../importedShaderTypes';
import fragmentSource from './${outputStem}.frag?raw';

export const ${exportIdentifier}: ImportedShaderDefinition = {
  fragmentSource,
  scale: [12, 12, 1],
  transparent: true,
  depthWrite: false,${serializedTextures.length > 0 ? `
  textures: [
${serializedTextures.join(',\n')}
  ],` : ''}
};
`;

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(fragmentOutputPath, `${normalizedShader}\n`);
  await writeFile(metadataOutputPath, metadataSource);

  console.log(`Wrote ${path.relative(repoRoot, fragmentOutputPath)} and ${path.relative(repoRoot, metadataOutputPath)}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
