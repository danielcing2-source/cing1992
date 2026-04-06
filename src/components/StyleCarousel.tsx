import React from 'react';
import { Style } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface StyleCarouselProps {
  styles: Style[];
  selectedStyle: Style | null;
  onSelect: (style: Style) => void;
  disabled?: boolean;
}

export const StyleCarousel: React.FC<StyleCarouselProps> = ({ 
  styles, 
  selectedStyle, 
  onSelect,
  disabled 
}) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
      {styles.map((style) => (
        <motion.button
          key={style.id}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(style)}
          disabled={disabled}
          className={cn(
            "flex-shrink-0 w-32 group transition-all duration-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className={cn(
            "relative aspect-[4/5] rounded-2xl overflow-hidden mb-2 border-2 transition-all duration-300",
            selectedStyle?.id === style.id 
              ? "border-brand-600 ring-4 ring-brand-100" 
              : "border-transparent group-hover:border-brand-300"
          )}>
            <img 
              src={style.image} 
              alt={style.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className={cn(
            "text-xs font-medium text-center transition-colors",
            selectedStyle?.id === style.id ? "text-brand-900" : "text-brand-500"
          )}>
            {style.name}
          </p>
        </motion.button>
      ))}
    </div>
  );
};
