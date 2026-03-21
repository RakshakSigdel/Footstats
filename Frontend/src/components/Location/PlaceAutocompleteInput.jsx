import { useEffect, useRef, useState } from "react";
import { searchPlaces } from "../../services/api.locations";

const DEBOUNCE_MS = 300;

export default function PlaceAutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder = "Search location",
  className = "",
  required = false,
}) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const query = String(value || "").trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const places = await searchPlaces(query, 20);
        setResults(places);
        setOpen(true);
      } catch (err) {
        setError(err?.message || "Failed to search places");
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  const handleSelect = (place) => {
    onChange(place.displayName);
    onSelect(place);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          onSelect(null);
          setOpen(true);
        }}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2"
      />

      {loading && <p className="mt-1 text-xs text-gray-500">Searching places...</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {open && results.length > 0 && (
        <div
          className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-white shadow-lg"
          onWheel={(event) => event.stopPropagation()}
        >
          {results.map((place) => (
            <button
              key={place.placeId}
              type="button"
              onClick={() => handleSelect(place)}
              className="w-full border-b border-gray-100 px-3 py-2 text-left hover:bg-gray-50"
            >
              <p className="text-sm font-medium text-gray-900 line-clamp-1">{place.displayName}</p>
              <p className="text-xs text-gray-500">
                {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
