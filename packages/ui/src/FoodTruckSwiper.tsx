"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface Event {
  id: number;
  title: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  description: string;
  price: number;
  capacity: number;
  spotsLeft: number;
  image: string;
}

interface FoodTruck {
  id: number;
  name: string;
  cuisine: string;
  city: string;
  lat: number;
  lng: number;
  icon: string;
  description: string;
  events?: Event[];
}

interface FoodTruckSwiperProps {
  trucks: FoodTruck[];
  selectedTruck?: FoodTruck | null;
  onTruckSelect: (truck: FoodTruck) => void;
  onClose?: () => void;
  onEventClick?: (event: Event, truck: FoodTruck) => void;
  className?: string;
}

const FoodTruckSwiper: React.FC<FoodTruckSwiperProps> = ({
  trucks,
  selectedTruck,
  onTruckSelect,
  onClose,
  onEventClick,
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Get upcoming events (extended for demo - next 30 days)
  const getUpcomingEvents = (truck: FoodTruck) => {
    if (!truck.events) {
      return [];
    }

    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30); // Extended to 30 days for demo

    return truck.events
      .filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= nextMonth;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3); // Show max 3 upcoming events
  };

  if (trucks.length === 0) {
    return null;
  }

  const currentTruck = trucks[currentIndex];
  const upcomingEvents = getUpcomingEvents(currentTruck);

  return (
    <div className={`relative ${className}`}>
      {/* Card Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-sm mx-auto bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
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
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Food Truck Icon */}
            <div className="text-6xl mb-4">{currentTruck.icon}</div>

            {/* Food Truck Info */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentTruck.name}
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg text-orange-500 font-semibold">
                {currentTruck.cuisine}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{currentTruck.city}</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6 text-sm">
              {currentTruck.description}
            </p>

            {/* Events Section */}
            {upcomingEvents.length > 0 && (
              <div className="w-full mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>🎉</span>
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event, currentTruck)}
                      className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-3 cursor-pointer hover:shadow-md transition-all hover:scale-105"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0 mt-1">
                          {event.image}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-1">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                            <span className="font-medium text-orange-600">
                              {formatDate(event.date)}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>{event.time}</span>
                            {event.price > 0 && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-green-600 font-medium">
                                  ${event.price}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 bg-white/70 px-2 py-1 rounded-full">
                              {event.type}
                            </span>
                            {event.spotsLeft <= 5 && event.spotsLeft > 0 && (
                              <span className="text-xs text-red-600 font-medium">
                                Only {event.spotsLeft} spots left!
                              </span>
                            )}
                            {event.spotsLeft === 0 && (
                              <span className="text-xs text-red-600 font-medium">
                                Sold Out
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {currentTruck.events && currentTruck.events.length > 3 && (
                  <button className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium">
                    View All Events ({currentTruck.events.length})
                  </button>
                )}
              </div>
            )}

            {/* No Events Message */}
            {(!currentTruck.events || currentTruck.events.length === 0) && (
              <div className="w-full mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-sm">
                  No upcoming events scheduled yet. Check back soon!
                </p>
              </div>
            )}

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
