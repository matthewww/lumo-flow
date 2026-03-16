import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Zap, Rocket } from 'lucide-react';

interface InfoSlideProps {
  title?: string;
  items?: Array<{ icon?: React.ReactNode; text: string }>;
}

const defaultItems = [
  { icon: <Sparkles className="w-6 h-6" />, text: "Beautiful generative backgrounds with particle effects" },
  { icon: <Zap className="w-6 h-6" />, text: "Smooth transitions powered by Framer Motion" },
  { icon: <Rocket className="w-6 h-6" />, text: "Full keyboard navigation and auto-play mode" },
  { icon: <CheckCircle2 className="w-6 h-6" />, text: "Built with React, TypeScript, and Tailwind CSS" },
];

export const InfoSlide: React.FC<InfoSlideProps> = ({
  title = "Key Features",
  items = defaultItems
}) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
      }
    }
  };

  return (
    <div className="flex flex-col justify-center px-24 max-w-5xl">
      <motion.h2 
        className="text-6xl font-bold font-outfit mb-4"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {title}
      </motion.h2>
      
      <motion.div 
        className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mb-12"
        initial={{ width: 0 }}
        animate={{ width: 128 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      />

      <motion.ul 
        className="space-y-8"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {items.map((listItem, idx) => (
          <motion.li 
            key={idx}
            className="flex items-start gap-4"
            variants={item}
          >
            <div className="text-blue-400 mt-1">
              {listItem.icon || <CheckCircle2 className="w-6 h-6" />}
            </div>
            <span className="text-2xl text-gray-300 font-space leading-relaxed">
              {listItem.text}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};
