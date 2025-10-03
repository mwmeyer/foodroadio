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
}

interface Review {
  id: number;
  truckId: number;
  truckName: string;
  eaterId: string;
  eaterName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function EaterPortal() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [eaterName, setEaterName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [loginName, setLoginName] = useState("");
  const [availableTrucks, setAvailableTrucks] = useState<FoodTruck[]>([]);
  const [isNewTruck, setIsNewTruck] = useState(false);

  // Review form state - includes truck details for upsert
  const [reviewForm, setReviewForm] = useState({
    existingTruckId: 0,
    truckName: "",
    truckCuisine: "",
    truckCity: "",
    truckLat: 0,
    truckLng: 0,
    truckIcon: "🍽️",
    truckDescription: "",
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    const eaterId = localStorage.getItem("eaterId");
    const storedEaterName = localStorage.getItem("eaterName");
    
    if (eaterId && storedEaterName) {
      setIsAuthenticated(true);
      setEaterName(storedEaterName);
      loadEaterData(eaterId);
    }
    setIsLoading(false);
  }, []);

  const loadEaterData = (eaterId: string) => {
    const allReviews = JSON.parse(localStorage.getItem("truckReviews") || "[]");
    const eaterReviews = allReviews.filter((review: Review) => review.eaterId === eaterId);
    setMyReviews(eaterReviews);

    const customTrucks = JSON.parse(localStorage.getItem("customTrucks") || "[]");
    import("../../data/foodTruckData.json").then((data) => {
      const allTrucks = [...data.default, ...customTrucks];
      setAvailableTrucks(allTrucks);
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginName.trim()) {
      const eaterId = `eater_${Date.now()}`;
      localStorage.setItem("eaterId", eaterId);
      localStorage.setItem("eaterName", loginName);
      setEaterName(loginName);
      setIsAuthenticated(true);
      loadEaterData(eaterId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("eaterId");
    localStorage.removeItem("eaterName");
    setIsAuthenticated(false);
    setEaterName("");
    setMyReviews([]);
  };

  const upsertTruck = (truckData: any, eaterId: string): number => {
    const customTrucks = JSON.parse(localStorage.getItem("customTrucks") || "[]");
    
    const existingTruck = customTrucks.find(
      (t: any) => 
        t.name.toLowerCase() === truckData.name.toLowerCase() && 
        t.city.toLowerCase() === truckData.city.toLowerCase()
    );

    if (existingTruck) {
      return existingTruck.id;
    } else {
      const newTruck = {
        id: Date.now(),
        name: truckData.name,
        cuisine: truckData.cuisine,
        city: truckData.city,
        lat: truckData.lat,
        lng: truckData.lng,
        icon: truckData.icon,
        description: truckData.description,
        addedBy: "eater",
        eaterId,
        createdAt: new Date().toISOString(),
      };

      customTrucks.push(newTruck);
      localStorage.setItem("customTrucks", JSON.stringify(customTrucks));
      return newTruck.id;
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    const eaterId = localStorage.getItem("eaterId");
    if (!eaterId) return;

    let truckId: number;
    let truckName: string;

    if (isNewTruck) {
      truckId = upsertTruck({
        name: reviewForm.truckName,
        cuisine: reviewForm.truckCuisine,
        city: reviewForm.truckCity,
        lat: reviewForm.truckLat,
        lng: reviewForm.truckLng,
        icon: reviewForm.truckIcon,
        description: reviewForm.truckDescription,
      }, eaterId);
      truckName = reviewForm.truckName;
    } else {
      if (!reviewForm.existingTruckId) {
        alert("Please select a truck or choose to add a new one");
        return;
      }
      truckId = reviewForm.existingTruckId;
      const selectedTruck = availableTrucks.find(t => t.id === truckId);
      truckName = selectedTruck?.name || "";
    }

    const allReviews = JSON.parse(localStorage.getItem("truckReviews") || "[]");
    const newReview: Review = {
      id: Date.now(),
      truckId,
      truckName,
      eaterId,
      eaterName,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      createdAt: new Date().toISOString(),
    };

    allReviews.push(newReview);
    localStorage.setItem("truckReviews", JSON.stringify(allReviews));

    setReviewForm({
      existingTruckId: 0,
      truckName: "",
      truckCuisine: "",
      truckCity: "",
      truckLat: 0,
      truckLng: 0,
      truckIcon: "🍽️",
      truckDescription: "",
      rating: 5,
      comment: "",
    });
    setIsNewTruck(false);
    setShowReviewModal(false);
    loadEaterData(eaterId);
    
    alert("Review added successfully!");
  };

  const handleDeleteReview = (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    const allReviews = JSON.parse(localStorage.getItem("truckReviews") || "[]");
    const updatedReviews = allReviews.filter((review: Review) => review.id !== reviewId);
    localStorage.setItem("truckReviews", JSON.stringify(updatedReviews));

    const eaterId = localStorage.getItem("eaterId");
    if (eaterId) {
      loadEaterData(eaterId);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🍽️ FoodRoadio</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Eater Portal</h2>
            <p className="text-gray-600">Share your food truck experiences</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-lg"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => router.push("/")}
              className="text-green-600 hover:text-green-700 font-medium block"
            >
              ← Back to Main App
            </button>
            <button
              onClick={() => router.push("/operator")}
              className="text-blue-600 hover:text-blue-700 font-medium block"
            >
              Are you an operator? →
            </button>
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Eaters can:</strong> Write reviews for any food truck. 
              If the truck doesn&apos;t exist yet, it will be added automatically!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🍽️ FoodRoadio Eater Portal</h1>
            <p className="text-gray-400">Welcome, {eaterName}!</p>
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
        <div className="mb-8">
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-6 py-3 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition font-semibold shadow-lg text-lg"
          >
            ⭐ Write a Review
          </button>
          <p className="text-gray-400 text-sm mt-2">
            Review any truck - we&apos;ll add it if it doesn&apos;t exist yet!
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">My Reviews ({myReviews.length})</h2>
          {myReviews.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold mb-2">No Reviews Yet</h3>
              <p className="text-gray-400 mb-6">
                Share your experience and help others discover great food trucks!
              </p>
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-6 py-3 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition font-semibold"
              >
                Write Your First Review
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myReviews.map((review) => (
                <div key={review.id} className="bg-gray-800 rounded-lg p-6 shadow-lg relative">
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-300"
                    title="Delete review"
                  >
                    ✕
                  </button>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{review.truckName}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-2xl ${
                                star <= review.rating ? "text-yellow-400" : "text-gray-600"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-gray-400 text-sm">
                          {review.rating}/5
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{review.comment}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Write a Review</h2>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setIsNewTruck(false);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Food Truck</label>
                <select
                  value={isNewTruck ? "new" : reviewForm.existingTruckId}
                  onChange={(e) => {
                    if (e.target.value === "new") {
                      setIsNewTruck(true);
                      setReviewForm({ ...reviewForm, existingTruckId: 0 });
                    } else {
                      setIsNewTruck(false);
                      setReviewForm({ ...reviewForm, existingTruckId: parseInt(e.target.value) });
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 text-white"
                  required
                >
                  <option value="">Choose a truck...</option>
                  {availableTrucks.map((truck) => (
                    <option key={truck.id} value={truck.id}>
                      {truck.icon} {truck.name} - {truck.city}
                    </option>
                  ))}
                  <option value="new">➕ Add a New Truck</option>
                </select>
              </div>

              {isNewTruck && (
                <div className="border-2 border-green-600 rounded-lg p-4 space-y-4">
                  <h3 className="text-lg font-semibold text-green-400">New Truck Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Truck Name *</label>
                    <input
                      type="text"
                      value={reviewForm.truckName}
                      onChange={(e) => setReviewForm({ ...reviewForm, truckName: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                      required={isNewTruck}
                      placeholder="e.g., Amazing Tacos Truck"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Cuisine *</label>
                      <input
                        type="text"
                        value={reviewForm.truckCuisine}
                        onChange={(e) => setReviewForm({ ...reviewForm, truckCuisine: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                        required={isNewTruck}
                        placeholder="e.g., Mexican"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <input
                        type="text"
                        value={reviewForm.truckCity}
                        onChange={(e) => setReviewForm({ ...reviewForm, truckCity: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                        required={isNewTruck}
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
                        value={reviewForm.truckLat}
                        onChange={(e) => setReviewForm({ ...reviewForm, truckLat: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                        required={isNewTruck}
                        placeholder="34.0522"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Longitude *</label>
                      <input
                        type="number"
                        step="any"
                        value={reviewForm.truckLng}
                        onChange={(e) => setReviewForm({ ...reviewForm, truckLng: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                        required={isNewTruck}
                        placeholder="-118.2437"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Icon/Emoji *</label>
                    <select
                      value={reviewForm.truckIcon}
                      onChange={(e) => setReviewForm({ ...reviewForm, truckIcon: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                      required={isNewTruck}
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
                      value={reviewForm.truckDescription}
                      onChange={(e) => setReviewForm({ ...reviewForm, truckDescription: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                      required={isNewTruck}
                      placeholder="Brief description of the truck..."
                    />
                  </div>

                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-sm">
                    <p className="text-green-300">
                      💡 <strong>Tip:</strong> Use{" "}
                      <a
                        href="https://www.latlong.net/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-green-200"
                      >
                        latlong.net
                      </a>
                      {" "}to find coordinates
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Your Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-4xl transition ${
                        star <= reviewForm.rating
                          ? "text-yellow-400 hover:text-yellow-300"
                          : "text-gray-600 hover:text-gray-500"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-gray-400 self-center ml-2">
                    {reviewForm.rating}/5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Review *</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 text-white"
                  required
                  placeholder="Share your experience... What did you love? What could be better?"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition font-semibold"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setIsNewTruck(false);
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
