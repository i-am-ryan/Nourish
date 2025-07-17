
import React from 'react';
import { motion } from 'framer-motion';

interface VapourTextEffectProps {
  text: string;
  className?: string;
}

const VapourTextEffect = ({ text, className = "" }: VapourTextEffectProps) => {
  const words = text.split(' ');

  return (
    <div className={`${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-4">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={{ opacity: 0, y: 50, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.8,
                delay: (wordIndex * 0.1) + (charIndex * 0.05),
                ease: "easeOut"
              }}
              className="inline-block"
              style={{ transformOrigin: 'center bottom' }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
};

export default VapourTextEffect;
