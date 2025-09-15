"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { Map as LeafletMapType, Marker } from "leaflet";

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

interface LeafletMapProps {
  trucks: FoodTruck[];
  selectedTruck?: FoodTruck | null;
  onTruckClick?: (truck: FoodTruck) => void;
  onMapClick?: () => void;
  className?: string;
}

export interface LeafletMapRef {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  fitBounds: (trucks: FoodTruck[]) => void;
}

const LeafletMapComponent = forwardRef<LeafletMapRef, LeafletMapProps>(
  ({ trucks, selectedTruck, onTruckClick, onMapClick, className }, ref) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LeafletMapType | null>(null);
    const markersRef = useRef<{ [key: number]: Marker }>({});
    const leafletRef = useRef<any>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      flyTo: (lat: number, lng: number, zoom: number = 14) => {
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], zoom, { duration: 1 });
        }
      },
      fitBounds: (trucks: FoodTruck[]) => {
        if (mapRef.current && trucks.length > 0 && leafletRef.current) {
          const bounds = leafletRef.current.latLngBounds(
            trucks.map((t: FoodTruck) => [t.lat, t.lng]),
          );
          mapRef.current.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 14,
          });
        }
      },
    }));

    // Initialize map
    useEffect(() => {
      if (!mapContainerRef.current) return;

      const container = mapContainerRef.current;

      // Clean up any existing map instance
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.warn("Error removing existing map:", e);
        }
        mapRef.current = null;
      }

      // Clear container and reset Leaflet state
      container.innerHTML = "";
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      const initMap = async () => {
        try {
          // Make sure container is still available
          if (!mapContainerRef.current) return;

          // Dynamic import to avoid SSR issues
          const L = await import("leaflet");
          leafletRef.current = L;

          // Fix default marker icons
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          });

          // Double check container is clean before creating map
          if ((container as any)._leaflet_id) {
            console.warn("Container still has leaflet ID, forcing cleanup");
            delete (container as any)._leaflet_id;
            container.innerHTML = "";
          }

          const map = L.map(container, {
            zoomControl: false,
            attributionControl: false,
          }).setView([39.8283, -98.5795], 4.5);

          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
            {
              maxZoom: 19,
            },
          ).addTo(map);

          mapRef.current = map;
          setIsMapReady(true);
          console.log("LeafletMap: Map initialized successfully");

          // Handle map clicks
          map.on("click", () => {
            onMapClick?.();
          });
        } catch (error) {
          console.error("Failed to initialize map:", error);
          // Clear any partial state on error
          if (mapContainerRef.current) {
            mapContainerRef.current.innerHTML = "";
            delete (mapContainerRef.current as any)._leaflet_id;
          }
          mapRef.current = null;
          leafletRef.current = null;
        }
      };

      const timeoutId = setTimeout(initMap, 50); // Small delay to ensure DOM is ready

      // Cleanup
      return () => {
        clearTimeout(timeoutId);

        // Clear existing markers first
        Object.values(markersRef.current).forEach((marker) => {
          try {
            marker.remove();
          } catch (e) {
            console.warn("Error removing marker:", e);
          }
        });
        markersRef.current = {};

        if (mapRef.current) {
          try {
            mapRef.current.remove();
          } catch (e) {
            console.warn("Error removing map:", e);
          }
          mapRef.current = null;
        }

        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = "";
          delete (mapContainerRef.current as any)._leaflet_id;
        }

        leafletRef.current = null;
        setIsMapReady(false);
      };
    }, [onMapClick]);

    // Update markers when trucks or selection changes
    useEffect(() => {
      console.log(
        "LeafletMap: trucks changed",
        trucks.length,
        "selected:",
        selectedTruck?.id,
        "mapReady:",
        isMapReady,
        "leafletReady:",
        !!leafletRef.current,
      );

      if (!isMapReady || !mapRef.current) {
        console.log("LeafletMap: Map not ready yet, skipping marker update");
        return;
      }

      const updateMarkers = async () => {
        // Ensure we have Leaflet loaded
        let L = leafletRef.current;
        if (!L) {
          console.log("LeafletMap: Leaflet not loaded yet, loading...");
          try {
            L = await import("leaflet");
            leafletRef.current = L;
          } catch (error) {
            console.error(
              "LeafletMap: Failed to load Leaflet for markers:",
              error,
            );
            return;
          }
        }

        // Clear existing markers
        Object.values(markersRef.current).forEach((marker) => {
          try {
            marker.remove();
          } catch (e) {
            console.warn("LeafletMap: Error removing marker:", e);
          }
        });
        markersRef.current = {};

        console.log(
          "LeafletMap: Creating markers for",
          trucks.length,
          "trucks",
        );

        // Add new markers
        trucks.forEach((truck) => {
          const isActive = selectedTruck?.id === truck.id;

          const customIcon = L.divIcon({
            className: `food-truck-icon truck-${truck.id} ${
              isActive ? "active" : ""
            }`,
            html: truck.icon,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });

          const marker = L.marker([truck.lat, truck.lng], { icon: customIcon });
          marker.addTo(mapRef.current!);

          marker.on("click", () => {
            onTruckClick?.(truck);
          });

          markersRef.current[truck.id] = marker;
          console.log(
            "LeafletMap: Created marker for",
            truck.name,
            "at",
            truck.lat,
            truck.lng,
          );
        });
      };

      updateMarkers();
    }, [trucks, selectedTruck, onTruckClick, isMapReady]);

    return (
      <div
        ref={mapContainerRef}
        className={className || "absolute top-0 left-0 w-full h-full z-[1]"}
        style={{ filter: "brightness(0.7)" }}
      />
    );
  },
);

LeafletMapComponent.displayName = "LeafletMapComponent";

export default LeafletMapComponent;
