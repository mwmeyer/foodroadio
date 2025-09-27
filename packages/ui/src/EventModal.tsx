"use client";

import React from "react";

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

interface EventModalProps {
  event: Event;
  truck: FoodTruck;
  isOpen: boolean;
  onClose: () => void;
  onRSVP?: (event: Event, truck: FoodTruck) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  truck,
  isOpen,
  onClose,
  onRSVP,
}) => {
  if (!isOpen) return null;

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
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    try {
      const [time, modifier] = timeString.split(" ");
      const [hours, minutes] = time.split(":");
      return `${hours}:${minutes} ${modifier}`;
    } catch {
      return timeString;
    }
  };

  const handleRSVP = () => {
    if (onRSVP) {
      onRSVP(event, truck);
    }
  };

  const isFullyBooked = event.spotsLeft === 0;
  const isAlmostFull = event.spotsLeft <= 5 && event.spotsLeft > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-orange-400 to-yellow-400 p-6 text-white">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
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

          {/* Event Icon */}
          <div className="text-6xl mb-4 text-center">{event.image}</div>

          {/* Event Title */}
          <h2 className="text-2xl font-bold text-center mb-2">
            {event.title}
          </h2>

          {/* Event Type */}
          <div className="text-center">
            <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              {event.type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Food Truck Info */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{truck.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-800">{truck.name}</h3>
                <p className="text-sm text-gray-600">
                  {truck.cuisine} • {truck.city}
                </p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            {/* Date & Time */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {formatDate(event.date)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatTime(event.time)} • {event.duration}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {event.price === 0 ? "Free Event" : `$${event.price} per person`}
                </p>
                <p className="text-sm text-gray-600">
                  Payment required to secure your spot
                </p>
              </div>
            </div>

            {/* Capacity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {event.capacity - event.spotsLeft} of {event.capacity} spots taken
                </p>
                {isAlmostFull && (
                  <p className="text-sm text-orange-600 font-medium">
                    Only {event.spotsLeft} spots remaining!
                  </p>
                )}
                {isFullyBooked && (
                  <p className="text-sm text-red-600 font-medium">
                    This event is sold out
                  </p>
                )}
                {!isAlmostFull && !isFullyBooked && (
                  <p className="text-sm text-gray-600">
                    {event.spotsLeft} spots available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-2">About This Event</h4>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            {!isFullyBooked && (
              <button
                onClick={handleRSVP}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 ${
                  event.price === 0
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                }`}
              >
                {event.price === 0 ? "RSVP - It's Free!" : `Reserve Spot - $${event.price}`}
              </button>
            )}

            {isFullyBooked && (
              <button
                disabled
                className="w-full py-4 px-6 rounded-2xl font-semibold text-lg bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                Event Sold Out
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Event takes place at the food truck location
                </p>
                <p className="text-xs text-blue-600">
                  You'll receive location details and any updates via email after registering.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
