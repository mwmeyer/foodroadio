"use client";

import React, { useState, useEffect, useRef } from "react";
import foodTruckData from "../data/foodTruckData.json";
import type { LeafletMapRef } from "@repo/ui";
import MapWrapper from "../components/MapWrapper";

// Define types for food truck data
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

interface SearchOption {
  id: string;
  name: string;
  emoji: string;
}

export default function FoodTruckFinder() {
  // Food truck data imported from JSON file
  const foodTrucks: FoodTruck[] = foodTruckData;

  // State management
  const [showSearchOverlay, setShowSearchOverlay] = useState(true);
  const [selectedTruck, setSelectedTruck] = useState<FoodTruck | null>(null);
  const [searchTab, setSearchTab] = useState<"cuisine" | "city">("cuisine");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [overlayError, setOverlayError] = useState("");
  const [geolocateLoading, setGeolocateLoading] = useState(false);
  const [currentTrucks, setCurrentTrucks] = useState<FoodTruck[]>(foodTrucks);
  const [showMapPrompt, setShowMapPrompt] = useState(true);

  // Refs
  const mapRef = useRef<LeafletMapRef>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search data
  const searchData = {
    cuisine: Array.from(new Set(foodTrucks.map((t) => t.cuisine))).map((c) => ({
      id: c.toLowerCase().replace(" ", "-"),
      name: c,
      emoji: (foodTrucks.find((t) => t.cuisine === c) || {}).icon || "🍽️",
    })),
    city: Array.from(new Set(foodTrucks.map((t) => t.city))).map((c) => ({
      id: c.toLowerCase().replace(" ", "-"),
      name: c,
      emoji: "🇺🇸",
    })),
  };

  // Handle truck selection
  const handleTruckClick = (truck: FoodTruck) => {
    setSelectedTruck(truck);
    setShowMapPrompt(false);

    if (mapRef.current) {
      mapRef.current.flyTo(truck.lat, truck.lng, 14);
    }
  };

  // Handle map click
  const handleMapClick = () => {
    setSelectedTruck(null);
    setShowMapPrompt(true);
  };

  // Handle search option selection
  const selectOption = (option: SearchOption) => {
    setIsDropdownOpen(false);
    const filteredTrucks = foodTrucks.filter(
      (truck) => truck[searchTab] === option.name,
    );
    console.log(
      "Selected option:",
      option.name,
      "Found trucks:",
      filteredTrucks.length,
    );
    setCurrentTrucks(filteredTrucks);
    setShowSearchOverlay(false);
    setShowMapPrompt(filteredTrucks.length > 0);

    if (filteredTrucks.length > 0 && mapRef.current) {
      mapRef.current.fitBounds(filteredTrucks);
    }
  };

  // Handle geolocation
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setOverlayError("Geolocation is not supported by your browser.");
      return;
    }

    setGeolocateLoading(true);
    setOverlayError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.flyTo(latitude, longitude, 13);
        }
        setCurrentTrucks(foodTrucks);
        setShowSearchOverlay(false);
        setShowMapPrompt(true);
        setGeolocateLoading(false);
      },
      (error) => {
        let message = "Could not get your location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Please allow location access to use this feature.";
        }
        setOverlayError(message);
        setGeolocateLoading(false);
      },
    );
  };

  // Filter options based on search
  const getFilteredOptions = () => {
    const data = searchData[searchTab];
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase()),
    );
  };

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  console.log(
    "Rendering with trucks:",
    currentTrucks.length,
    "showSearchOverlay:",
    showSearchOverlay,
  );

  return (
    <>
      {/* Leaflet Map Container */}
      <MapWrapper
        ref={mapRef}
        trucks={currentTrucks}
        selectedTruck={selectedTruck}
        onTruckClick={handleTruckClick}
        onMapClick={handleMapClick}
        className="absolute top-0 left-0 w-full h-full z-[1]"
      />

      {/* Initial Search Overlay */}
      {showSearchOverlay && (
        <div className="relative flex flex-col items-center justify-center w-full h-screen z-20 p-4 bg-black/60">
          <div className="w-full max-w-4xl text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg mb-4">
              Find Your Next Craving
            </h1>
            <p className="text-lg md:text-xl text-gray-200 drop-shadow-md mb-8">
              Discover the best food trucks in your city.
            </p>

            <div className="w-full mb-6 max-w-xl mx-auto space-y-4">
              {/* Search Component */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between p-4 text-lg text-left bg-white/90 border border-gray-300 rounded-full shadow-lg hover:border-orange-400 focus:ring-4 focus:ring-orange-300 focus:outline-none backdrop-blur-sm transition"
                >
                  <span className="text-gray-500">
                    <span className="mr-2">🔎</span> Search Cuisine or City...
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-2">
                      {/* Tab Navigation */}
                      <div className="flex mb-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setSearchTab("cuisine")}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            searchTab === "cuisine"
                              ? "bg-white text-orange-600 shadow-sm"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          🍕 Cuisine
                        </button>
                        <button
                          onClick={() => setSearchTab("city")}
                          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            searchTab === "city"
                              ? "bg-white text-orange-600 shadow-sm"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          🏙️ City
                        </button>
                      </div>

                      {/* Search Input */}
                      <div className="relative p-1">
                        <svg
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto">
                      {getFilteredOptions().length > 0 ? (
                        getFilteredOptions().map((item) => (
                          <button
                            key={item.id}
                            onClick={() => selectOption(item)}
                            className="w-full flex items-center space-x-3 p-3.5 text-left text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors"
                          >
                            <span className="text-xl">{item.emoji}</span>
                            <span className="font-medium">{item.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No results found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-400"></div>
                <span className="flex-shrink mx-4 text-gray-200 font-semibold">
                  OR
                </span>
                <div className="flex-grow border-t border-gray-400"></div>
              </div>

              {/* Geolocation */}
              <div>
                <button
                  onClick={handleGeolocation}
                  disabled={geolocateLoading}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none transition transform hover:scale-105 disabled:bg-blue-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    {geolocateLoading ? "Finding you..." : "Trucks Near Me"}
                  </span>
                </button>
              </div>

              {/* Show All Trucks Button */}
              <div>
                <button
                  onClick={() => {
                    console.log(
                      "Show all trucks clicked, total:",
                      foodTrucks.length,
                    );
                    setCurrentTrucks(foodTrucks);
                    setShowSearchOverlay(false);
                    setShowMapPrompt(true);
                    // Fit bounds after map is ready
                    setTimeout(() => {
                      if (mapRef.current) {
                        mapRef.current.fitBounds(foodTrucks);
                      }
                    }, 100);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none transition transform hover:scale-105"
                >
                  <span className="text-xl">🗺️</span>
                  <span>Show All Trucks</span>
                </button>
              </div>

              {overlayError && (
                <p className="text-red-400 text-center mt-2 font-semibold drop-shadow-md">
                  {overlayError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map UI (shown when not on search overlay) */}
      {!showSearchOverlay && (
        <div className="relative z-10 flex flex-col items-center justify-center h-screen p-4 pointer-events-none">
          {/* Card Container */}
          <div className="relative w-full max-w-sm pointer-events-auto">
            {selectedTruck && (
              <div className="card relative w-full min-h-[22rem] bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center">
                <button
                  onClick={() => {
                    setSelectedTruck(null);
                    setShowMapPrompt(true);
                  }}
                  className="absolute top-4 right-5 text-gray-500 hover:text-gray-800 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="flex-grow flex flex-col items-center justify-center w-full">
                  <p className="text-7xl">{selectedTruck.icon}</p>
                  <h2 className="text-3xl font-bold text-gray-800 mt-4">
                    {selectedTruck.name}
                  </h2>
                  <p className="text-lg text-orange-500 font-semibold">
                    {selectedTruck.cuisine}
                  </p>
                  <p className="text-gray-600 mt-3 px-2 leading-relaxed">
                    {selectedTruck.description}
                  </p>
                </div>
                <a
                  href={`http://maps.apple.com/?q=${encodeURIComponent(selectedTruck.name)}&ll=${selectedTruck.lat},${selectedTruck.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none transition transform hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                  Get Directions
                </a>
              </div>
            )}
          </div>

          {showMapPrompt && (
            <p className="absolute bottom-10 text-white text-xl font-bold text-center drop-shadow-lg bg-black/50 px-4 py-2 rounded-full">
              Click a truck to see details
            </p>
          )}

          {currentTrucks.length === 0 && (
            <p className="text-white text-2xl font-bold text-center drop-shadow-lg">
              No trucks found. <br />
              <br />
              <button
                onClick={() => setShowSearchOverlay(true)}
                className="text-lg font-bold text-white bg-orange-600 rounded-full shadow-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 focus:outline-none transition duration-300 transform hover:scale-105 px-6 py-3 pointer-events-auto"
              >
                New Search
              </button>
            </p>
          )}

          <button
            onClick={() => setShowSearchOverlay(true)}
            className="absolute top-4 left-4 z-20 px-5 py-2 text-base font-semibold text-gray-800 bg-white/80 rounded-full shadow-md hover:bg-white/95 backdrop-blur-sm transition transform hover:scale-105 pointer-events-auto"
          >
            ← New Search
          </button>
        </div>
      )}
    </>
  );
}
