import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDeckStore } from '../../store/useDeckStore';

export const ProgressBar: React.FC = () => {
  const { currentSlide, totalSlides, isPlaying, slideDuration } = useDeckStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) {
      setProgress(0);
      return;
    }

    // Reset progress when slide changes
    setProgress(0);

    const startTime = Date.now();
    const updateInterval = 16; // ~60fps

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / slideDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(timer);
      }
    }, updateInterval);

    return () => clearInterval(timer);
  }, [currentSlide, isPlaying, slideDuration]);

  if (totalSlides === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Progress bar container */}
      <div className="relative h-1 bg-white/10 backdrop-blur-sm">
        {/* Animated progress fill */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-4 right-4 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
        <span className="text-sm font-medium">
          {currentSlide + 1} / {totalSlides}
        </span>
      </div>
    </div>
  );
};
