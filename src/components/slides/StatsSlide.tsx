import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface Stat {
  value: number;
  label: string;
  suffix?: string;
}

interface StatsSlideProps {
  title?: string;
  stats?: Stat[];
}

const defaultStats: Stat[] = [
  { value: 98, label: "Performance Score", suffix: "%" },
  { value: 150, label: "Animations", suffix: "+" },
  { value: 60, label: "FPS Rendering", suffix: "" },
];

const AnimatedNumber: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = "" }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
    });

    const unsubscribe = rounded.on('change', (latest) => {
      setDisplayValue(latest);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded]);

  return (
    <span>
      {displayValue}{suffix}
    </span>
  );
};

export const StatsSlide: React.FC<StatsSlideProps> = ({
  title = "By The Numbers",
  stats = defaultStats
}) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.5, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-16 px-8">
      <motion.h2 
        className="text-6xl font-bold font-outfit"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {title}
      </motion.h2>

      <motion.div 
        className="grid grid-cols-3 gap-16 w-full max-w-6xl"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            variants={item}
          >
            <div className="text-7xl font-bold font-outfit bg-gradient-to-br from-blue-400 to-purple-600 bg-clip-text text-transparent">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-xl text-gray-400 font-space text-center">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
