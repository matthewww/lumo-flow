import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDeckStore } from '../../store/useDeckStore';

interface SlideDeckProps {
  slides: React.ReactNode[];
}

export const SlideDeck: React.FC<SlideDeckProps> = ({ slides }) => {
  const { currentSlide, setTotalSlides, isPlaying, slideDuration, nextSlide, prevSlide, togglePlay, nextEffect, prevEffect } = useDeckStore();

  // Set total slides on mount and when slides change
  useEffect(() => {
    setTotalSlides(slides.length);
  }, [slides.length, setTotalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
      else if (e.key === ' ') togglePlay();
      else if (e.key === '>' || e.key === '.') nextEffect();
      else if (e.key === '<' || e.key === ',') prevEffect();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, togglePlay, nextEffect, prevEffect]);

  // Auto-advance slides when playing
  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;

    const timer = setTimeout(() => {
      nextSlide();
    }, slideDuration);

    return () => clearTimeout(timer);
  }, [currentSlide, isPlaying, slideDuration, nextSlide, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-gray-400">No slides to display</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for sophisticated feel
          }}
          className="w-full h-full flex items-center justify-center"
        >
          {slides[currentSlide]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

