# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lumo Flow is a high-fidelity, self-playing digital signage application designed for public screens. It features generative WebGL backgrounds, high-end animations, and bold typography to transform informational screens into captivating digital art.

**Tech Stack:** React 18 + Vite + TypeScript, Framer Motion, React Three Fiber / Three.js, Tailwind CSS, Zustand

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run linter (ESLint with TypeScript support)
npm lint

# Preview production build
npm run preview
```

## Code Architecture

### High-Level Structure

The application follows a layered architecture with three primary concerns:

1. **State Management Layer** (`src/store/`) - Centralized slide deck state using Zustand
2. **Components Layer** (`src/components/`) - Divided into canvas (WebGL), deck (slide engine), and slides (content)
3. **Entry Point** (`src/App.tsx`) - Orchestrates the three layers together

### Key Architectural Patterns

**Zustand Store (`useDeckStore`)** - Single source of truth for:
- Current slide index and total slide count
- Playback state (playing/paused) with auto-advance on timer
- Slide duration (8000ms default)
- Background effect type (particles or fluid)

**Component Hierarchy:**
```
App
├── GenerativeBackground (Canvas with Three.js)
│   ├── DustParticles (shader-based particle system)
│   └── FluidMesh (simplex noise-based fluid effect)
├── SlideDeck (animation orchestrator)
└── ProgressBar (playback indicator)
```

### Slide System

- **SlideDeck** (`src/components/deck/SlideDeck.tsx`) manages slide transitions with Framer Motion animations and keyboard controls (Arrow Left/Right for navigation, Space for play/pause)
- Individual slide components (`src/components/slides/`) implement content layouts with staggered animations
- Slides are passed as React nodes to `SlideDeck`, enabling easy composition and extensibility

### Generative Backgrounds

**DustParticles** uses custom WebGL shaders with:
- Particle position attributes with velocity/drift/phase encoded in per-vertex data
- Time-based animation in vertex shader (upward drift, side oscillation, bounds wrapping)
- Color palette system with 5 predefined themes that transition smoothly when slides change
- Additive blending for a glowing effect

**FluidMesh** uses simplex noise with:
- Fractal Brownian Motion (5 octaves) for organic flowing patterns
- Three-color palette mixing based on noise values
- Edge glow and vignette effects for depth

Both background systems interpolate color palettes across slide transitions using `lerp` at 0.8 speed factor for smooth visual continuity.

## Important Development Notes

### TypeScript Configuration

- **Target:** ES2022 with DOM/DOM.Iterable lib
- **Strict Mode Enabled:** All strict type-checking flags are on, including `noUnusedLocals` and `noUnusedParameters`
- Remove unused imports/variables to avoid build errors
- Use `verbatimModuleSyntax` is enabled—be careful with type-only imports

### State Updates in Components

The Zustand store uses closure-based reducers. When updating derived state:
- Use callbacks from `useDeckStore()` selectors rather than direct state manipulation
- The `nextSlide()` and `prevSlide()` methods handle wrapping automatically
- Timer-based auto-advance in `SlideDeck` depends on `currentSlide` being in the dependency array

### WebGL/Three.js Patterns

- **Shader Uniforms:** Modified through refs (`materialRef.current.uniforms`) in `useFrame()` callbacks
- **Color Interpolation:** Uses `THREE.Color.lerp()` with a consistent lerp factor (0.8 per delta) to prevent jank
- **Particle Geometry:** Positions and random attributes are generated once with `useMemo` and passed to shader material
- **Buffer Attributes:** Attached via R3F's `<bufferAttribute>` with `itemSize` and `args` properties

### Tailwind CSS

- Config uses `@tailwindcss/postcss` v4.2.1 (newer PostCSS-based Tailwind)
- Typography uses `font-outfit` class (assumes font is loaded globally)
- Responsive classes and gradients are used extensively for slide layouts

### Framer Motion Patterns

- **AnimatePresence** wraps conditional content for exit animations
- **Container/Item Pattern:** Used in HeroSlide for staggered word animations with custom cubic-bezier easing
- Transitions use a consistent easing curve: `[0.22, 1, 0.36, 1]` for sophisticated motion feel
- Perspective is set on individual elements for 3D transform effects

## Adding New Slides

1. Create a new component in `src/components/slides/` (follow HeroSlide/InfoSlide naming)
2. Accept optional props for customization
3. Use Framer Motion variants for entrance animations
4. Export from `src/components/slides/index.ts`
5. Add to the slides array in `App.tsx`
6. Update `colorPalettes` in `GenerativeBackground.tsx` if a new theme is needed

## Key Files to Know

- `src/store/useDeckStore.ts` - All presentation state and slide navigation logic
- `src/components/deck/SlideDeck.tsx` - Keyboard handling, auto-advance timer, transition animations
- `src/components/canvas/GenerativeBackground.tsx` - All WebGL rendering, shader definitions, color palettes
- `vite.config.ts` - Minimal; only React plugin enabled
- `eslint.config.js` - Uses flat config with recommended presets plus React Hooks and Refresh plugins
