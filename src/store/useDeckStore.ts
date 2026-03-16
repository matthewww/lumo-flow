import { create } from 'zustand';

export type BackgroundEffect = 'fluid' | 'particles' | 'aurora' | 'waveGrid' | 'morphingSphere';

export const BACKGROUND_EFFECTS: BackgroundEffect[] = [
  'particles', 
  'fluid', 
  'aurora', 
  'waveGrid', 
  'morphingSphere'
];

interface DeckState {
  currentSlide: number;
  totalSlides: number;
  isPlaying: boolean;
  slideDuration: number;
  backgroundEffect: BackgroundEffect;
  
  setTotalSlides: (total: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setBackgroundEffect: (effect: BackgroundEffect) => void;
  nextEffect: () => void;
  prevEffect: () => void;
}

export const useDeckStore = create<DeckState>((set) => ({
  currentSlide: 0,
  totalSlides: 0,
  isPlaying: true,
  slideDuration: 8000,
  backgroundEffect: 'particles', 

  setTotalSlides: (total) => set({ totalSlides: total }),
  
  nextSlide: () => set((state) => ({
    currentSlide: (state.currentSlide + 1) % Math.max(1, state.totalSlides)
  })),
  
  prevSlide: () => set((state) => ({
    currentSlide: state.currentSlide === 0 
      ? Math.max(0, state.totalSlides - 1) 
      : state.currentSlide - 1
  })),
  
  goToSlide: (index) => set((state) => ({
    currentSlide: Math.min(Math.max(0, index), state.totalSlides - 1)
  })),
  
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setBackgroundEffect: (effect) => set({ backgroundEffect: effect }),
  
  nextEffect: () => set((state) => {
    const idx = BACKGROUND_EFFECTS.indexOf(state.backgroundEffect);
    const nextIdx = (idx + 1) % BACKGROUND_EFFECTS.length;
    return { backgroundEffect: BACKGROUND_EFFECTS[nextIdx] };
  }),
  
  prevEffect: () => set((state) => {
    const idx = BACKGROUND_EFFECTS.indexOf(state.backgroundEffect);
    const prevIdx = idx === 0 ? BACKGROUND_EFFECTS.length - 1 : idx - 1;
    return { backgroundEffect: BACKGROUND_EFFECTS[prevIdx] };
  }),
}));
