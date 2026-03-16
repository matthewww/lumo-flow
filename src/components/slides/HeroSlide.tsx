import { motion } from 'framer-motion';

interface HeroSlideProps {
  title?: string;
  subtitle?: string;
}

export const HeroSlide: React.FC<HeroSlideProps> = ({
  title = "Lumo Flow",
  subtitle = "Beautiful, flowing presentations"
}) => {
  const words = title.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    }
  };

  const word = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -90
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-8">
      <motion.h1 
        className="text-8xl font-bold font-outfit text-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {words.map((w, i) => (
          <motion.span 
            key={i} 
            className="inline-block mr-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            variants={word}
            style={{ perspective: 1000 }}
          >
            {w}
          </motion.span>
        ))}
      </motion.h1>
      
      <motion.p 
        className="text-2xl text-gray-300 font-outfit"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
};
