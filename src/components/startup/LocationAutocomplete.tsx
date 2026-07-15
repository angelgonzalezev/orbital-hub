'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';

export interface StartupLocation {
  city: string;
  country: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
}

interface PhotonFeature {
  properties: {
    name?: string;
    state?: string;
    country?: string;
    countrycode?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface LocationAutocompleteProps {
  value?: StartupLocation;
  hasError?: boolean;
  onSelect: (location: StartupLocation | null) => void;
}

const formatSuggestion = (feature: PhotonFeature) =>
  [feature.properties.name, feature.properties.state, feature.properties.country].filter(Boolean).join(', ');

// City search backed by Photon (photon.komoot.io), a free OpenStreetMap
// geocoder — no API key. Picking a suggestion captures the coordinates too,
// so a future world map never needs to geocode after the fact.
const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ value, hasError, onSelect }) => {
  const [query, setQuery] = useState(value?.city && value?.country ? `${value.city}, ${value.country}` : '');
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const search = (text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    if (text.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=5&lang=en&layer=city`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data = (await response.json()) as { features?: PhotonFeature[] };
        const cities = (data.features || []).filter((f) => f.properties.name && f.properties.country);
        setSuggestions(cities);
        setOpen(cities.length > 0);
      } catch {
        // Suggestions are best-effort; network hiccups just show nothing.
      }
    }, 300);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setQuery(text);
    // Any edit invalidates the previous pick so the stored city/coordinates
    // never drift from what the input shows.
    onSelect(null);
    search(text);
  };

  const handlePick = (feature: PhotonFeature) => {
    const [longitude, latitude] = feature.geometry.coordinates;
    const location: StartupLocation = {
      city: feature.properties.name!,
      country: feature.properties.country!,
      ...(feature.properties.countrycode ? { countryCode: feature.properties.countrycode } : {}),
      latitude,
      longitude,
    };
    setQuery(`${location.city}, ${location.country}`);
    setSuggestions([]);
    setOpen(false);
    onSelect(location);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        name="location"
        value={query}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Start typing a city…"
        autoComplete="off"
        className={cn(
          'w-full rounded-2xl border bg-black px-4 py-3.5 text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 sm:px-5 sm:py-4',
          hasError ? 'border-red-500/50' : 'border-white/10',
        )}
      />
      {open && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-xl">
          {suggestions.map((feature, index) => (
            <li key={`${formatSuggestion(feature)}-${index}`}>
              <button
                type="button"
                onClick={() => handlePick(feature)}
                className="w-full px-4 py-3 text-left text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white">
                {formatSuggestion(feature)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
