"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  confidence?: number;
}

export default function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  confidence,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => setContainerWidth(container.offsetWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-hero rounded-2xl p-3 relative overflow-hidden"
    >
      {/* Labels */}
      <div className="flex items-center justify-between px-2 mb-3">
        <span className="text-xs font-medium text-white/50 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/30" />
          Original
        </span>
        <span className="text-xs font-medium text-emerald-400/80 flex items-center gap-1.5">
          Processed
          <span className="w-2 h-2 rounded-full bg-emerald-400/50" />
        </span>
      </div>

      {/* Comparison container */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden cursor-col-resize select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onClick={handleClick}
        style={{ aspectRatio: "auto" }}
      >
        {/* After image (full width, behind) */}
        <img
          src={afterUrl}
          alt="Processed card"
          className="w-full h-auto block max-h-[60vh] object-contain mx-auto"
          draggable={false}
        />

        {/* Before image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeUrl}
            alt="Original card"
            className="w-full h-auto block max-h-[60vh] object-contain"
            style={{ width: `${containerWidth || 100}px`, maxWidth: "none" }}
            draggable={false}
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10 pointer-events-none"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          {/* Slider handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full slider-handle flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6l-4 6 4 6" />
              <path d="M16 6l4 6-4 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Confidence badge */}
      {confidence !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-3 flex items-center justify-center"
        >
          <div className="confidence-badge flex items-center gap-2 px-4 py-2 rounded-full">
            <div className="relative w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidence * 100}%` }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className={`absolute inset-y-0 left-0 rounded-full ${
                  confidence >= 0.8
                    ? "bg-emerald-400"
                    : confidence >= 0.5
                    ? "bg-amber-400"
                    : "bg-red-400"
                }`}
              />
            </div>
            <span className={`text-xs font-semibold ${
              confidence >= 0.8
                ? "text-emerald-400"
                : confidence >= 0.5
                ? "text-amber-400"
                : "text-red-400"
            }`}>
              {Math.round(confidence * 100)}% confidence
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
