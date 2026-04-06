import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface CompareSliderProps {
  before: string;
  after: string;
  className?: string;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({ before, after, className }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const position = ((x - rect.left) / rect.width) * 100;

    setSliderPosition(Math.min(Math.max(position, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full aspect-video overflow-hidden rounded-2xl cursor-col-resize select-none ${className}`}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* After Image (Background) */}
      <img 
        src={after} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />

      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={before} 
          alt="Before" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Slider Line */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-xl z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-0.5 h-3 bg-brand-400 rounded-full" />
            <div className="w-0.5 h-3 bg-brand-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md text-white text-xs font-medium rounded-full pointer-events-none">
        Original
      </div>
      <div className="absolute bottom-4 right-4 px-3 py-1 bg-brand-600/80 backdrop-blur-md text-white text-xs font-medium rounded-full pointer-events-none">
        Reimagined
      </div>
    </div>
  );
};
