"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FoodTruck {
  id: number;
  name: string;
  cuisine: string;
  city: string;
  lat: number;
  lng: number;
  icon: string;
  description: string;
  claimed?: boolean;
  operatorId?: string;
}

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

interface ClaimedTruck extends FoodTruck {
  events: Event[];
}

export default function OperatorDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [operatorName, setOperatorName] = useState("");
  const [claimedTrucks, setClaimedTrucks] = useState<ClaimedTruck[]>([]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddTruckModal, setShowAddTruckModal] = useState(false);
  const [selectedTruckForEvent, setSelectedTruckForEvent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Login form state
  const [loginName, setLoginName] = useState("");

  // New truck form state
  const [newTruckForm, setNewTruckForm] = useState({
    name: "",
    cuisine: "",
    city: "",
    lat: 0,
    lng: 0,
    icon: "🍽️",
    description: "",
  });

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    type: "Cooking Class",
    date: "",
    time: "",
    duration: "",
    description: "",
    price: 0,
    capacity: 10,
    image: "🍳",
  });

  useEffect(() => {
    // Check if user is authenticated
    const operatorId = localStorage.getItem("operatorId");
    const storedOperatorName = localStorage.getItem("operatorName");
    
    if (operatorId && storedOperatorName) {
      setIsAuthenticated(true);
      setOperatorName(storedOperatorName);
      loadClaimedTrucks(operatorId);
    }
    setIsLoading(false);
  }, []);

  const loadClaimedTrucks = (operatorId: string) => {
    const claims = JSON.parse(localStorage.getItem("truckClaims") || "{}");
    const events = JSON.parse(localStorage.getItem("truckEvents") || "{}");
    const customTrucks = JSON.parse(localStorage.getItem("customTrucks") || "[]");
    
    const operatorTrucks = Object.entries(claims)
      .filter(([_, claim]: [string, any]) => claim.operatorId === operatorId)
      .map(([truckId, claim]: [string, any]) => ({
        ...claim.truck,
        events: events[truckId] || [],
      }));
    
    // Also include custom trucks created by this operator
    const operatorCustomTrucks = customTrucks
      .filter((truck: any) => truck.operatorId === operatorId)
      .map((truck: any) => ({
        ...truck,
        events: events[truck.id] || [],
      }));
    
    setClaimedTrucks([...operatorTrucks, ...operatorCustomTrucks]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginName.trim()) {
      const operatorId = `operator_${Date.now()}`;
      localStorage.setItem("operatorId", operatorId);
      localStorage.setItem("operatorName", loginName);
      setOperatorName(loginName);
      setIsAuthenticated(true);
      loadClaimedTrucks(operatorId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("operatorId");
    localStorage.removeItem("operatorName");
    setIsAuthenticated(false);
    setOperatorName("");
    setClaimedTrucks([]);
  };

  const handleClaimTruck = (truck: FoodTruck) => {
    const operatorId = localStorage.getItem("operatorId");
    if (!operatorId) return;

    const claims = JSON.parse(localStorage.getItem("truckClaims") || "{}");
    claims[truck.id] = {
      operatorId,
      truck,
      claimedAt: new Date().toISOString(),
    };
    localStorage.setItem("truckClaims", JSON.stringify(claims));
    
    loadClaimedTrucks(operatorId);
    setShowClaimModal(false);
  };

  const handleAddNewTruck = (e: React.FormEvent) => {
    e.preventDefault();
    const operatorId = localStorage.getItem("operatorId");
    if (!operatorId) return;

    const customTrucks = JSON.parse(localStorage.getItem("customTrucks") || "[]");
    const newTruck = {
      id: Date.now(),
      ...newTruckForm,
      operatorId,
      createdAt: new Date().toISOString(),
    };

    customTrucks.push(newTruck);
    localStorage.setItem("customTrucks", JSON.stringify(customTrucks));

    // Reset form
    setNewTruckForm({
      name: "",
      cuisine: "",
      city: "",
      lat: 0,
      lng: 0,
      icon: "🍽️",
      description: "",
    });
    setShowAddTruckModal(false);
    loadClaimedTrucks(operatorId);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTruckForEvent === null) return;

    const events = JSON.parse(localStorage.getItem("truckEvents") || "{}");
    const truckEvents = events[selectedTruckForEvent] || [];
    
    const newEvent: Event = {
      id: Date.now(),
      ...eventForm,
      spotsLeft: eventForm.capacity,
    };

    truckEvents.push(newEvent);
    events[selectedTruckForEvent] = truckEvents;
    localStorage.setItem("truckEvents", JSON.stringify(events));

    const operatorId = localStorage.getItem("operatorId");
    if (operatorId) {
      loadClaimedTrucks(operatorId);
    }

    // Reset form
    setEventForm({
      title: "",
      type: "Cooking Class",
      date: "",
      time: "",
      duration: "",
      description: "",
      price: 0,
      capacity: 10,
      image: "🍳",
    });
    setShowEventModal(false);
    setSelectedTruckForEvent(null);
  };

  const handleDeleteEvent = (truckId: number, eventId: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const events = JSON.parse(localStorage.getItem("truckEvents") || "{}");
    const truckEvents = events[truckId] || [];
    events[truckId] = truckEvents.filter((e: Event) => e.id !== eventId);
    localStorage.setItem("truckEvents", JSON.stringify(events));

    const operatorId = localStorage.getItem("operatorId");
    if (operatorId) {
      loadClaimedTrucks(operatorId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🚚 FoodRoadio</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Operator Portal</h2>
            <p className="text-gray-600">Manage your food truck and events</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Main App
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Demo Mode:</strong> This is a simplified authentication. 
              Enter any name to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🚚 FoodRoadio Operator Portal</h1>
            <p className="text-gray-400">Welcome back, {operatorName}!</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              View Map
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setShowClaimModal(true)}
            className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition font-semibold shadow-lg"
          >
            + Claim Existing Truck
          </button>
          <button
            onClick={() => setShowAddTruckModal(true)}
            className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold shadow-lg"
          >
            + Add New Truck
          </button>
        </div>

        {/* Claimed Trucks */}
        {claimedTrucks.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🚚</div>
            <h2 className="text-2xl font-bold mb-2">No Trucks Claimed Yet</h2>
            <p className="text-gray-400 mb-6">
              Start by claiming a food truck to manage its events and information.
            </p>
            <button
              onClick={() => setShowClaimModal(true)}
              className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Claim Your First Truck
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {claimedTrucks.map((truck) => (
              <div key={truck.id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      {truck.icon} {truck.name}
                    </h2>
                    <p className="text-gray-400">
                      {truck.cuisine} • {truck.city}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTruckForEvent(truck.id);
                      setShowEventModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    + Add Event
                  </button>
                </div>

                {/* Events */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-3">Events</h3>
                  {truck.events.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">
                      No events yet. Add your first event!
                    </p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {truck.events.map((event) => (
                        <div
                          key={event.id}
                          className="bg-gray-700 rounded-lg p-4 relative"
                        >
                          <button
                            onClick={() => handleDeleteEvent(truck.id, event.id)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                            title="Delete event"
                          >
                            ✕
                          </button>
                          <div className="text-3xl mb-2">{event.image}</div>
                          <h4 className="font-semibold mb-1">{event.title}</h4>
                          <p className="text-sm text-gray-400 mb-2">{event.type}</p>
                          <p className="text-sm text-gray-300 mb-2">
                            📅 {event.date} at {event.time}
                          </p>
                          <p className="text-sm text-gray-300 mb-2">
                            ⏱️ {event.duration}
                          </p>
                          <p className="text-sm text-gray-300 mb-2">
                            👥 {event.spotsLeft}/{event.capacity} spots left
                          </p>
                          <p className="text-sm text-green-400 font-semibold">
                            {event.price === 0 ? "Free" : `$${event.price}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claim Truck Modal */}
      {showClaimModal && (
        <ClaimTruckModal
          onClose={() => setShowClaimModal(false)}
          onClaim={handleClaimTruck}
        />
      )}

      {/* Add New Truck Modal */}
      {showAddTruckModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Food Truck</h2>
              <button
                onClick={() => setShowAddTruckModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewTruck} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Truck Name *</label>
                <input
                  type="text"
                  value={newTruckForm.name}
                  onChange={(e) => setNewTruckForm({ ...newTruckForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., My Amazing Tacos"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cuisine *</label>
                  <input
                    type="text"
                    value={newTruckForm.cuisine}
                    onChange={(e) => setNewTruckForm({ ...newTruckForm, cuisine: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="e.g., Mexican"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    value={newTruckForm.city}
                    onChange={(e) => setNewTruckForm({ ...newTruckForm, city: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="e.g., Los Angeles"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={newTruckForm.lat}
                    onChange={(e) => setNewTruckForm({ ...newTruckForm, lat: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="e.g., 34.0522"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={newTruckForm.lng}
                    onChange={(e) => setNewTruckForm({ ...newTruckForm, lng: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="e.g., -118.2437"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Icon/Emoji *</label>
                <select
                  value={newTruckForm.icon}
                  onChange={(e) => setNewTruckForm({ ...newTruckForm, icon: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="🍽️">🍽️ General</option>
                  <option value="🌮">🌮 Tacos</option>
                  <option value="🍕">🍕 Pizza</option>
                  <option value="🍔">🍔 Burgers</option>
                  <option value="🍗">🍗 Chicken</option>
                  <option value="🦐">🦐 Seafood</option>
                  <option value="🥙">🥙 Middle Eastern</option>
                  <option value="🍜">🍜 Noodles</option>
                  <option value="🍱">🍱 Asian</option>
                  <option value="🌯">🌯 Wraps</option>
                  <option value="🥟">🥟 Dumplings</option>
                  <option value="🌶️">🌶️ Spicy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={newTruckForm.description}
                  onChange={(e) => setNewTruckForm({ ...newTruckForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Describe your food truck..."
                />
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm">
                <p className="text-blue-300">
                  <strong>Tip:</strong> Use{" "}
                  <a
                    href="https://www.latlong.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-200"
                  >
                    latlong.net
                  </a>
                  {" "}to find coordinates for your truck&apos;s location.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Add Truck
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTruckModal(false)}
                  className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Event</h2>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedTruckForEvent(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Title *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Event Type *</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Cooking Class</option>
                    <option>Live Music</option>
                    <option>Trivia</option>
                    <option>Workshop</option>
                    <option>Demo</option>
                    <option>Tasting</option>
                    <option>Family Event</option>
                    <option>Cultural Event</option>
                    <option>Dance Party</option>
                    <option>Educational</option>
                    <option>Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Emoji *</label>
                  <select
                    value={eventForm.image}
                    onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="🍳">🍳 Cooking</option>
                    <option value="🎵">🎵 Music</option>
                    <option value="🧠">🧠 Trivia</option>
                    <option value="🔥">🔥 Demo</option>
                    <option value="🍷">🍷 Tasting</option>
                    <option value="🎲">🎲 Games</option>
                    <option value="🎭">🎭 Cultural</option>
                    <option value="💃">💃 Dance</option>
                    <option value="📚">📚 Educational</option>
                    <option value="🧘‍♀️">🧘‍♀️ Wellness</option>
                    <option value="🎉">🎉 Party</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Time *</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration *</label>
                <input
                  type="text"
                  value={eventForm.duration}
                  onChange={(e) => setEventForm({ ...eventForm, duration: e.target.value })}
                  placeholder="e.g., 2 hours"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price ($) *</label>
                  <input
                    type="number"
                    value={eventForm.price}
                    onChange={(e) => setEventForm({ ...eventForm, price: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Capacity *</label>
                  <input
                    type="number"
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: Number(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Add Event
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedTruckForEvent(null);
                  }}
                  className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Claim Truck Modal Component
function ClaimTruckModal({
  onClose,
  onClaim,
}: {
  onClose: () => void;
  onClaim: (truck: FoodTruck) => void;
}) {
  const [availableTrucks, setAvailableTrucks] = useState<FoodTruck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load available trucks from JSON
    import("../../data/foodTruckData.json").then((data) => {
      const claims = JSON.parse(localStorage.getItem("truckClaims") || "{}");
      const operatorId = localStorage.getItem("operatorId");
      
      // Filter out already claimed trucks by this operator
      const available = data.default.filter(
        (truck: FoodTruck) => !claims[truck.id] || claims[truck.id].operatorId !== operatorId
      );
      setAvailableTrucks(available);
    });
  }, []);

  const filteredTrucks = availableTrucks.filter(
    (truck) =>
      truck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Claim a Food Truck</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, cuisine, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredTrucks.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-400">
              No trucks available to claim.
            </div>
          ) : (
            filteredTrucks.map((truck) => (
              <div
                key={truck.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition cursor-pointer"
                onClick={() => onClaim(truck)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">
                      {truck.icon} {truck.name}
                    </h3>
                    <p className="text-gray-300 mb-2">
                      {truck.cuisine} • {truck.city}
                    </p>
                    <p className="text-sm text-gray-400">{truck.description}</p>
                  </div>
                  <button
                    className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition font-semibold ml-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClaim(truck);
                    }}
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
