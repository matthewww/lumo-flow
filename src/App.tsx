import { useMemo } from 'react';
import { GenerativeBackground } from './components/canvas/GenerativeBackground';
import { SlideDeck } from './components/deck/SlideDeck';
import { ProgressBar } from './components/deck/ProgressBar';
import { HeroSlide, InfoSlide, StatsSlide } from './components/slides';

function App() {
  const slides = useMemo(() => [
    <HeroSlide key="hero" />,
    <InfoSlide key="info" />,
    <StatsSlide key="stats" />,
  ], []);

  return (
    <div className="relative w-screen h-screen bg-black text-white font-outfit overflow-hidden">
      {/* Generative background layer */}
      <div className="absolute inset-0 z-0">
        <GenerativeBackground />
      </div>

      {/* Content layer */}
      <div className="relative z-10 w-full h-full">
        <SlideDeck slides={slides} />
      </div>

      {/* Progress bar overlay */}
      <ProgressBar />
    </div>
  );
}

export default App;
