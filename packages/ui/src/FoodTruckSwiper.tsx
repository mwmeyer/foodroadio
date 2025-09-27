"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface FoodTruck {
  id: number;
  name: string;
  cuisine: string;
  city: string;
  lat: number;
  lng: number;
  icon: string;
  description: string;
}

interface FoodTruckSwiperProps {
  trucks: FoodTruck[];
  selectedTruck?: FoodTruck | null;
  onTruckSelect: (truck: FoodTruck) => void;
  onClose?: () => void;
  className?: string;
}

const FoodTruckSwiper: React.FC<FoodTruckSwiperProps> = ({
  trucks,
  selectedTruck,
  onTruckSelect,
  onClose,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set initial index based on selected truck
  useEffect(() => {
    if (selectedTruck) {
      const index = trucks.findIndex((truck) => truck.id === selectedTruck.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [selectedTruck, trucks]);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  }, []);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  }, []);

  // Handle touch/mouse move
  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      const diff = clientX - startX;
      const maxTranslate = 100;
      const clampedDiff = Math.max(-maxTranslate, Math.min(maxTranslate, diff));
      setTranslateX(clampedDiff);
    },
    [isDragging, startX],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX);
    },
    [handleMove],
  );

  // Handle touch/mouse end
  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    const threshold = 50;

    if (translateX > threshold && currentIndex > 0) {
      // Swipe right - go to previous
      setCurrentIndex(currentIndex - 1);
    } else if (translateX < -threshold && currentIndex < trucks.length - 1) {
      // Swipe left - go to next
      setCurrentIndex(currentIndex + 1);
    }

    setIsDragging(false);
    setTranslateX(0);
    setStartX(0);
  }, [isDragging, translateX, currentIndex, trucks.length]);

  // Navigation functions
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < trucks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Get directions URL
  const getDirectionsUrl = (truck: FoodTruck) => {
    return `http://maps.apple.com/?q=${encodeURIComponent(truck.name)}&ll=${truck.lat},${truck.lng}`;
  };

  if (trucks.length === 0) {
    return null;
  }

  const currentTruck = trucks[currentIndex];

  return (
    <div className={`relative ${className}`}>
      {/* Card Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-sm mx-auto bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Card Content */}
        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            {/* Food Truck Icon */}
            <div className="text-7xl mb-4">{currentTruck.icon}</div>

            {/* Food Truck Info */}
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {currentTruck.name}
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg text-orange-500 font-semibold">
                {currentTruck.cuisine}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{currentTruck.city}</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">
              {currentTruck.description}
            </p>

            {/* Action Button */}
            <div className="w-full">
              <a
                href={getDirectionsUrl(currentTruck)}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-3 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-center"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {trucks.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-all ${
              currentIndex === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={goToNext}
            disabled={currentIndex === trucks.length - 1}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-all ${
              currentIndex === trucks.length - 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Progress Indicators */}
      {trucks.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {trucks.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-orange-500 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

      {/* Swipe Instructions */}
      {trucks.length > 1 && (
        <p className="text-center text-sm text-gray-500 mt-2">
          Swipe or use arrows to browse • {currentIndex + 1} of {trucks.length}
        </p>
      )}
    </div>
  );
};

export default FoodTruckSwiper;
