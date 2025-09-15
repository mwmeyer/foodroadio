"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import dynamic from "next/dynamic";
import type { LeafletMapRef } from "@repo/ui";

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

interface MapWrapperProps {
  trucks: FoodTruck[];
  selectedTruck?: FoodTruck | null;
  onTruckClick?: (truck: FoodTruck) => void;
  onMapClick?: () => void;
  className?: string;
}

const MapWrapper = forwardRef<LeafletMapRef, MapWrapperProps>((props, ref) => {
  const [LeafletMap, setLeafletMap] = useState<React.ComponentType<
    MapWrapperProps & { ref?: React.Ref<LeafletMapRef> }
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const leafletMapRef = useRef<LeafletMapRef>(null);

  // Load the component dynamically
  useEffect(() => {
    const loadComponent = async () => {
      try {
        const mod = await import("@repo/ui");
        setLeafletMap(
          () =>
            mod.LeafletMap as React.ComponentType<
              MapWrapperProps & { ref?: React.Ref<LeafletMapRef> }
            >,
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load LeafletMap:", error);
        setIsLoading(false);
      }
    };

    loadComponent();
  }, []);

  // Expose methods through ref
  useImperativeHandle(
    ref,
    () => ({
      flyTo: (lat: number, lng: number, zoom: number = 14) => {
        if (leafletMapRef.current) {
          leafletMapRef.current.flyTo(lat, lng, zoom);
        }
      },
      fitBounds: (trucks: FoodTruck[]) => {
        if (leafletMapRef.current) {
          leafletMapRef.current.fitBounds(trucks);
        }
      },
    }),
    [],
  );

  if (isLoading || !LeafletMap) {
    return (
      <div
        className={
          props.className ||
          "absolute top-0 left-0 w-full h-full z-[1] bg-gray-800"
        }
      />
    );
  }

  return React.createElement(
    LeafletMap as React.ComponentType<any>,
    {
      ...props,
      ref: leafletMapRef,
    } as MapWrapperProps & { ref: React.RefObject<LeafletMapRef> },
  );
});

MapWrapper.displayName = "MapWrapper";

export default MapWrapper;
