
import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface SlideButtonProps {
  onComplete: () => void;
  text?: string;
  completedText?: string;
}

const SlideButton = ({ 
  onComplete, 
  text = "Slide to confirm", 
  completedText = "Confirmed!" 
}: SlideButtonProps) => {
  const [isComplete, setIsComplete] = useState(false);
  const [dragX, setDragX] = useState(0);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 200) {
      setIsComplete(true);
      onComplete();
    } else {
      setDragX(0);
    }
  };

  if (isComplete) {
    return (
      <div className="w-full h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
        <CheckCircle className="mr-2" size={24} />
        {completedText}
      </div>
    );
  }

  return (
    <div className="relative w-full h-16 bg-gray-200 rounded-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-semibold">
        {text}
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 250 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onDrag={(_, info) => setDragX(info.offset.x)}
        className="absolute left-2 top-2 w-12 h-12 bg-green-500 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center text-white shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileDrag={{ scale: 1.2 }}
      >
        <ArrowRight size={20} />
      </motion.div>
    </div>
  );
};

export default SlideButton;
